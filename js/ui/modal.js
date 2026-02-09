export function openModal({ modal, dialog, lockBody = true }) {
    if (!modal || !dialog) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    dialog.setAttribute("data-state", "open");
    dialog.focus();
    if (lockBody) document.body.style.overflow = "hidden";
}

export function closeModal({ modal, dialog, unlockBody = true, unlockCondition }) {
    if (!modal || !dialog) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    dialog.setAttribute("data-state", "closed");

    const shouldUnlock = typeof unlockCondition === "function" ? unlockCondition() : unlockBody;
    if (shouldUnlock) document.body.style.overflow = "";
}

export function bindOverlayClose(modal, onClose) {
    if (!modal || typeof onClose !== "function") return;
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            onClose();
        }
    });
}

export function bindEscapeClose(handler) {
    if (typeof handler !== "function") return;
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") handler();
    });
}
