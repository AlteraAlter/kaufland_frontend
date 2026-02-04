import { initFileSelect } from "../components/modalComponents.js";

export function initUploadModal() {
    const modal = document.getElementById("upload-modal");
    const dialog = document.getElementById("upload-dialog");
    const openBtn = document.getElementById("uploadBtn");
    const closeBtn = document.getElementById("uploadCloseBtn");
    const fileSelectDiv = document.getElementById("file-selection-container");

    if (!modal || !dialog || !openBtn || !closeBtn) return;

    const openModal = () => {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        dialog.setAttribute("data-state", "open");
        dialog.focus();
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        dialog.setAttribute("data-state", "closed");
        document.body.style.overflow = "";
    };

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    if (fileSelectDiv) {
        initFileSelect({ fileSelectionContainer: fileSelectDiv });
    }
}
