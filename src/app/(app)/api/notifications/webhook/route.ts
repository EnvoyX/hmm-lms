// src/app/api/notifications/test/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import webpush from "web-push";
import { env } from "~/env";
import { auth } from '~/server/auth';

// Configure web-push
webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscriptions
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscriptions found" },
        { status: 404 },
      );
    }

    const payload = JSON.stringify({
      title: "🔔 Test Notification",
      body: "If you see this, notifications are working!",
      url: "/",
      type: "test",
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

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      message:
        successCount > 0
          ? "Test notification sent successfully!"
          : "Failed to send test notification",
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 },
    );
  }
}
