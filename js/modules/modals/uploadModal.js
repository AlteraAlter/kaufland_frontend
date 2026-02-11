import { qs, on } from "../../core/dom.js";
import { openModal, closeModal, bindOverlayClose, bindEscapeClose } from "../../ui/modal.js";
import { initFileSelect } from "../../ui/fileSelect.js";

export function initUploadModal() {
    const modal = qs("#upload-modal");
    const dialog = qs("#upload-dialog");
    const openBtn = qs("#uploadBtn");
    const closeBtn = qs("#uploadCloseBtn");
    const fileSelectDiv = qs("#file-selection-container");

    if (!modal || !dialog || !openBtn || !closeBtn) return;

    const open = () => openModal({ modal, dialog });
    const close = () => closeModal({ modal, dialog });

    on(openBtn, "click", open);
    on(closeBtn, "click", close);
    modal.addEventListener("click", (event) => {
        const closeTarget = event.target.closest("#uploadCloseBtn");
        if (closeTarget) close();
    });

    bindOverlayClose(modal, close);
    bindEscapeClose(() => {
        if (modal.classList.contains("active")) close();
    });

    if (fileSelectDiv) {
        initFileSelect({
            fileSelectionContainer: fileSelectDiv,
            jsonOnly: true,
            jsonCountCardKey: "totalProducts",
            onSuccess: () => close(),
            enableControllerSelect: true,
            floatingCloseButtonId: "uploadCloseBtn",
        });
    }
}
