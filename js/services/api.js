import { ENDPOINTS } from "../core/config.js";

const OPERATION_CONFIG = {
    upload: {
        endpoint: ENDPOINTS.upload,
        buildFormData: (formData, file) => {
            formData.append("file", file);
            formData.append("mode", "upload_collection");
            formData.append("controller", "jv");
        },
    },
    check: {
        endpoint: ENDPOINTS.check,
        buildFormData: (formData, file) => {
            formData.append("file", file);
            formData.append("mode", "checker");
            formData.append("controller", "jv");
        },
    },
    delete: {
        endpoint: ENDPOINTS.delete,
        buildFormData: (formData, file) => {
            formData.append("file", file);
            formData.append("mode", "delete");
            formData.append("controller", "jv");
        },
    },
};

export function getOperationConfig(operation) {
    return OPERATION_CONFIG[operation] || null;
}

export async function sendFileRequest({ operation, file, token }) {
    const config = getOperationConfig(operation);
    if (!config || config.disabled) return null;

    const formData = new FormData();
    config.buildFormData(formData, file);

    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    return response;
}
