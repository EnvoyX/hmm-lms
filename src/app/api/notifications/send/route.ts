// src/app/api/notifications/send/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth } from '~/server/auth';
import { db } from "~/server/db";
import webpush from "web-push";
import { env } from "~/env";
import { Role } from "@prisma/client";

// Configure web-push
webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== Role.ADMIN && user?.role !== Role.SUPERADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json() as {
      title: string;
      body: string;
      url?: string;
      type: string;
      targetType: "all" | "course" | "user";
      targetId?: string; // courseId or userId based on targetType
    };

    const { title, body: messageBody, url, type, targetType, targetId } = body;

    let subscriptions = [];

    // Determine target subscriptions based on targetType
    switch (targetType) {
      case "all":
        subscriptions = await db.pushSubscription.findMany();
        break;

      case "course":
        if (!targetId) {
          return NextResponse.json(
            { error: "Course ID required" },
            { status: 400 },
          );
        }
        const course = await db.course.findUnique({
          where: { id: targetId },
          include: {
            members: {
              include: {
                pushSubscriptions: true,
              },
            },
          },
        });
        subscriptions =
          course?.members.flatMap((m) => m.pushSubscriptions) ?? [];
        break;

      case "user":
        if (!targetId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 },
          );
        }
        subscriptions = await db.pushSubscription.findMany({
          where: { userId: targetId },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid target type" },
          { status: 400 },
        );
    }

    // Send notifications
    const payload = JSON.stringify({
      title,
      body: messageBody,
      url: url ?? "/",
      type,
      timestamp: Date.now(),
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        ),
      ),
    );

    // Clean up failed subscriptions
    const failedIndices: number[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const error = result.reason as webpush.WebPushError;
        // 410 Gone - subscription expired
        if (error.statusCode === 410) {
          failedIndices.push(index);
        }
      }
    });

    if (failedIndices.length > 0) {
      const failedEndpoints = failedIndices.map(
        (i) => subscriptions[i]?.endpoint ?? "",
      );
      await db.pushSubscription.deleteMany({
        where: {
          endpoint: { in: failedEndpoints },
        },
      });
    }

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
