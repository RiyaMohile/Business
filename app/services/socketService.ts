import { io, Socket } from "socket.io-client";

/**
 * Real-time channel to the backend (web counterpart of the app's
 * SocketService). Notifies listeners whenever the server reports an order
 * change, and once after every (re)connect so anything missed while offline
 * is picked up.
 */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

type Listener = () => void;

let socket: Socket | null = null;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("[Socket] listener error", e);
    }
  });
};

export const connectSocket = () => {
  if (typeof window === "undefined") return;

  if (socket) {
    if (!socket.connected) socket.connect();
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) return;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("[Socket] connected");
    notify();
  });
  socket.on("order:new", (data) => {
    console.log("[Socket] order:new", data);
    notify();
  });
  socket.on("order:updated", (data) => {
    console.log("[Socket] order:updated", data);
    notify();
  });
  socket.on("disconnect", () => console.log("[Socket] disconnected"));
  socket.on("connect_error", (e) =>
    console.log("[Socket] connect error:", e.message)
  );
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket?.removeAllListeners();
  socket = null;
};

/** Subscribe to order events. Returns an unsubscribe function. */
export const onOrderEvent = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
