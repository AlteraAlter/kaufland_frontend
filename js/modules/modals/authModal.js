import { BASE_URL } from "../../core/config.js";

export function initAuthModal() {
    const ACCESS_KEY = "jwt_access";
    const REFRESH_KEY = "jwt_refresh";

    const container = document.getElementsByClassName("auth-buttons")[0]
    const modal = document.getElementById("login-modal");
    const openBtn = document.getElementById("loginBtn");
    const closeBtn = document.getElementById("closeBtn");
    const loginBtn = document.getElementById("submitBtn");
    const errorDiv = document.getElementById("auth-error-log")

    const logoutBtnHTML = `<button class="logout-button" id="logoutBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-log-in enter-svg">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                    <polyline points="10 17 15 12 10 7"></polyline>
                                    <line x1="15" x2="3" y1="12" y2="12"></line>
                                </svg>
                                Выйти
                            </button>`

    const statusHTML = `<div class="status-bar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-user w-4 h-4">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span class="text-caption font-medium">В системе</span>
                        </div>`

    const setTokens = ({ access, refresh, _ }) => {
        localStorage.setItem(ACCESS_KEY, access);
        if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    }

    const isLoggedIn = () => {
        return localStorage.getItem(ACCESS_KEY);
    }

    const clearTokens = () => {
        localStorage.clear();
    }

    const mapErrorText = (errText) => {
        console.log(Object.keys(errText));
        switch (Object.keys(errText)[0]) {
            case "username":
                return "Username must be filled"
            case "detail":
                return "Error credentials"
            case "password":
                return "Password must be filled"

            default:
                return Object.keys(errText)[0]
        }
    }

    if (!modal || !openBtn || !closeBtn) return;

    if (isLoggedIn()) {
        openBtn.remove();
        container.insertAdjacentHTML("afterbegin", logoutBtnHTML);
        container.insertAdjacentHTML("afterbegin", statusHTML);
    }

    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    container.addEventListener("click", (e) => {
        if (e.target.closest("#logoutBtn")) {
            clearTokens();
            location.reload();
        }
    });



    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const resp = await fetch(`${BASE_URL}/api/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });
        if (!resp.ok) {
            const errText = await resp.json();
            console.log(typeof errText);
            const text = mapErrorText(errText);
            console.log(text);
            errorDiv.classList.add("active");

            errorDiv.innerHTML = `<p class="error-text">${text}</p>`;
            return;
        }
        const data = await resp.json();
        console.log(data);
        setTokens(data);
        location.reload();
    });
}
