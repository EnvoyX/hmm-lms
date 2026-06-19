// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import s3Client from "~/lib/s3-client";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entityType = formData.get("entityType") as string; // e.g., "tryout", "course"
    const entityId = formData.get("entityId") as string;
    const questionNumber = formData.get("questionNumber") as string | null;

    // Build systematic path
    let key: string;
    if (questionNumber) {
      key = `${entityType}/${entityId}/${questionNumber}/${randomUUID()}-${file.name.replace(/\s/g, "_")}`;
    } else {
      key = `${entityType}/${entityId}/${randomUUID()}-${file.name.replace(/\s/g, "_")}`;
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        ACL: "public-read",
      },
    });

    const uploadResult = await upload.done();

    return NextResponse.json({
      key: uploadResult.Key,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      CDNurl: uploadResult.Location
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
