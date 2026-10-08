self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "New message" };
  }

  const title = data.title || "ChatPro";
  const options = {
    body: data.body || "You have a new message",
    icon: "/assets/img/favicon.png",
    badge: "/assets/img/favicon.png",
    tag: data.tag || "chat",
    renotify: true,
    data: {
      url: data.url || "/chat",
      peerId: data.peerId || null,
      groupId: data.groupId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/chat";
  const peerId = event.notification.data?.peerId;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.postMessage({ type: "OPEN_CHAT", peerId, url });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    })
  );
});
