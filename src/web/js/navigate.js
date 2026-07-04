// navigate.js — page navigation + session guard for Proton
// Relies on auth.js (window.ProtonAuth) being loaded first on protected pages.

function navigateTo(page) {
    console.log("Navigating to:", page);
    window.location.href = page;
}

function goBack() {
    console.log("goBack called");
    window.history.back();
}

function goForward() {
    console.log("goForward called");
    window.history.forward();
}

// Redirect to login if this is a protected page and no session exists.
(function guardPage() {
    const protectedPages = ["index.html", "about.html", "Gesture.html", ""];
    const current = window.location.pathname.split("/").pop();

    if (protectedPages.includes(current)) {
        if (window.ProtonAuth) {
            if (!window.ProtonAuth.isLoggedIn()) {
                console.warn("No active session — redirecting to login");
                window.location.href = ".Login.html";
            }
        } else {
            console.warn("auth.js not loaded on this page — session cannot be verified. " +
                "Add <script src=\"js/auth.js\"></script> before navigate.js.");
        }
    }
})();

// Shared logout wrapper used by pages that only load navigate.js
function logout() {
    if (window.ProtonAuth) {
        window.ProtonAuth.logoutUser();
    } else {
        if (window.eel && typeof eel.Logout === "function") {
            eel.Logout();
        }
        window.location.href = ".Login.html";
    }
}

// Make navigation functions globally available
window.navigateTo = navigateTo;
window.goBack = goBack;
window.goForward = goForward;
window.logout = logout;

console.log("Navigation functions initialized");