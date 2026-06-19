"use server";

import webpush, { type PushSubscription } from "web-push";
import { env } from "~/env";

// Configure web-push
webpush.setVapidDetails(
  env.VAPID_SUBJECT, // Ensure this is "mailto:email@domain.com" or "https://domain.com"
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type: "announcement" | "event" | "tryout" | "scholarship" | "job" | "course";
  tag?: string;
}

function isValidSubscription(subscription: PushSubscription): boolean {
  return !!(
    subscription?.endpoint &&
    subscription.keys?.p256dh &&
    subscription.keys?.auth
  );
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
  options?: { ttl?: number }
) {
  if (!isValidSubscription(subscription)) {
    return { success: false, error: new Error("Invalid subscription"), shouldDelete: false };
  }
  
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: options?.ttl ?? 60 * 60, // Default to 1 hour
        urgency: 'high',
      }
    );
    return { success: true, shouldDelete: false };
  } catch (error: unknown) {
    console.error("Error sending notification:", error);
    
    if (!(error instanceof webpush.WebPushError)) {
      return { success: false, error: new Error("Unknown error"), shouldDelete: false };
    }
    // Mark subscriptions with 410/404 for deletion
    const shouldDelete = error?.statusCode === 410 || error?.statusCode === 404;
    
    return { success: false, error, shouldDelete };
  }
}

export async function sendNotificationToMultiple(
  subscriptions: PushSubscription[],
  payload: NotificationPayload,
  options: { ttl?: number } = { ttl: 60 } // Default to 1 minute
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendNotification(sub, payload, options)),
  );

  return results.map((result, index) => ({
    subscription: subscriptions[index],
    success: result.status === "fulfilled" && result.value?.success === true,
    shouldDelete: result.status === "fulfilled" && result.value?.shouldDelete === true,
     
    error: result.status === "rejected" ? (result.reason as Error) : 
           (result.status === "fulfilled" && !result.value?.success ? result.value?.error : undefined),
  }));
}
