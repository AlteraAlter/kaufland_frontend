import { sendFileRequest, getOperationConfig } from "../../services/api.js";
import { initProgressSocket } from "../ws/uploadProgressSocket.js";
import { mapOperationLabel, parseTaskStatus, showTaskStatus } from "./taskStatus.js";

export function initFileSelect({
    fileSelectionContainer,
    fileInputSelector = "#file-upload",
    fileStatusSelector = "#uploadFileStatus",
    readyText = "Готов к загрузке",
    backText = "Отмена",
    confirmText = "Подтвердить",
    onSuccess,
}) {
    if (!fileSelectionContainer) return;

    const originalHTML = fileSelectionContainer.innerHTML;
    const cancelButton = document.getElementById("multiBackBtn");
    let selectedFile = null;

    const renderConfirm = (fileName) => {
        fileSelectionContainer.innerHTML = `
            <div class="space-y-4" id="confirm-action-container">
                <div class="p-4 bg-secondary border rounded-lg" id="confirmContainer">
                    <p class="text-body text-foreground font-medium" id="confirm-file-name"></p>
                    <p class="text-caption text-muted-foreground mt-1" id="confirm-file-status">${readyText}</p>
                </div>
                <div class="flex gap-2 space-y-4">
                    <button id="back-button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1">
                        ${backText}
                    </button>
                    <button id="confirm-button"
                        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1">
                        ${confirmText}
                    </button>
                </div>
            </div>`;

        const fileNameNode = fileSelectionContainer.querySelector("#confirm-file-name");
        if (fileNameNode) {
            fileNameNode.textContent = fileName;
        }

        const backButton = fileSelectionContainer.querySelector("#back-button");
        if (backButton) {
            backButton.addEventListener("click", () => {
                restoreInitial();
            });
        }

        const confirmButton = fileSelectionContainer.querySelector("#confirm-button");
        const statusNode = fileSelectionContainer.querySelector("#confirm-file-status");
        confirmButton.addEventListener("click", () =>
            sendRequest({
                operation: fileSelectionContainer.getAttribute("modal-type"),
                file: selectedFile,
                statusNode,
                confirmButton,
                backButton,
                onSuccess,
            })
        );

        if (cancelButton) {
            cancelButton.style.display = "none";
        }

        if (fileSelectionContainer.getAttribute("modal-type") === "delete") {
            const confirmContainer = fileSelectionContainer.querySelector("#confirmContainer");
            if (confirmContainer) {
                confirmContainer.classList.replace("bg-secondary", "bg-destructive/10");
                confirmContainer.classList.add("border", "border-destructive/20");
            }
        }
    };

    const bindFileInput = () => {
        const fileInput = fileSelectionContainer.querySelector(fileInputSelector);
        const fileStatus = fileSelectionContainer.querySelector(fileStatusSelector);

        if (!fileInput || !fileStatus) return;

        fileInput.value = "";
        selectedFile = null;
        fileStatus.textContent = "Файл не выбран";

        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0] || null;
            const fileName = file?.name;
            if (!fileName || !file) {
                fileStatus.textContent = "Файл не выбран";
                selectedFile = null;
                return;
            }

            fileStatus.textContent = `Выбран файл: ${fileName}`;
            selectedFile = file;
            renderConfirm(fileName);
        });
    };

    const restoreInitial = () => {
        fileSelectionContainer.innerHTML = originalHTML;
        if (cancelButton) cancelButton.style.display = "block";
        bindFileInput();
    };

    bindFileInput();
}

async function sendRequest({
    operation,
    file,
    statusNode,
    confirmButton,
    backButton,
    onSuccess,
}) {
    const operationConfig = operation ? getOperationConfig(operation) : null;
    if (!operationConfig) {
        if (statusNode) statusNode.textContent = "Неизвестная операция";
        return;
    }
    if (operationConfig.disabled) {
        return;
    }

    if (!file) {
        if (statusNode) statusNode.textContent = "Файл не выбран";
        return;
    }

    if (statusNode) statusNode.textContent = "Отправка файла...";
    if (confirmButton) confirmButton.disabled = true;
    if (backButton) backButton.disabled = true;

    showTaskStatus({
        task: mapOperationLabel(operation),
        status: "Задача запущена",
    });
    if (typeof onSuccess === "function") {
        onSuccess({ operation });
    }

    let progressSocket = initProgressSocket({
        onMessage: (event) => {
            const data = parseTaskStatus(event.data);
            console.log(data);
            if (data) {
                showTaskStatus(data);
            }
            if (data?.done) {
                progressSocket?.close();
            }
        },
        onError: () => {
            showTaskStatus({
                task: mapOperationLabel(operation),
                status: "Ошибка соединения",
            });
        },
    });

    try {
        const response = await sendFileRequest({
            operation,
            file,
            token: localStorage.getItem("jwt_access"),
        });

        if (!response?.ok) {
            const code = response ? response.status : "unknown";
            throw new Error(`Request failed with status ${code}`);
        }

        if (statusNode) statusNode.textContent = "Файл отправлен";
    } catch (error) {
        console.error(error);
        if (statusNode) statusNode.textContent = "Ошибка отправки файла";
        showTaskStatus({
            task: mapOperationLabel(operation),
            status: "Ошибка отправки файла",
        });
        if (progressSocket && progressSocket.readyState === WebSocket.OPEN) {
            progressSocket.close();
        }
    } finally {
        if (confirmButton) confirmButton.disabled = false;
        if (backButton) backButton.disabled = false;
    }
}
