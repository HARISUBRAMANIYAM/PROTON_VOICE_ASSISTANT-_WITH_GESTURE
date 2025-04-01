// navigation.js
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

// Make navigation functions globally available
window.navigateTo = navigateTo;
window.goBack = goBack;
window.goForward = goForward;

console.log("Navigation functions initialized");