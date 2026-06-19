// src/hooks/use-notifications.ts
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { env } from "~/env";

const isDev = process.env.NODE_ENV !== "production";

function logDebug(message: string, context?: unknown) {
  if (!isDev) return;
  if (context === undefined) {
    console.info(message);
    return;
  }
  console.info(message, context);
}

function logError(message: string, error: unknown) {
  if (isDev) {
    console.error(message, error);
  }
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = ua.includes("Android");
  const isChrome = ua.includes("Chrome") && !ua.includes("Edge");
  const isFirefox = ua.includes("Firefox");
  const isSafari = ua.includes("Safari") && !ua.includes("Chrome");
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;

  return {
    userAgent: ua,
    isIOS,
    isAndroid,
    isChrome,
    isFirefox,
    isSafari,
    isInStandaloneMode,
    isMobile: isIOS || isAndroid,
  };
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.active) return reg;
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    if (ready?.active) return ready;
    return reg ?? null;
  } catch {
    return null;
  }
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [subscriptionCheckDone, setSubscriptionCheckDone] = useState(false);
  const [hasActiveServiceWorker, setHasActiveServiceWorker] = useState<boolean | null>(null);

  useEffect(() => {
    const browserInfo = getBrowserInfo();
    const hasNotification = "Notification" in window;
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;

    const supported = hasNotification && hasServiceWorker && hasPushManager;

    logDebug("Notification support check", {
      browserInfo,
      hasNotification,
      hasServiceWorker,
      hasPushManager,
      supported,
      permission: Notification.permission,
    });

    let debugMsg = `Browser: ${browserInfo.isIOS ? "iOS Safari" : browserInfo.isAndroid ? "Android" : "Desktop"}\n`;
    debugMsg += `Standalone: ${browserInfo.isInStandaloneMode ? "Yes" : "No"}\n`;
    debugMsg += `Notification API: ${hasNotification ? "✓" : "✗"}\n`;
    debugMsg += `Service Worker: ${hasServiceWorker ? "✓" : "✗"}\n`;
    debugMsg += `Push Manager: ${hasPushManager ? "✓" : "✗"}`;

    setDebugInfo(debugMsg);
    setIsSupported(supported);

    if (hasNotification) {
      setPermission(Notification.permission);
    }

    if (browserInfo.isIOS && !browserInfo.isInStandaloneMode) {
      logDebug("iOS detected: push notifications require standalone mode");
    }

    if (!supported) {
      setSubscriptionCheckDone(true);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!isSupported) return;
    setSubscriptionCheckDone(false);
    try {
      const reg = await getServiceWorkerRegistration();
      const swOk = Boolean(reg?.active);
      setHasActiveServiceWorker(swOk);

      if (!reg) {
        setSubscription(null);
        return;
      }

      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        logDebug("Found existing subscription", sub.endpoint);
        setSubscription(sub);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      logError("Failed to get subscription", error);
    } finally {
      setSubscriptionCheckDone(true);
    }
  }, [isSupported]);

  useEffect(() => {
    if (isSupported) {
      void refreshSubscription();
    }
  }, [isSupported, refreshSubscription]);

  const requestPermission = async () => {
    const browserInfo = getBrowserInfo();

    logDebug("Requesting notification permission", { isSupported, browserInfo });

    if (!isSupported) {
      let errorMsg = "Notifications are not supported in this browser";
      if (browserInfo.isIOS && !browserInfo.isInStandaloneMode) {
        errorMsg = "On iOS, add this app to your home screen first to enable notifications";
      }

      toast.error(errorMsg, { duration: 5000 });
      return false;
    }

    const reg = await getServiceWorkerRegistration();
    if (!reg?.active) {
      toast.error(
        isDev
          ? "No active service worker. Use a production build, or set ENABLE_PWA_IN_DEV in .env for local push testing. See .env.example."
          : "Service worker is not ready yet. Try again in a moment or refresh the page.",
        { duration: 8000 },
      );
      return false;
    }

    try {
      const nextPermission = await Notification.requestPermission();
      logDebug("Notification permission result", nextPermission);

      setPermission(nextPermission);

      if (nextPermission === "granted") {
        await subscribe();
        return true;
      }
      if (nextPermission === "denied") {
        toast.error("Notification permission was denied. Enable it in your browser settings.");
      }
      return false;
    } catch (error) {
      logError("Permission request failed", error);

      if (error instanceof Error) {
        toast.error(`Failed to request permission: ${error.message}`, { duration: 5000 });
      } else {
        toast.error("Failed to enable notifications");
      }

      return false;
    }
  };

  const subscribe = async () => {
    if (isLoading) {
      logDebug("Subscribe skipped because loading is in progress");
      return;
    }

    setIsLoading(true);

    try {
      let registration = await getServiceWorkerRegistration();
      if (!registration?.active) {
        await new Promise((r) => setTimeout(r, 500));
        registration = await getServiceWorkerRegistration();
      }
      if (!registration?.active) {
        toast.error(
          isDev
            ? "No service worker. In development, PWA is off by default—use production or ENABLE_PWA_IN_DEV (see .env.example)."
            : "Service worker not available. Refresh the page and try again.",
          { duration: 8000 },
        );
        return;
      }

      logDebug("Creating push subscription");

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      logDebug("Push subscription created", {
        endpoint: newSubscription.endpoint,
        expirationTime: newSubscription.expirationTime,
      });

      setSubscription(newSubscription);
      setHasActiveServiceWorker(true);

      const subscriptionData = {
        endpoint: newSubscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey("p256dh")!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey("auth")!))),
      };

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError(`Subscription save failed with status ${response.status}`, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = (await response.json()) as { success?: boolean; message?: string };
      logDebug("Subscription saved successfully", result);

      toast.success("Notifications enabled successfully!");
      return newSubscription;
    } catch (error) {
      logError("Subscribe failed", error);

      if (error instanceof Error) {
        toast.error(`Failed to subscribe: ${error.message}`, { duration: 5000 });
      } else {
        toast.error("Failed to enable notifications");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);

    try {
      const reg = await getServiceWorkerRegistration();
      let sub: PushSubscription | null = subscription;
      if (!sub && reg) {
        sub = await reg.pushManager.getSubscription();
      }

      if (!sub) {
        setSubscription(null);
        toast.info("No active push subscription in this browser.");
        return;
      }

      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      logDebug("Push unsubscribed");

      const response = await fetch(
        `/api/notifications/subscribe?endpoint=${encodeURIComponent(endpoint)}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        logDebug("Subscription removed from server");
      }

      setSubscription(null);
      toast.success("Notifications disabled");
    } catch (error) {
      logError("Unsubscribe failed", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const reg = await getServiceWorkerRegistration();
      let sub: PushSubscription | null = subscription;
      if (!sub && reg) {
        sub = await reg.pushManager.getSubscription();
      }

      if (!sub) {
        toast.error("No active subscription found for this browser. Disable and re-enable notifications.");
        return;
      }

      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });

      let data: { success?: boolean; message?: string; error?: string; sent?: number; failed?: number } = {};
      try {
        data = (await response.json()) as { success?: boolean; message?: string; error?: string };
      } catch {
        // ignore
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sign in to send a test notification.");
        } else if (response.status === 404) {
          toast.error("No server-side subscription. Try disabling and enabling notifications again.");
        } else {
          toast.error(data.error ?? data.message ?? `Test failed (HTTP ${response.status})`);
        }
        return;
      }

      if (data.success) {
        logDebug("Test notification sent");
        const sent = data.sent ?? 0;
        const failed = data.failed ?? 0;
        toast.success(failed > 0 ? `Test notification sent (${sent} ok / ${failed} failed).` : "Test notification sent!");
      } else {
        logError("Test notification failed", data.message ?? "Unknown error");
        toast.error(data.message ?? "Failed to send test notification");
      }
    } catch (error) {
      logError("Test notification request failed", error);
      toast.error("Failed to send test notification");
    }
  };

  return {
    isSupported,
    subscription,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscription,
    isLoading,
    setIsLoading,
    testNotification,
    debugInfo,
    subscriptionCheckDone,
    hasActiveServiceWorker: hasActiveServiceWorker === true,
    showServiceWorkerWarning:
      isSupported && subscriptionCheckDone && hasActiveServiceWorker === false,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
