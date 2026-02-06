export function createCard({ title, amount, taskText, svg }) {
    const div =
        `<div class="metric-card"> 
            <div class="flex items-start justify-between">
                <div class="space-y-1">
                    <p class="text-caption text-muted-foreground">${title}</p>
                    <p class="text-h2 font-semibold text-foreground">${amount}</p>
                    <p class="text-caption text-muted-foreground">${taskText}</p>
                </div>
                <div class="p-2 bg-secondary rounded-lg">
                    ${svg}
                </div>
            </div>
        </div>`;

    return div
}