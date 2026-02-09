import { setMetricCardValue, setMetricCardText } from "./cards.js";

export function showTaskStatus({ task, status, message, done } = {}) {
    const container = getTaskStatusContainer();
    if (!container) return;

    if (done === true) {
        renderNoTasks(container);
        return;
    }

    if (!task && !status && !message) {
        renderNoTasks(container);
        return;
    }

    const taskLabel = task || "Задача";
    const statusText = status || message || "Выполняется";
    renderActiveTask(container, taskLabel, statusText);
}

export function handleBackendStatusMessage(raw) {
    const parsed = parseSocketPayload(raw);
    console.log(`Parsed`, parsed);
    if (!parsed) return { done: false };

    const { event, payload } = normalizeEvent(parsed);
    if (!event || !payload) return { done: false };

    switch (event) {
        case "job_started": {
            const total = toNumber(payload.total);
            if (Number.isFinite(total)) {
                setMetricCardValue("totalProducts", total);
                setMetricCardValue("success", 0);
                setMetricCardValue("remaining", total);
                setMetricCardValue("errors", 0);
            }
            setMetricCardText(
                "totalProducts",
                `Запущено${payload.controller ? ` (${payload.controller})` : ""}`
            );
            setMetricCardText("success", "Обработано");
            setMetricCardText("remaining", "В обработке");
            setMetricCardText("errors", "Ошибок пока нет");
            showTaskStatus({
                task: "Загрузка",
                status: `Задача запущена${Number.isFinite(total) ? `: ${total} товаров` : ""}`,
            });
            return { done: false };
        }
        case "job_progress": {
            const total = toNumber(payload.total);
            const processed = toNumber(payload.processed);
            const success = toNumber(payload.success);
            const error = toNumber(payload.error);
            if (Number.isFinite(total)) setMetricCardValue("totalProducts", total);
            if (Number.isFinite(success)) setMetricCardValue("success", success);
            if (Number.isFinite(error)) setMetricCardValue("errors", error);
            if (Number.isFinite(total) && Number.isFinite(processed)) {
                const remaining = Math.max(0, total - processed);
                setMetricCardValue("remaining", remaining);
            }
            if (Number.isFinite(processed) && Number.isFinite(total)) {
                setMetricCardText("totalProducts", `Прогресс ${processed}/${total}`);
            }
            const eanText = payload.ean ? `EAN ${payload.ean}` : "Обработка";
            setMetricCardText("remaining", `Последний: ${eanText}`);
            showTaskStatus({
                task: "Обработка",
                status: `Прогресс ${processed || 0}/${total || "?"}${eanText ? ` (${eanText})` : ""}`,
            });
            return { done: false };
        }
        case "job_completed": {
            const total = toNumber(payload.total);
            const processed = toNumber(payload.processed);
            const success = toNumber(payload.success);
            const error = toNumber(payload.error);
            if (Number.isFinite(total)) setMetricCardValue("totalProducts", total);
            if (Number.isFinite(success)) setMetricCardValue("success", success);
            if (Number.isFinite(error)) setMetricCardValue("errors", error);
            if (Number.isFinite(total) && Number.isFinite(processed)) {
                const remaining = Math.max(0, total - processed);
                setMetricCardValue("remaining", remaining);
            }
            setMetricCardText(
                "totalProducts",
                `Статус: ${payload.status || "completed"}`
            );
            setMetricCardText("remaining", "Обработка завершена");
            showTaskStatus({ done: true });
            return { done: true };
        }
        case "ean_started": {
            if (payload.ean) {
                setMetricCardText("remaining", `EAN ${payload.ean} в работе`);
            }
            showTaskStatus({
                task: "Проверка EAN",
                status: `Запущено: ${payload.ean || "?"}`,
            });
            return { done: false };
        }
        case "progress": {
            const stage = payload.stage ? ` (${payload.stage})` : "";
            const statusText = payload.status || "running";
            const stageMessage = payload.message ? `: ${payload.message}` : "";
            setMetricCardText(
                "remaining",
                `Стадия${stage}: ${statusText}${stageMessage}`
            );
            showTaskStatus({
                task: "Проверка EAN",
                status: `${payload.ean || "?"}${stage} — ${statusText}`,
            });
            return { done: false };
        }
        case "ean_completed": {
            const stage = payload.stage ? ` (${payload.stage})` : "";
            const statusText = payload.status || "done";
            const baseText = `EAN ${payload.ean || "?"}${stage}`;
            const messageText = payload.message ? `: ${payload.message}` : "";
            if (payload.status === "error") {
                const detail = payload.detail ? ` (${payload.detail})` : "";
                setMetricCardText("errors", `${baseText} — ошибка${messageText}${detail}`);
            } else {
                setMetricCardText("success", `${baseText} — успех${messageText}`);
            }
            showTaskStatus({
                task: "Проверка EAN",
                status: `${payload.ean || "?"}${stage} — ${statusText}`,
            });
            return { done: false };
        }
        default:
            return { done: false };
    }
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

function getTaskStatusContainer() {
    return document.getElementById("task-status-container");
}

function renderActiveTask(container, taskLabel, statusText) {
    container.innerHTML = "";
    const text = document.createElement("div");
    text.className = "task-status-active";
    text.textContent = `Текущая задача: ${taskLabel}: ${statusText}`;
    container.appendChild(text);
}

function renderNoTasks(container) {
    container.innerHTML = "";
    const text = document.createElement("div");
    text.className = "task-status-empty";
    text.textContent = "Нет задач";
    container.appendChild(text);
}

function parseSocketPayload(raw) {
    if (raw == null) return null;
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
    return raw;
}

function normalizeEvent(data) {
    if (!data || typeof data !== "object") return { event: null, payload: null };
    if (typeof data.event === "string") {
        return { event: data.event, payload: data.payload ?? data };
    }
    return { event: inferEvent(data), payload: data };
}

function inferEvent(data) {
    const has = (key) => Object.prototype.hasOwnProperty.call(data, key);
    if (has("total") && !has("processed")) return "job_started";
    if (has("processed") && has("success") && has("error") && has("status")) return "job_completed";
    if (has("processed") && has("success") && has("error") && has("ean")) return "job_progress";
    if (has("status") && has("ean") && has("item") && !has("stage")) return "ean_started";
    if (has("stage") && (data.status === "success" || data.status === "error")) return "ean_completed";
    if (has("stage")) return "progress";
    return null;
}

function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}
