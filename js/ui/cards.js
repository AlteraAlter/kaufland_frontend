import { qs } from "../core/dom.js";
import { METRIC_CARDS } from "../data/cards.js";

export function renderMetricCards(container = "#cardsContainer") {
    const target = typeof container === "string" ? qs(container) : container;
    if (!target) return;

    const markup = METRIC_CARDS.map((card) => createCard(card)).join("");
    target.insertAdjacentHTML("beforeend", markup);
}

export function setMetricCardValue(key, value) {
    if (!key) return;
    const card = document.querySelector(`[data-card-key="${key}"]`);
    if (!card) return;
    let valueNode = card.querySelector(".metric-card-value");
    if (!valueNode) {
        const container = card.querySelector(".space-y-1") || card;
        valueNode = document.createElement("p");
        valueNode.className = "text-h2 font-semibold text-foreground metric-card-value";
        container.appendChild(valueNode);
    }
    valueNode.textContent = value;
}

export function setMetricCardText(key, text) {
    if (!key) return;
    const card = document.querySelector(`[data-card-key="${key}"]`);
    if (!card) return;
    let textNode = card.querySelector(".metric-card-text");
    if (!textNode) {
        const container = card.querySelector(".space-y-1") || card;
        textNode = document.createElement("p");
        textNode.className = "text-caption text-muted-foreground metric-card-text";
        container.appendChild(textNode);
    }
    textNode.textContent = text;
}

function createCard({ title, amount, taskText, svg, key }) {
    const keyAttr = key ? ` data-card-key="${key}"` : "";
    return `
        <div class="metric-card"${keyAttr}>
            <div class="flex items-start justify-between">
                <div class="space-y-1">
                    <p class="text-caption text-muted-foreground">${title}</p>
                    <p class="text-h2 font-semibold text-foreground metric-card-value">${amount}</p>
                    <p class="text-caption text-muted-foreground metric-card-text">${taskText}</p>
                </div>
                <div class="p-2 bg-secondary rounded-lg">
                    ${svg}
                </div>
            </div>
        </div>`;
}
