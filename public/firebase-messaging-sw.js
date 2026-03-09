importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "barber-syndicate-e67d6.firebaseapp.com",
  projectId: "barber-syndicate-e67d6",
  messagingSenderId: "669826210783",
  appId: "1:669826210783:web:8e4e4fed89a1ef070d026a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Background Message received: ", payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || "New Notification";
  const options = {
    body: notification.body || data.body || "You have a new message",
    icon: "/logo.png",
    badge: "/badge.png",
    data: {
      url: data.url || "/",          
    },
    vibrate: [200, 100, 200],
    tag: "unique-notification-tag", 
    renotify: true,
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((err) => {
        console.error("Error handling notification click:", err);
        if (clients.openWindow) {
          clients.openWindow(urlToOpen);
        }
      })
  );
});