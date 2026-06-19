"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ServiceWorkerUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        toast("A new version is available!", {
          description: "Click to reload and get the latest updates.",
          action: {
            label: "Reload",
            onClick: () => {
              registration.waiting?.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            },
          },
          duration: Infinity,
        });
      }
    };

    void navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              handleUpdate(registration);
            }
          });
        }
      });
    });
  }, []);

  return null;
}
