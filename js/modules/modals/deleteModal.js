import { qs, on } from "../../core/dom.js";
import { openModal, closeModal, bindOverlayClose, bindEscapeClose } from "../../ui/modal.js";
import { initFileSelect } from "../../ui/fileSelect.js";

export function initDeleteModal() {
    const modal = qs("#delete-modal");
    const dialog = qs("#delete-dialog");
    const openBtn = qs("#deleteBtn");
    const closeBtn = qs("#deleteCloseBtn");
    const fileSelectionContainer = qs("#delete-file-selection-container");

    if (!modal || !dialog || !openBtn || !closeBtn) return;

    const open = () => openModal({ modal, dialog });
    const close = () => closeModal({ modal, dialog });

    on(openBtn, "click", open);
    on(closeBtn, "click", close);

    bindOverlayClose(modal, close);
    bindEscapeClose(() => {
        if (modal.classList.contains("active")) close();
    });

    if (fileSelectionContainer) {
        initFileSelect({
            fileSelectionContainer,
            fileInputSelector: "#delete-file-upload",
            fileStatusSelector: "#deleteFileStatus",
            readyText: "Готов к удалению",
            onSuccess: () => close(),
            enableControllerSelect: true,
        });
    }
}
