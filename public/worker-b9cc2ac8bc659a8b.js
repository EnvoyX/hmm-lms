(() => {
  "use strict";
  (self.addEventListener("activate", (t) => {
    t.waitUntil(self.clients.claim());
  }),
    self.addEventListener("push", function (t) {
      let i;
      if (!t.data) return;
      try {
        i = t.data.json();
      } catch (n) {
        i = { title: "Notification", body: t.data.text(), url: "/" };
      }
      let n = {
        body: i.body,
        icon: "/icons/icon-512x512.png",
        badge: "/icons/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
          url: i.url || "/",
          type: i.type,
        },
        actions: [
          { action: "view", title: "View", icon: "/icons/checkmark.png" },
          { action: "close", title: "Close", icon: "/icons/xmark.png" },
        ],
        tag: i.tag || "default",
        renotify: !0,
      };
      t.waitUntil(self.registration.showNotification(i.title, n));
    }),
    self.addEventListener("notificationclick", (t) => {
      t.notification.close();
      let i = new URL(t.notification.data?.url || "/", self.location.origin)
        .href;
      t.waitUntil(
        clients
          .matchAll({ type: "window", includeUncontrolled: !0 })
          .then((t) => {
            for (let n of t) if (n.url === i && "focus" in n) return n.focus();
            if (clients.openWindow) return clients.openWindow(i);
          }),
      );
    }));
})();
