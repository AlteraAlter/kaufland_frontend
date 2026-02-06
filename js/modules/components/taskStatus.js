export function showTaskStatus({ task, status, message } = {}) {
    const area = getOrCreateTaskStatusArea();
    if (!area) return;

    let card = document.getElementById("task-status-card");
    if (!card) {
        card = document.createElement("div");
        card.id = "task-status-card";
        card.className = "task-status-card";
        card.setAttribute("role", "status");
        card.setAttribute("aria-live", "polite");

        const title = document.createElement("div");
        title.className = "task-status-title";
        title.textContent = "Текущая задача";

        const text = document.createElement("div");
        text.className = "task-status-text";

        card.appendChild(title);
        card.appendChild(text);
        area.appendChild(card);
    }

    const textNode = card.querySelector(".task-status-text");
    if (!textNode) return;

    const taskLabel = task || "Задача";
    const statusText = status || message || "Выполняется";
    textNode.textContent = `${taskLabel}: ${statusText}`;
}

export function mapOperationLabel(operation) {
    switch (operation) {
        case "upload":
            return "Загрузка";
        case "check":
            return "Проверка";
        case "delete":
            return "Удаление";
        default:
            return "Задача";
    }
}

export function parseTaskStatus(raw) {
    if (raw == null) return null;
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            return normalizeTaskStatus(parsed);
        } catch {
            return normalizeTaskStatus(raw);
        }
    }
    return normalizeTaskStatus(raw);
}

function normalizeTaskStatus(payload) {
    if (typeof payload === "string") {
        return { status: payload };
    }

    if (payload && typeof payload === "object") {
        const task = payload.task || payload.job || payload.name;
        const status = payload.status || payload.state || payload.message;
        const done =
            payload.done === true ||
            payload.completed === true ||
            payload.status === "completed" ||
            payload.status === "done" ||
            payload.status === "success" ||
            payload.status === "failed" ||
            payload.status === "error";
        return { task, status, done, message: payload.message };
    }

    return null;
}

function getOrCreateTaskStatusArea() {
    const main = document.querySelector("main.main") || document.querySelector("main");
    if (!main) return null;

    let area = document.getElementById("task-status-area");
    if (!area) {
        area = document.createElement("div");
        area.id = "task-status-area";
        area.className = "task-status-area";
        main.prepend(area);
    }
    return area;
}
