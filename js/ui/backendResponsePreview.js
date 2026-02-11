export function clearBackendResponsePreview() {
    const container = getPreviewContainer(false);
    if (!container) return;
    container.remove();
}

export function renderBackendResponsePreview({ operation, payload }) {
    const container = getPreviewContainer(true);
    if (!container) return;

    container.innerHTML = "";

    const title = document.createElement("h3");
    title.className = "text-h3 text-foreground mb-2";
    title.textContent = "Ответ сервера";
    container.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "text-caption text-muted-foreground mb-4";
    meta.textContent = `Операция: ${operationLabel(operation)}`;
    container.appendChild(meta);

    if (Array.isArray(payload)) {
        renderArrayPayload(container, payload);
        return;
    }

    const pre = document.createElement("pre");
    pre.className = "text-caption";
    pre.style.whiteSpace = "pre-wrap";
    pre.style.wordBreak = "break-word";
    pre.textContent =
        typeof payload === "string" ? payload : JSON.stringify(payload || {}, null, 2);
    container.appendChild(pre);
}

function renderArrayPayload(container, items) {
    const groups = groupByEan(items);
    const totalRows = items.length;
    const totalProducts = groups.length;
    const maxGroups = 25;
    const visibleGroups = groups.slice(0, maxGroups);

    const count = document.createElement("p");
    count.className = "text-caption text-muted-foreground mb-4";
    count.textContent = `Товаров (EAN): ${totalProducts}, записей: ${totalRows}`;
    container.appendChild(count);

    const list = document.createElement("div");
    list.className = "space-y-3";
    list.style.maxHeight = "320px";
    list.style.overflowY = "auto";
    list.style.overflowX = "hidden";
    list.style.paddingRight = "0.25rem";
    list.style.borderTop = "1px solid hsl(var(--border))";
    list.style.paddingTop = "0.5rem";

    visibleGroups.forEach((group, idx) => {
        const panel = document.createElement("details");
        panel.className = "rounded-lg border bg-card backend-response-group";
        panel.style.borderColor = "hsl(var(--border))";

        const summary = document.createElement("summary");
        summary.className = "flex items-center gap-3 p-4 backend-response-summary";
        summary.style.cursor = "pointer";
        summary.style.listStyle = "none";
        summary.style.flexWrap = "wrap";

        const index = document.createElement("span");
        index.className = "font-mono-data text-caption text-muted-foreground";
        index.textContent = `#${idx + 1}`;
        index.style.padding = "0.125rem 0.375rem";
        index.style.border = "1px solid hsl(var(--border))";
        index.style.borderRadius = "9999px";
        summary.appendChild(index);

        const ean = document.createElement("span");
        ean.className = "font-mono-data font-medium text-foreground";
        ean.textContent = `EAN: ${group.ean}`;
        ean.style.wordBreak = "break-word";
        summary.appendChild(ean);

        const badge = document.createElement("span");
        badge.className = "text-caption text-muted-foreground";
        badge.textContent = `Записей: ${group.items.length}`;
        badge.style.marginLeft = "auto";
        badge.style.padding = "0.125rem 0.5rem";
        badge.style.background = "hsl(var(--secondary))";
        badge.style.borderRadius = "9999px";
        summary.appendChild(badge);

        panel.appendChild(summary);

        const body = document.createElement("div");
        body.className = "p-4 backend-response-body";
        body.style.borderTop = "1px solid hsl(var(--border))";
        body.appendChild(buildGroupTable(group.items));

        panel.appendChild(body);
        list.appendChild(panel);
    });

    container.appendChild(list);

    if (totalProducts > maxGroups) {
        const hint = document.createElement("p");
        hint.className = "text-caption text-muted-foreground mt-3";
        hint.textContent = `Показаны первые ${maxGroups} из ${totalProducts} EAN`;
        container.appendChild(hint);
    }
}

function getPreviewContainer(createIfMissing) {
    const statusContainer = document.querySelector("#status-taks-container");
    if (!statusContainer) return null;

    let container = statusContainer.querySelector('[data-backend-response-preview="true"]');
    if (!container && createIfMissing) {
        container = document.createElement("div");
        container.className = "bg-card rounded-lg border p-6";
        container.setAttribute("data-backend-response-preview", "true");
        statusContainer.appendChild(container);
    }
    return container;
}

function operationLabel(operation) {
    switch (operation) {
        case "upload":
            return "Загрузка";
        case "check":
            return "Проверка";
        case "delete":
            return "Удаление";
        default:
            return "Операция";
    }
}

function groupByEan(items) {
    const map = new Map();
    items.forEach((item) => {
        const value = item && typeof item === "object" ? item.ean : null;
        const ean = value == null || value === "" ? "—" : String(value);
        if (!map.has(ean)) map.set(ean, []);
        map.get(ean).push(item);
    });
    return Array.from(map.entries()).map(([ean, groupedItems]) => ({
        ean,
        items: groupedItems,
    }));
}

function getCountryValue(item) {
    if (!item || typeof item !== "object") return "";
    const candidate =
        item.country ||
        item.storefront ||
        item.locale ||
        item.lang ||
        item.language ||
        "";
    return String(candidate || "").trim();
}

function buildGroupTable(items) {
    const wrapper = document.createElement("div");
    wrapper.style.overflowX = "auto";
    wrapper.style.border = "1px solid hsl(var(--border))";
    wrapper.style.borderRadius = "0.5rem";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.minWidth = "520px";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Имя", "Страна", "Цена", "Статус"].forEach((name) => {
        const th = document.createElement("th");
        th.className = "text-caption text-muted-foreground";
        th.textContent = name;
        th.style.textAlign = "left";
        th.style.padding = "0.65rem 0.75rem";
        th.style.borderBottom = "1px solid hsl(var(--border))";
        th.style.background = "hsl(var(--secondary))";
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    items.forEach((item) => {
        const tr = document.createElement("tr");
        tbody.appendChild(tr);

        const nameCell = document.createElement("td");
        nameCell.className = "text-body text-foreground";
        nameCell.textContent = item?.title ? String(item.title) : "—";
        applyTableCellStyle(nameCell);
        tr.appendChild(nameCell);

        const countryCell = document.createElement("td");
        countryCell.className = "text-caption text-muted-foreground";
        countryCell.textContent = getCountryValue(item) || "—";
        applyTableCellStyle(countryCell);
        tr.appendChild(countryCell);

        const priceCell = document.createElement("td");
        priceCell.className = "text-caption text-muted-foreground";
        priceCell.textContent = item?.price == null ? "—" : `${String(item.price)} €`;
        applyTableCellStyle(priceCell);
        tr.appendChild(priceCell);

        const statusCell = document.createElement("td");
        statusCell.className = "text-caption text-muted-foreground";
        statusCell.textContent = Object.prototype.hasOwnProperty.call(item || {}, "status")
            ? (item?.status ? String(item.status) : "—")
            : "—";
        applyTableCellStyle(statusCell);
        tr.appendChild(statusCell);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
}

function applyTableCellStyle(cell) {
    cell.style.padding = "0.65rem 0.75rem";
    cell.style.borderBottom = "1px solid hsl(var(--border))";
    cell.style.verticalAlign = "top";
    cell.style.wordBreak = "break-word";
}
