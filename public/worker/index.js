self.__WB_DISABLE_DEV_LOGS = true;

self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-512x512.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || "/",
      type: data.type,
    },
    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
    tag: data.tag || "default",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
