import { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useNzi } from "@/context/NziContext";

const STUDY_KEY = "nzila_last_study_date";
const NOTIF_KEY = "nzila_streak_notif_date";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useStreakNotification() {
  const { streak } = useGame();
  const { showMessage } = useNzi();

  useEffect(() => {
    const today = todayStr();
    const lastStudy = localStorage.getItem(STUDY_KEY);
    const lastNotif = localStorage.getItem(NOTIF_KEY);
    const hour = new Date().getHours();

    // Only fire once per day, after 19h, when user hasn't studied today
    if (lastStudy === today) return;
    if (lastNotif === today) return;
    if (hour < 19) return;

    localStorage.setItem(NOTIF_KEY, today);

    const msgs =
      streak > 0
        ? [
            `Ei! Não percas a tua sequência de ${streak} dias! 🔥 Faz pelo menos uma lição hoje.`,
            `O teu streak de ${streak} dias está em risco! Vem estudar! ⚡`,
          ]
        : [
            "Que tal começar uma nova sequência hoje? Faz uma lição agora! 📚",
            "Ainda não estudaste hoje. Nzi está à tua espera! 😊",
          ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    // In-app notification via Nzi
    setTimeout(() => showMessage(msg, "determined", 6000), 2000);

    // Web Push Notification (if permission granted)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Nzila — Hora de estudar!", {
        body: msg,
        icon: "/favicon.ico",
        tag: "streak-reminder",
      });
    } else if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("Nzila — Hora de estudar!", {
            body: msg,
            icon: "/favicon.ico",
            tag: "streak-reminder",
          });
        }
      });
    }
  }, [streak, showMessage]);
}

// Call this whenever the user completes any study activity
export function recordStudyToday() {
  localStorage.setItem(STUDY_KEY, todayStr());
}
