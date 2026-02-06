import { initAuthModal } from "./modules/modals/authModal.js";
import { initUploadModal } from "./modules/modals/uploadModal.js";
import { initCheckModal } from "./modules/modals/checkModal.js";
import { initDeleteModal } from "./modules/modals/deleteModal.js";
import { initCards } from "./modules/components/cardContainer.js";

document.addEventListener("DOMContentLoaded", () => {
    initAuthModal();
    initUploadModal();
    initCheckModal();
    initDeleteModal();
    initCards();
});
