import { useEffect } from "react";
import { useApiConnection } from "../api";

export function useEvent<T>(event: string, callback: (data: T) => void): void {
    const connected = useApiConnection();

    useEffect(() => {
        if (connected) {
            const socket = new WebSocket(
                window.location.protocol === "https:"
                    ? "wss"
                    : "ws" +
                      "://" +
                      window.location.host +
                      "/api/events/" +
                      event
            );

            socket.addEventListener("message", (ev) =>
                callback(JSON.parse(ev.data))
            );

            return () => socket.close(1000, "Listener update");
        }
    }, [event, callback, connected]);
}
