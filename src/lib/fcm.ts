import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase";

export const generateFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const messaging = getMessaging(app);

    const fcmToken = await getToken(messaging, {
      vapidKey:
        "BO-URwp3v1gRO2aRW7mnU6h9WrWzLYvD8fjMfURXXnsqICxo1tIX3e40sfMQwsCxaw9Y10eD26teapRpTQbRRUM",
    });

    console.log("FCM TOKEN:", fcmToken);

    const authToken = localStorage.getItem("token");

    if (!authToken) return;

    await fetch(
      "https://api.3846.in/api/v1/user/save-fcm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fcm_token: fcmToken,
        }),
      }
    );

    console.log("FCM token saved to backend");
  } catch (error) {
    console.log("FCM error:", error);
  }
};