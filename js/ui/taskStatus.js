import { setMetricCardValue, setMetricCardText } from "./cards.js";
import {
    initProgressBarStatus,
    setProgressBarProgress,
    setProgressBarRunning,
    setProgressBarStatus,
} from "./progressBarStatus.js";
import { qs } from "../core/dom.js"

export function showTaskStatus({ hasTask, message } = {}) {
    const noTaskContainer = qs("#no-task-container");
    const statusTaskContainer = qs("#status-taks-container");

    if (hasTask) {
        statusTaskContainer.style.display = "block";
        noTaskContainer.style.display = "none";
        initProgressBarStatus({ success: 0, error: 0, queue: 0 });
    }
    else {
        return;
        noTaskContainer.style.display = "block";
        statusTaskContainer.style.display = "none";
    }
}

export function handleBackendStatusMessage(raw) {
    const parsed = parseSocketPayload(raw);
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
            setProgressBarStatus({
                success: 0,
                error: 0,
                queue: Number.isFinite(total) ? total : undefined,
            });
            if (Number.isFinite(total)) {
                setProgressBarProgress({ processed: 0, total });
            }
            showTaskStatus({
                hasTask: true
            });
            return { done: false };
        }
        case "job_progress": {
            const total = toNumber(payload.total);
            const processed = toNumber(payload.processed);
            const success = toNumber(payload.success);
            const error = toNumber(payload.error);
            let remaining = null;
            if (Number.isFinite(total)) setMetricCardValue("totalProducts", total);
            if (Number.isFinite(success)) setMetricCardValue("success", success);
            if (Number.isFinite(error)) setMetricCardValue("errors", error);
            if (Number.isFinite(total) && Number.isFinite(processed)) {
                remaining = Math.max(0, total - processed);
                setMetricCardValue("remaining", remaining);
            }
            setProgressBarStatus({
                success,
                error,
                queue: Number.isFinite(remaining) ? remaining : undefined,
            });
            if (Number.isFinite(total) && Number.isFinite(processed)) {
                setProgressBarProgress({ processed, total });
            }

            showTaskStatus({
                hasTask: true,
            });
            return { done: false };
        }
        case "job_completed": {
            const total = toNumber(payload.total);
            const processed = toNumber(payload.processed);
            const success = toNumber(payload.success);
            const error = toNumber(payload.error);
            let remaining = null;
            if (Number.isFinite(total)) setMetricCardValue("totalProducts", total);
            if (Number.isFinite(success)) setMetricCardValue("success", success);
            if (Number.isFinite(error)) setMetricCardValue("errors", error);
            if (Number.isFinite(total) && Number.isFinite(processed)) {
                remaining = Math.max(0, total - processed);
                setMetricCardValue("remaining", remaining);
            }
            setProgressBarStatus({
                success,
                error,
                queue: Number.isFinite(remaining) ? remaining : 0,
            });
            if (Number.isFinite(total)) {
                setProgressBarProgress({
                    processed: Number.isFinite(processed) ? processed : total,
                    total,
                });
            }
            setProgressBarRunning(false);
            showTaskStatus({ hasTask: false });
            return { done: true };
        }
        case "ean_started": {
            showTaskStatus({
                hasTask: true,
            });
            return { done: false };
        }
        case "progress": {
            const stage = payload.stage ? ` (${payload.stage})` : "";
            const statusText = payload.status || "running";
            const stageMessage = payload.message ? `: ${payload.message}` : "";
            showTaskStatus({
                hasTask: true,
            });
            return { done: false };
        }
        case "ean_completed": {
            const stage = payload.stage ? ` (${payload.stage})` : "";
            const statusText = payload.status || "done";
            const baseText = `EAN ${payload.ean || "?"}${stage}`;
            const messageText = payload.message ? `: ${payload.message}` : "";
            showTaskStatus({
                hasTask: true,
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

function renderNoTasks(container, state) {
    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package w-12 h-12 mx-auto mb-4 opacity-50">
                                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z">
                                </path>
                                <path d="M12 22V12"></path>
                                <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
                                <path d="m7.5 4.27 9 5.15"></path>
                            </svg>
                            <h3 class="text-h3 text-foreground mb-2">Нет активной задачи</h3>
                            <p class="text-body">Загрузите файл или проверьте товары, чтобы начать обработку</p>
                            `;
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
