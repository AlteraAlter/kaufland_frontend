import { qs, on } from "../../core/dom.js";
import { openModal, closeModal, bindOverlayClose, bindEscapeClose } from "../../ui/modal.js";
import { initFileSelect } from "../../ui/fileSelect.js";
import { sendEanRequest } from "../../services/api.js";
import { mapOperationLabel, showTaskStatus } from "../../ui/taskStatus.js";

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
            showTaskStatus({
                task: mapOperationLabel("check"),
                status: `Проверка EAN ${normalized}`,
            });

            try {
                const response = await sendEanRequest({
                    ean: normalized,
                    token: localStorage.getItem("jwt_access"),
                });
                if (!response?.ok) {
                    const code = response ? response.status : "unknown";
                    throw new Error(`Request failed with status ${code}`);
                }
                showTaskStatus({
                    task: mapOperationLabel("check"),
                    status: `EAN ${normalized} проверен`,
                });
            } catch (error) {
                console.error(error);
                showTaskStatus({
                    task: mapOperationLabel("check"),
                    status: `Ошибка проверки EAN ${normalized}`,
                });
            } finally {
                updateSingleState();
            }
        });
    }
}
