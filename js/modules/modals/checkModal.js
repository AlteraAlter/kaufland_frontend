import { initFileSelect } from "../components/modalComponents.js";

export function initCheckModal() {
    const modal = document.getElementById("check-modal");
    const dialog = document.getElementById("check-dialog");
    const openBtn = document.getElementById("checkBtn");
    const closeBtn = document.getElementById("checkCloseBtn");

    const singleModal = document.getElementById("single-check-modal");
    const singleDialog = document.getElementById("single-check-dialog");
    const singleCloseBtn = document.getElementById("singleCloseBtn");
    const singleBackBtn = document.getElementById("singleBackBtn");

    const multipleModal = document.getElementById("multiple-check-modal");
    const multipleDialog = document.getElementById("multiple-check-dialog");
    const multipleCloseBtn = document.getElementById("multiCloseBtn");
    const multipleBackBtn = document.getElementById("multiBackBtn");
    const multipleFileContainer = document.getElementById("multiple-file-selection-container");

    const singleBtn = document.getElementById("checkSingleBtn");
    const multipleBtn = document.getElementById("checkMultipleBtn");

    if (!modal || !dialog || !openBtn || !closeBtn) return;

    const openModal = (targetModal, targetDialog) => {
        targetModal.classList.add("active");
        targetModal.setAttribute("aria-hidden", "false");
        targetDialog.setAttribute("data-state", "open");
        targetDialog.focus();
        document.body.style.overflow = "hidden";
    };

    const closeModal = (targetModal, targetDialog) => {
        targetModal.classList.remove("active");
        targetModal.setAttribute("aria-hidden", "true");
        targetDialog.setAttribute("data-state", "closed");
        if (
            !modal.classList.contains("active") &&
            !singleModal.classList.contains("active") &&
            !multipleModal.classList.contains("active")
        ) {
            document.body.style.overflow = "";
        }
    };

    openBtn.addEventListener("click", () => openModal(modal, dialog));
    closeBtn.addEventListener("click", () => closeModal(modal, dialog));

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal(modal, dialog);
        }
    });

    if (singleBtn && singleModal && singleDialog) {
        singleBtn.addEventListener("click", () => {
            closeModal(modal, dialog);
            openModal(singleModal, singleDialog);
        });
    }

    if (multipleBtn && multipleModal && multipleDialog) {
        multipleBtn.addEventListener("click", () => {
            closeModal(modal, dialog);
            openModal(multipleModal, multipleDialog);
        });
    }

    if (singleCloseBtn && singleModal && singleDialog) {
        singleCloseBtn.addEventListener("click", () => closeModal(singleModal, singleDialog));
    }

    if (multipleCloseBtn && multipleModal && multipleDialog) {
        multipleCloseBtn.addEventListener("click", () => closeModal(multipleModal, multipleDialog));
    }

    if (singleBackBtn && singleModal && singleDialog) {
        singleBackBtn.addEventListener("click", () => {
            closeModal(singleModal, singleDialog);
            openModal(modal, dialog);
        });
    }

    if (multipleBackBtn && multipleModal && multipleDialog) {
        multipleBackBtn.addEventListener("click", () => {
            closeModal(multipleModal, multipleDialog);
            openModal(modal, dialog);
        });
    }

    singleModal?.addEventListener("click", (event) => {
        if (event.target === singleModal) {
            closeModal(singleModal, singleDialog);
        }
    });

    multipleModal?.addEventListener("click", (event) => {
        if (event.target === multipleModal) {
            closeModal(multipleModal, multipleDialog);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (singleModal?.classList.contains("active")) {
            closeModal(singleModal, singleDialog);
            return;
        }
        if (multipleModal?.classList.contains("active")) {
            closeModal(multipleModal, multipleDialog);
            return;
        }
        if (modal.classList.contains("active")) {
            closeModal(modal, dialog);
        }
    });

    if (multipleFileContainer) {
        initFileSelect({
            fileSelectionContainer: multipleFileContainer,
            fileInputSelector: "#check-file-upload",
            fileStatusSelector: "#multipleFileStatus",
        });
    }
}
