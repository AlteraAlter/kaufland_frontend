import { WS_ENDPOINTS } from "../../core/config.js";
import { createWebSocket } from "../../services/socket.js";

export function initUploadProgressSocket({
    jobId,
    onOpen,
    onMessage,
    onClose,
    onError,
} = {}) {
    const token = localStorage.getItem("jwt_access");
    const socket = createWebSocket(
        WS_ENDPOINTS.uploadProgress,
        {
            onOpen: (event, ws) => {
                console.log("connection succesfull");
                if (typeof onOpen === "function") onOpen(event, ws);
            },
            onMessage: (event, ws) => {
                if (typeof onMessage === "function") onMessage(event, ws);
                console.log(`[message] Datas received from server: ${event.data}`);
            },
            onError: (event, ws) => {
                if (typeof onError === "function") onError(event, ws);
            },
            onClose: (event, ws) => {
                console.log(`[close] Connection close`);
                if (typeof onClose === "function") onClose(event, ws);
            },
        },
        {
            params: token ? { token } : undefined,
            suffix: jobId,
        }
    );
    console.log(socket);
    return socket;
}
