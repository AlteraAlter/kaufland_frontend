import { WS_ENDPOINTS } from "../../core/config.js";
import { createWebSocket } from "../../services/socket.js";

export function initCheckProgressSocket({
    jobId,
    onOpen,
    onMessage,
    onClose,
    onError,
} = {}) {
    const path = `${WS_ENDPOINTS.checkerProgress}/${String(jobId || "").replace(/^\/+|\/+$/g, "")}`;
    return createWebSocket(
        path,
        {
            onOpen: (event, ws) => {
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
            },
        }
    );
}
