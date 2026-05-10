import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  const socketRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    if (user?.role === "admin") {
      socketRef.current.emit("join_admin");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const joinOrderRoom = (orderId) => {
    if (socketRef.current) {
      socketRef.current.emit("join_order_room", orderId);
    }
  };

  const onEvent = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const offEvent = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return { socket: socketRef.current, joinOrderRoom, onEvent, offEvent };
};
