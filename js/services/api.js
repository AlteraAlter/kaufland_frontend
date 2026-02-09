import { ENDPOINTS } from "../core/config.js";

const OPERATION_CONFIG = {
    upload: {
        endpoint: ENDPOINTS.upload,
        buildFormData: (formData, file, jobId) => {
            formData.append("file", file);
            appendJobId(formData, jobId);
            formData.append("mode", "upload_collection");
            formData.append("controller", "jv");
        },
    },
    check: {
        endpoint: ENDPOINTS.check,
        buildFormData: (formData, file, jobId) => {
            formData.append("file", file);
            appendJobId(formData, jobId);
            formData.append("mode", "checker");
            formData.append("controller", "jv");
        },
    },
    delete: {
        endpoint: ENDPOINTS.delete,
        buildFormData: (formData, file, jobId) => {
            formData.append("file", file);
            appendJobId(formData, jobId);
            formData.append("mode", "delete");
            formData.append("controller", "jv");
        },
    },
};

export function getOperationConfig(operation) {
    return OPERATION_CONFIG[operation] || null;
}

export async function sendFileRequest({ operation, file, token, jobId }) {
    const config = getOperationConfig(operation);
    if (!config || config.disabled) return null;

    const formData = new FormData();
    config.buildFormData(formData, file, jobId);

    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    return response;
}

export async function sendEanRequest({ ean, token }) {
    if (!ean) return null;
    const formData = new FormData();
    formData.append("ean", ean);
    formData.append("mode", "checker");
    formData.append("controller", "jv");

    const response = await fetch(ENDPOINTS.check, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    return response;
}

function appendJobId(formData, jobId) {
    if (!jobId) return;
    formData.append("job_id", jobId);
}
