// ~/app/api/documents/[id]/route.ts
// ... (imports)
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Role, ResourceType, AccessType, AttachableType } from "@prisma/client";
import s3Client from "~/lib/s3-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: resourceId } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "view";

    // Step 1: Find the resource and its attachment
    const resource = await db.resource.findUnique({
      where: { id: resourceId },
      include: {
        attachment: true,
      },
    });

    // Step 2: Validate the resource and its file
    if (
      !resource ||
      resource.type !== ResourceType.FILE ||
      !resource.attachment
    ) {
      return new NextResponse("Resource not found or is not a file", {
        status: 404,
      });
    }

    if (!resource.isActive) {
      return new NextResponse("Resource is not available", { status: 410 });
    }

    // Step 3: Check permissions by querying the related course
    // This is the key change to fix the error.
    let isEnrolled = false;
    if (resource.attachableType === AttachableType.COURSE) {
      const course = await db.course.findUnique({
        where: { id: resource.attachableId },
        include: {
          members: {
            where: { id: session.user.id },
            select: { id: true },
          },
        },
      });
      isEnrolled = !!course?.members.length;
    }

    const isAdmin = session.user.role === (Role.ADMIN || Role.SUPERADMIN);

    if (!isEnrolled && !isAdmin) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // ... (rest of the code for streaming and logging)
    const getCommand = new GetObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: resource.attachment.key,
    });

    const s3Response = await s3Client.send(getCommand);

    if (!s3Response.Body) {
      return new NextResponse("File not found in storage", { status: 404 });
    }

    await db.resourceAccess.create({
      data: {
        resourceId: resource.id,
        userId: session.user.id,
        action: action === "download" ? AccessType.DOWNLOAD : AccessType.VIEW,
        ipAddress: request.headers.get("x-forwarded-for") ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", resource.attachment.mimeType);
    headers.set("Content-Length", resource.attachment.size.toString());

    if (action === "download") {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${resource.attachment.filename}"`,
      );
    } else {
      headers.set(
        "Content-Disposition",
        `inline; filename="${resource.attachment.filename}"`,
      );
    }

    headers.set("Cache-Control", "private, max-age=3600");
    headers.set("ETag", `"${resource.id}-${resource.updatedAt.getTime()}"`);
    const stream = s3Response.Body.transformToWebStream();
    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("Resource serving error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
