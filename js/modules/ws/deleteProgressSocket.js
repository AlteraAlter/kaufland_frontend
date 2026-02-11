import { WS_ENDPOINTS } from "../../core/config.js";
import { createWebSocket } from "../../services/socket.js";

export function initDeleteProgressSocket({
    jobId,
    onOpen,
    onMessage,
    onClose,
    onError,
} = {}) {
    const path = `${WS_ENDPOINTS.deleteProgress}/${String(jobId || "").replace(/^\/+|\/+$/g, "")}`;
    let socket = null;
    let stopped = false;
    let reconnectAttempt = 0;
    let reconnectTimer = null;

    const connect = () => {
        if (stopped) return;
        socket = createWebSocket(path, {
            onOpen: (event, ws) => {
                reconnectAttempt = 0;
                if (typeof onOpen === "function") onOpen(event, ws);
            },
            onMessage: (event, ws) => {
                if (typeof onMessage === "function") onMessage(event, ws);
            },
            onError: (event, ws) => {
                if (typeof onError === "function") onError(event, ws);
            },
            onClose: (event, ws) => {
                if (typeof onClose === "function") onClose(event, ws);
                if (!shouldReconnect(event)) return;
                scheduleReconnect();
            },
        });
    };

    const shouldReconnect = (event) => {
        if (stopped) return false;
        return event?.code !== 1000;
    };

    const scheduleReconnect = () => {
        reconnectAttempt += 1;
        const delay = Math.min(15000, 1000 * Math.pow(2, reconnectAttempt - 1));
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
        }, delay);
    };

    connect();

    return {
        close(code = 1000, reason = "client_close") {
            stopped = true;
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            if (socket) socket.close(code, reason);
        },
        get readyState() {
            return socket ? socket.readyState : WebSocket.CLOSED;
        },
    };
}
