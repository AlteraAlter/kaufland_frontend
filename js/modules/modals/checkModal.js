import { qs, on } from "../../core/dom.js";
import { openModal, closeModal, bindOverlayClose, bindEscapeClose } from "../../ui/modal.js";
import { initFileSelect } from "../../ui/fileSelect.js";
import { sendEanRequest } from "../../services/api.js";
import {
    applyTaskSnapshot,
    applyTaskSummaryFromResponse,
    resetTaskUi,
    showTaskStatus,
} from "../../ui/taskStatus.js";
import { setProgressBarRunning } from "../../ui/progressBarStatus.js";
import {
    clearBackendResponsePreview,
    renderBackendResponsePreview,
} from "../../ui/backendResponsePreview.js";

export function initCheckModal() {
    const modal = qs("#check-modal");
    const dialog = qs("#check-dialog");
    const openBtn = qs("#checkBtn");
    const closeBtn = qs("#checkCloseBtn");

    const singleModal = qs("#single-check-modal");
    const singleDialog = qs("#single-check-dialog");
    const singleCloseBtn = qs("#singleCloseBtn");
    const singleBackBtn = qs("#singleBackBtn");
    const singleInput = qs("#ean-input");
    const singleSubmit = qs("#singleCheckSubmit");

    const multipleModal = qs("#multiple-check-modal");
    const multipleDialog = qs("#multiple-check-dialog");
    const multipleCloseBtn = qs("#multiCloseBtn");
    const multipleBackBtn = qs("#multiBackBtn");
    const multipleFileContainer = qs("#multiple-file-selection-container");

    const singleBtn = qs("#checkSingleBtn");
    const multipleBtn = qs("#checkMultipleBtn");

    if (!modal || !dialog || !openBtn || !closeBtn) return;

    const isAnyActive = () =>
        [modal, singleModal, multipleModal].some((item) => item?.classList.contains("active"));

    const openBase = () => openModal({ modal, dialog });
    const closeBase = () =>
        closeModal({
            modal,
            dialog,
            unlockCondition: () => !isAnyActive(),
        });

    const openSingle = () => openModal({ modal: singleModal, dialog: singleDialog });
    const closeSingle = () =>
        closeModal({
            modal: singleModal,
            dialog: singleDialog,
            unlockCondition: () => !isAnyActive(),
        });

    const openMultiple = () => openModal({ modal: multipleModal, dialog: multipleDialog });
    const closeMultiple = () =>
        closeModal({
            modal: multipleModal,
            dialog: multipleDialog,
            unlockCondition: () => !isAnyActive(),
        });

    on(openBtn, "click", openBase);
    on(closeBtn, "click", closeBase);

    bindOverlayClose(modal, closeBase);
    bindOverlayClose(singleModal, closeSingle);
    bindOverlayClose(multipleModal, closeMultiple);

    on(singleBtn, "click", () => {
        closeBase();
        openSingle();
    });

    on(multipleBtn, "click", () => {
        closeBase();
        openMultiple();
    });

    on(singleCloseBtn, "click", closeSingle);
    on(multipleCloseBtn, "click", closeMultiple);

    on(singleBackBtn, "click", () => {
        closeSingle();
        openBase();
    });

    on(multipleBackBtn, "click", () => {
        closeMultiple();
        openBase();
    });

    bindEscapeClose(() => {
        if (singleModal?.classList.contains("active")) {
            closeSingle();
            return;
        }
        if (multipleModal?.classList.contains("active")) {
            closeMultiple();
            return;
        }
        if (modal.classList.contains("active")) {
            closeBase();
        }
    });

    if (multipleFileContainer) {
        initFileSelect({
            fileSelectionContainer: multipleFileContainer,
            fileInputSelector: "#check-file-upload",
            fileStatusSelector: "#multipleFileStatus",
            onSuccess: () => closeMultiple(),
            enableControllerSelect: true,
        });
    }

    if (singleInput && singleSubmit) {
        const updateSingleState = () => {
            const value = singleInput.value.trim();
            const normalized = value.replace(/\s+/g, "");
            const isValid = normalized.length > 0 && /^\d+$/.test(normalized);
            singleSubmit.disabled = !isValid;
        };

        singleInput.addEventListener("input", updateSingleState);
        updateSingleState();

        singleSubmit.addEventListener("click", async () => {
            const value = singleInput.value.trim();
            const normalized = value.replace(/\s+/g, "");
            if (!normalized || !/^\d+$/.test(normalized)) {
                singleSubmit.disabled = true;
                return;
            }

            singleSubmit.disabled = true;
            clearBackendResponsePreview();
            resetTaskUi({ total: 1, running: true });
            showTaskStatus({
                hasTask: true,
            });
            applyTaskSnapshot({
                total: 1,
                success: 0,
                error: 0,
                remaining: 1,
                running: true,
            });
            closeSingle();

            try {
                const response = await sendEanRequest({
                    ean: normalized,
                    token: localStorage.getItem("jwt_access"),
                });
                const responseBody = await parseResponseBody(response);
                if (!response?.ok) {
                    const code = response ? response.status : "unknown";
                    throw new Error(`Request failed with status ${code}`);
                }
                showTaskStatus({
                    hasTask: true,
                });
                const previewPayload = resolveSingleCheckPreviewPayload(responseBody, normalized);
                renderBackendResponsePreview({
                    operation: "check",
                    payload: previewPayload,
                });
                applyTaskSummaryFromResponse({
                    operation: "check",
                    payload: previewPayload,
                });
                showTaskStatus({
                    hasTask: true,
                });
            } catch (error) {
                console.error(error);
                showTaskStatus({
                    hasTask: true,
                });
            } finally {
                setProgressBarRunning(false);
                updateSingleState();
            }
        });
    }
}

async function parseResponseBody(response) {
    if (!response) return null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function resolveSingleCheckPreviewPayload(responseBody, fallbackEan) {
    if (Array.isArray(responseBody)) return responseBody;
    if (responseBody && typeof responseBody === "object") {
        if (Array.isArray(responseBody.result)) {
            if (responseBody.result.length > 0) return responseBody.result;
            return [{
                ean: fallbackEan,
                title: null,
                price: null,
                storefront: null,
                status: "not_found",
            }];
        }
        if (responseBody.ean || responseBody.title || responseBody.price || responseBody.storefront) {
            return [responseBody];
        }
    }
    return [{
        ean: fallbackEan,
        title: null,
        price: null,
        storefront: null,
        status: "not_found",
    }];
}
