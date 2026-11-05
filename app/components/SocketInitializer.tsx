"use client";

import { useEffect } from "react";
import { connectSocket } from "../services/socketService";

export default function SocketInitializer() {
  useEffect(() => {
    connectSocket();

    // Browsers may drop idle sockets in background tabs; reconnect on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") connectSocket();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return null;
}
