"use client";

import { useEffect } from "react";
import { getMessaging, onMessage, isSupported } from "firebase/messaging";
import { app } from "@/lib/firebase";

export default function ForegroundNotification() {
  useEffect(() => {
    const setupMessaging = async () => {
      if (!(await isSupported())) {
        console.log("Firebase Messaging not supported");
        return;
      }

      const messaging = getMessaging(app);

      onMessage(messaging, (payload) => {
        console.log("Foreground FCM message:", payload);

        const notification = payload.notification || {};
        const data = payload.data || {};

        const title = notification.title || data.title || "New Notification";
        const body = notification.body || data.body || "You have a new update";
        const url = data.url || "/";

        if (Notification.permission === "granted") {
          const notif = new Notification(title, {
            body,
            icon: "/logo.png",
            tag: "new-product", 
          });

          notif.onclick = () => {
            window.open(url, "_blank");
            notif.close();
          };
        }
      });
    };

    setupMessaging();

  }, []);

  return null;
}