
export function showProgressBar() {
    const content = `
    <div class="space-y-6">
        <div class="bg-card rounded-lg border p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <h3 class="text-h3 text-foreground">Прогресс обработки</h3>
                    <span class="progress-spinner" data-progress-spinner aria-hidden="true"></span>
                </div>
                <span class="text-body text-muted-foreground" data-progress-text>5 / 8 обработано</span>
            </div>
            <div aria-valuemax="100" aria-valuemin="0" role="progressbar" data-state="indeterminate"
                data-max="100" class="relative w-full overflow-hidden rounded-full bg-secondary h-3 mb-4"
                data-progress-bar>
                <div data-state="indeterminate" data-max="100"
                    class="h-full w-full flex-1 bg-primary transition-all" data-progress-fill
                    style="transform: translateX(-37.5%);"></div>
            </div>
            <div class="flex gap-6 text-sm">
                <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-circle-check w-4 h-4 text-success">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12 2 2 4-4"></path>
                    </svg><span class="text-muted-foreground">Успешно:</span><span
                        class="font-mono-data font-medium" data-progress-counter="success">3</span></div>
                <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-triangle-alert w-4 h-4 text-destructive">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3">
                        </path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                    </svg><span class="text-muted-foreground">Ошибки:</span><span
                        class="font-mono-data font-medium" data-progress-counter="error">2</span></div>
                <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-loader-circle w-4 h-4 text-warning">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg><span class="text-muted-foreground">В очереди:</span><span
                        class="font-mono-data font-medium" data-progress-counter="queue">3</span></div>
            </div>
        </div>
        <div class="space-y-4">
            <div data-state="closed" class="border rounded-lg bg-card"><button type="button"
                    aria-controls="radix-:rc:" aria-expanded="false" data-state="closed"
                    class="flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-chevron-down w-4 h-4 text-muted-foreground transition-transform -rotate-90">
                        <path d="m6 9 6 6 6-6"></path>
                    </svg><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-triangle-alert w-5 h-5 text-destructive">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3">
                        </path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                    </svg><span class="text-body font-medium">Ошибки</span><span
                        class="text-caption text-muted-foreground ml-auto">2 товара</span></button>
                <div data-state="closed" id="radix-:rc:"
                    style="--radix-collapsible-content-height: 97.59999084472656px; --radix-collapsible-content-width: 1001.5999755859375px;"
                    hidden=""></div>
            </div>
            <div data-state="closed" class="border rounded-lg bg-card"><button type="button"
                    aria-controls="radix-:rd:" aria-expanded="false" data-state="closed"
                    class="flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-chevron-down w-4 h-4 text-muted-foreground transition-transform -rotate-90">
                        <path d="m6 9 6 6 6-6"></path>
                    </svg><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-loader-circle w-5 h-5 text-warning">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg><span class="text-body font-medium">В обработке</span><span
                        class="text-caption text-muted-foreground ml-auto">3 товара</span></button>
                <div data-state="closed" id="radix-:rd:"
                    style="--radix-collapsible-content-height: 146.40000915527344px; --radix-collapsible-content-width: 1001.5999755859375px;"
                    hidden=""></div>
            </div>
            <div data-state="closed" class="border rounded-lg bg-card"><button type="button"
                    aria-controls="radix-:re:" aria-expanded="false" data-state="closed"
                    class="flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-chevron-down w-4 h-4 text-muted-foreground transition-transform -rotate-90">
                        <path d="m6 9 6 6 6-6"></path>
                    </svg><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-circle-check w-5 h-5 text-success">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12 2 2 4-4"></path>
                    </svg><span class="text-body font-medium">Успешно</span><span
                        class="text-caption text-muted-foreground ml-auto">3 товара</span></button>
                <div data-state="closed" id="radix-:re:"
                    style="--radix-collapsible-content-height: 146.39999389648438px; --radix-collapsible-content-width: 1001.5999755859375px;"
                    hidden=""></div>
            </div>
        </div>
    </div>
    `;

    
}
