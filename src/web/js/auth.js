// ============================================================================
// auth.js — Shared authentication / session layer for Proton
//
// This file expects your Python/Eel backend to expose:
//   eel.authenticate_user(email, password) -> {status: "success"|"error", message}
//   eel.register_user(email, password, fullname) -> {status: "success"|"error", message}
//   eel.Logout()  (fire-and-forget is fine, but we call it as a promise below)
//
// Backend storage (SQLite or otherwise) is entirely up to your Python side —
// this file only calls those functions and manages the client-side session
// flag so other pages know whether someone is logged in.
// ============================================================================

(function () {
    const SESSION_KEY = "proton_session";
    const DEFAULT_LOGIN_PAGE = ".Login.html";
    const DEFAULT_HOME_PAGE = "index.html";

    // ---------------- Session helpers ----------------
    function setSession(email) {
        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ email: email, loggedInAt: Date.now() })
        );
    }

    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch (e) {
            return null;
        }
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function isLoggedIn() {
        return !!getSession();
    }

    function requireLogin(loginPage) {
        if (!isLoggedIn()) {
            window.location.href = loginPage || DEFAULT_LOGIN_PAGE;
        }
    }

    async function logoutUser(loginPage) {
        clearSession();
        try {
            if (window.eel && typeof eel.Logout === "function") {
                await eel.Logout()();
            }
        } catch (err) {
            console.warn("Backend logout call failed (continuing anyway):", err);
        }
        window.location.href = loginPage || DEFAULT_LOGIN_PAGE;
    }

    // ---------------- UI helpers ----------------
    function showMessage(el, message, type) {
        if (!el) return;
        el.textContent = message;
        el.className = `message ${type}`;
        el.style.display = "block";
        if (type === "success") {
            setTimeout(() => {
                el.style.display = "none";
            }, 2000);
        }
    }

    function setButtonBusy(btn, textEl, spinnerEl, busyText, idleText) {
        if (btn) btn.disabled = !!busyText;
        if (textEl) textEl.textContent = busyText || idleText;
        if (spinnerEl) spinnerEl.style.display = busyText ? "inline-block" : "none";
    }

    // ---------------- Login handler ----------------
    async function handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const messageDiv = document.getElementById("message");
        const loginBtn = document.getElementById("loginBtn");
        const btnText = document.getElementById("btnText");
        const btnSpinner = document.getElementById("btnSpinner");

        setButtonBusy(loginBtn, btnText, btnSpinner, "Logging in...");

        try {
            const response = await eel.authenticate_user(email, password)();

            if (response && response.status === "success") {
                setSession(email);
                showMessage(messageDiv, "Login successful! Redirecting...", "success");

                // Optional: some backends use this to spin up the main window/session
                if (window.eel && typeof eel.launch_main_app === "function") {
                    try {
                        await eel.launch_main_app()();
                    } catch (e) {
                        console.warn("launch_main_app() failed (continuing):", e);
                    }
                }

                setTimeout(() => {
                    window.location.href = DEFAULT_HOME_PAGE;
                }, 700);
            } else {
                showMessage(messageDiv, (response && response.message) || "Invalid email or password", "error");
            }
        } catch (error) {
            console.error("Login error:", error);
            showMessage(messageDiv, "An error occurred during login. Is the backend running?", "error");
        } finally {
            setButtonBusy(loginBtn, btnText, btnSpinner, null, "Login");
        }
    }

    // ---------------- Register handler ----------------
    async function handleRegister(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const fullnameEl = document.getElementById("fullname");
        const fullname = fullnameEl ? fullnameEl.value.trim() : "";
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const messageDiv = document.getElementById("message");
        const registerBtn = document.getElementById("registerBtn");
        const btnText = document.getElementById("btnText");
        const btnSpinner = document.getElementById("btnSpinner");

        if (password !== confirmPassword) {
            showMessage(messageDiv, "Passwords do not match", "error");
            return;
        }
        if (password.length < 8) {
            showMessage(messageDiv, "Password must be at least 8 characters", "error");
            return;
        }

        setButtonBusy(registerBtn, btnText, btnSpinner, "Registering...");

        try {
            const response = await eel.register_user(email, password, fullname)();

            if (response && response.status === "success") {
                showMessage(messageDiv, "Registration successful! Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = DEFAULT_LOGIN_PAGE;
                }, 1200);
            } else {
                showMessage(messageDiv, (response && response.message) || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showMessage(messageDiv, "An error occurred during registration. Is the backend running?", "error");
        } finally {
            setButtonBusy(registerBtn, btnText, btnSpinner, null, "Register");
        }
    }

    // ---------------- Wire up whatever forms exist on this page ----------------
    document.addEventListener("DOMContentLoaded", function () {
        const loginForm = document.getElementById("loginForm");
        if (loginForm && document.getElementById("email") && !document.getElementById("fullname")) {
            loginForm.addEventListener("submit", handleLogin);
        }

        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", handleRegister);
        }

        const logoutLink = document.getElementById("logout");
        if (logoutLink) {
            logoutLink.addEventListener("click", function (e) {
                e.preventDefault();
                logoutUser();
            });
        }
    });

    // Expose to other scripts (navigate.js, main4.js)
    window.ProtonAuth = {
        isLoggedIn,
        requireLogin,
        logoutUser,
        getSession
    };
})();