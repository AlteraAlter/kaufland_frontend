import { WS_BASE_URL } from "../core/config.js";

export function createWebSocket(path, handlers = {}) {
    const { onOpen, onMessage, onClose, onError } = handlers;
    const socket = new WebSocket(`${WS_BASE_URL}${path}`);

    socket.onopen = (event) => {
        if (typeof onOpen === "function") onOpen(event, socket);
    };

    socket.onmessage = (event) => {
        if (typeof onMessage === "function") onMessage(event, socket);
    };

    socket.onerror = (event) => {
        if (typeof onError === "function") onError(event, socket);
    };

    socket.onclose = (event) => {
        if (typeof onClose === "function") onClose(event, socket);
    };

    return socket;
}
