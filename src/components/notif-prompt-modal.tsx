"use client";

import { useEffect, useState } from "react";
import { api } from '~/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { env } from '~/env';

// Helper function to convert a VAPID key to the required format
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationPromptModal() {
  const [showModal, setShowModal] = useState(false);
  const saveSubscription = api.push.saveSubscription.useMutation();

  useEffect(() => {
    // Check if the necessary APIs are available
    if ("Notification" in window && "serviceWorker" in navigator) {
      // No need to wait for the service worker to be ready just to check permission.
      // The permission status is available immediately.
      if (Notification.permission === "default") {
        // It's good practice to wait a moment before showing the prompt.
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 3000); // Show modal after 3 seconds

        return () => clearTimeout(timer); // Cleanup the timer
      }
    }
  }, []);

  const requestPermission = async () => {

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;

        const vapidKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        const { endpoint, keys } = sub.toJSON();
        await saveSubscription.mutateAsync({
          endpoint: endpoint!,
          p256dh: keys?.p256dh ?? "",
          auth: keys?.auth ?? "",
        });

      }
    } catch {
    } finally {
      setShowModal(false);
    }
  };
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Notifications</DialogTitle>
          <DialogDescription>
            Get notified about announcements, events, and updates.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
          >
            Later
          </Button>
          <Button
            onClick={requestPermission}
            disabled={saveSubscription.isPending}
          >
            {saveSubscription.isPending ? "Enabling..." : "Enable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
