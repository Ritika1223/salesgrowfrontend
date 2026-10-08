import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { API_AUTH, API_BASE, getApiOrigin } from "../config/api";
import { getToken, authJsonHeaders } from "./auth";

const ACTIVE_PEER_KEY = "chat_active_peer";
const ACTIVE_GROUP_KEY = "chat_active_group";

/** Set to true later to ask the browser for notification permission on login. */
export const ENABLE_CHAT_NOTIFICATION_PROMPT = true;

/**
 * Browser permission popup lives here only.
 * Turn on with ENABLE_CHAT_NOTIFICATION_PROMPT = true, or call this yourself.
 */
export async function requestChatNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

let socket = null;
let started = false;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function setActiveChatPeer(peerId) {
  try {
    if (peerId) sessionStorage.setItem(ACTIVE_PEER_KEY, String(peerId));
    else sessionStorage.removeItem(ACTIVE_PEER_KEY);
  } catch {
    /* ignore */
  }
}

export function setActiveChatGroup(groupId) {
  try {
    if (groupId) sessionStorage.setItem(ACTIVE_GROUP_KEY, String(groupId));
    else sessionStorage.removeItem(ACTIVE_GROUP_KEY);
  } catch {
    /* ignore */
  }
}

function isViewingThisChat(payload) {
  try {
    if (payload?.groupId) {
      return sessionStorage.getItem(ACTIVE_GROUP_KEY) === String(payload.groupId);
    }
    if (payload?.senderId) {
      return sessionStorage.getItem(ACTIVE_PEER_KEY) === String(payload.senderId);
    }
  } catch {
    /* ignore */
  }
  return false;
}

function showBrowserNotification(payload) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden && isViewingThisChat(payload)) return;

  const n = new Notification(payload.senderName || "New message", {
    body: payload.preview || "You have a new message",
    tag: payload.groupId ? `group-${payload.groupId}` : `chat-${payload.senderId}`,
    icon: "/assets/img/favicon.png",
  });
  n.onclick = () => {
    window.focus();
    const url = payload.groupId ? "/chat" : `/chat?peer=${payload.senderId}`;
    if (window.location.pathname !== "/chat") {
      window.location.href = url;
    } else if (payload.senderId) {
      window.dispatchEvent(
        new CustomEvent("open-chat-peer", { detail: { peerId: payload.senderId } })
      );
    }
    n.close();
  };
}

async function registerPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const keyRes = await fetch(`${API_AUTH}/push/vapid-public-key`);
    if (!keyRes.ok) return;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    await fetch(`${API_AUTH}/push/subscribe`, {
      method: "POST",
      headers: authJsonHeaders(),
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
  } catch (err) {
    console.warn("Push subscribe skipped:", err?.message || err);
  }
}

export async function startChatNotifications() {
  if (started) return;
  const token = getToken();
  if (!token) return;
  started = true;

  if (ENABLE_CHAT_NOTIFICATION_PROMPT) {
    await requestChatNotificationPermission();
  }

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    await registerPush();
  }

  const origin = getApiOrigin(API_BASE);
  socket = io(origin, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.on("new_message", (payload) => {
    showBrowserNotification(payload);
    if (!isViewingThisChat(payload)) {
      toast(`${payload.senderName || "Someone"}: ${payload.preview || "New message"}`);
    }
    window.dispatchEvent(new CustomEvent("chat-new-message", { detail: payload }));
  });

  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "OPEN_CHAT" && event.data.peerId) {
      window.dispatchEvent(
        new CustomEvent("open-chat-peer", { detail: { peerId: event.data.peerId } })
      );
      if (window.location.pathname !== "/chat") {
        window.location.href = event.data.url || `/chat?peer=${event.data.peerId}`;
      }
    }
  });
}

export function stopChatNotifications() {
  started = false;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
