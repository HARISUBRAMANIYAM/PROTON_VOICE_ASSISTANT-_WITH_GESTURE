const elements = {
    userInput: document.getElementById("userInput"),
    userInputButton: document.getElementById("userInputButton"),
    messages: document.getElementById("messages"),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.querySelector(".sidebar"),
    menu: document.querySelector(".menu"),
    chatHistoryBtn: document.getElementById("chatHistoryBtn"),
    chatHistoryList: document.getElementById("chatHistoryFiles"),
    unifiedChatHistory: document.getElementById("unifiedChatHistory"),
    closeHistory: document.getElementById("closeHistory"),
    refreshHistory: document.getElementById("refreshHistory"),
    historyDisplayArea: document.getElementById("historyDisplayArea"),
    voiceButton: document.getElementById("voice-button"),
    logoutButton: document.getElementById("logout")
};

// Initialize Eel and expose functions
eel.expose(addUserMsg);
eel.expose(addAppMsg);
eel.expose(storeChatMessage);

// ==================== CHAT FUNCTIONS ====================
async function getUserInput() {
    const msg = elements.userInput.value.trim();
    if (!msg) return;

    console.log("User input:", msg);
    elements.userInput.value = "";

    addUserMsg(msg);
    await storeChatMessage("User", msg);

    try {
        const response = await eel.getUserInput(msg)();
        console.log("Proton Response:", response);

        if (response && response.message) {
            addAppMsg(response.message);
            await storeChatMessage("Proton", response.message);
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error:", error);
        addAppMsg("Error: Could not connect to assistant.");
    }
}

function addUserMsg(msg) {
    if (!elements.messages) return;
    elements.messages.innerHTML += `<div class="message from">${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

function addAppMsg(msg) {
    if (!elements.messages) return;
    elements.messages.innerHTML += `<div class="message to">${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

async function storeChatMessage(sender, message) {
    console.log(`Storing message: ${sender} - ${message}`);
    return eel.store_chat_message(sender, message)();
}

// ==================== CHAT HISTORY FUNCTIONS ====================
async function refreshChatHistory() {
    console.log("Refreshing chat history...");

    try {
        const response = await eel.getAllChatFiles()();
        if (response && Array.isArray(response.data)) {
            updateHistoryList(response.data);
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error fetching chat history:", error);
        showError("Failed to load chat history");
    }
}

function updateHistoryList(files) {
    if (!elements.chatHistoryList) return;

    elements.chatHistoryList.innerHTML = "";

    if (files && files.length > 0) {
        files.forEach(file => {
            const listItem = document.createElement("li");
            listItem.classList.add("chat-session-item");
            listItem.textContent = file.replace('.json', '').replace('chat_', '');
            listItem.addEventListener("click", () => loadChatFile(file));
            elements.chatHistoryList.appendChild(listItem);
        });
    } else {
        const noFilesMsg = document.createElement("li");
        noFilesMsg.textContent = "No chat history found";
        noFilesMsg.classList.add("no-history-item");
        elements.chatHistoryList.appendChild(noFilesMsg);
    }
}

async function loadChatFile(filename) {
    console.log("Loading chat file:", filename);
    if (!elements.historyDisplayArea) return;

    elements.historyDisplayArea.innerHTML = `<div class="loading-indicator">Loading chat...</div>`;

    try {
        const response = await eel.getChatHistory(filename)();
        if (response && Array.isArray(response.data)) {
            displayChatHistory(response.data, filename);
        } else {
            throw new Error("Invalid chat data format");
        }
    } catch (error) {
        console.error("Error loading chat file:", error);
        elements.historyDisplayArea.innerHTML =
            `<div class="error-message">Error loading chat: ${error.message}</div>`;
    }
}

function displayChatHistory(chatData, filename) {
    if (!elements.historyDisplayArea) return;

    elements.historyDisplayArea.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const header = document.createElement('div');
    header.className = 'chat-session-header';
    header.innerHTML = `<h3>${filename.replace('.json', '').replace('chat_', '')}</h3>`;
    fragment.appendChild(header);

    chatData.forEach(msg => {
        if (!msg || !msg.sender || !msg.message) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = msg.sender === 'User' ? 'history-message from' : 'history-message to';
        msgDiv.innerHTML = `
            <strong>${msg.sender}:</strong> 
            ${msg.message}
            ${msg.timestamp ? `<span class="timestamp">${msg.timestamp}</span>` : ''}
        `;
        fragment.appendChild(msgDiv);
    });

    elements.historyDisplayArea.appendChild(fragment);
    elements.historyDisplayArea.scrollTop = elements.historyDisplayArea.scrollHeight;
}

// ==================== UTILITY FUNCTIONS ====================
function toggleMenu() {
    if (elements.sidebar && elements.menu) {
        elements.sidebar.classList.toggle("visible");
        elements.menu.classList.toggle("active");
    }
}

function showError(message) {
    console.error(message);
    alert(message);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Chat input
    if (elements.userInputButton) {
        elements.userInputButton.addEventListener("click", getUserInput);
    }

    if (elements.userInput) {
        elements.userInput.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                getUserInput();
            }
        });
    }

    // Menu toggle
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener("click", toggleMenu);
    }

    // Chat history
    if (elements.chatHistoryBtn) {
        elements.chatHistoryBtn.addEventListener("click", () => {
            const isVisible = elements.unifiedChatHistory.style.display === "block";
            elements.unifiedChatHistory.style.display = isVisible ? "none" : "block";
            if (!isVisible) refreshChatHistory();
        });
    }

    if (elements.closeHistory) {
        elements.closeHistory.addEventListener("click", () => {
            elements.unifiedChatHistory.style.display = "none";
        });
    }

    if (elements.refreshHistory) {
        elements.refreshHistory.addEventListener("click", refreshChatHistory);
    }

    // Logout
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", () => eel.Logout());
    }
}

// ==================== INITIALIZATION ====================
async function initialize() {
    console.log("Initializing application...");
    setupEventListeners();

    // Load any existing chat history
    try {
        const history = await eel.get_chat_history()();
        if (history && Array.isArray(history.data)) {
            history.data.forEach(msg => {
                if (msg.sender === "User") {
                    addUserMsg(msg.message);
                } else {
                    addAppMsg(msg.message);
                }
            });
        }
    } catch (error) {
        console.error("Error initializing chat history:", error);
    }
}

// Start the application
document.addEventListener("DOMContentLoaded", initialize);
