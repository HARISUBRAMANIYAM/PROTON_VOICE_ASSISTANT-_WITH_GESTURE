// DOM Elements
/*const elements = {
    userInput: document.getElementById("userInput"),
    userInputButton: document.getElementById("userInputButton"),
    messages: document.getElementById("messages"),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.querySelector(".sidebar"),
    menu: document.querySelector(".menu"),
    chatHistoryBtn: document.getElementById("chatHistoryBtn"),
    chatHistoryContainer: document.querySelector(".chat-history-container"),
    closeCH: document.getElementById("closeCH"),
    chatHistoryList: document.getElementById("chat-history-list"),
    chatContent: document.getElementById("chat-content"),
    chatHistoryFilenames: document.getElementById("chatHistoryFilenames"),
    chatHistoryFiles: document.getElementById("chatHistoryFiles"),
    modal: document.querySelector(".modal"),
    closeModal: document.querySelector(".close"),
    logoutButton: document.getElementById("logout"),
    refreshHistory: document.getElementById("refreshHistory"),
    historyDisplayContainer: document.getElementById("history-display-container"),
    historyFileName: document.getElementById("history-file-name"),
    historyMessages: document.getElementById("history-messages"),
    closeHistoryBtn: document.getElementById("close-history-btn"),
    unifiedChatHistory: document.getElementById("unifiedChatHistory"),
    closeHistory: document.getElementById("closeHistory"),
    historyDisplayArea: document.getElementById("historyDisplayArea")
};

// Chat Functions
async function getUserInput() {
    let msg = elements.userInput.value.trim();

    if (msg.length !== 0) {
        console.log("User input:", msg);
        elements.userInput.value = "";

        addUserMsg(msg);  // Display user message in chat UI

        try {
            let response = await eel.getUserInput(msg)();  // Send input to Proton backend
            console.log("Proton Response:", response);
            addAppMsg(response);  // Display assistant response in chat UI
        } catch (error) {
            console.error("Eel Communication Error:", error);
            addAppMsg("Error: Could not connect to assistant.");
        }
    }
}

// Message Functions
function addUserMsg(msg) {
    if (!elements.messages) return;
    elements.messages.innerHTML += `<div class="message from"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

function addAppMsg(msg) {
    if (!elements.messages) return;
    elements.messages.innerHTML += `<div class="message to"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

// Refresh chat history from backend
function refreshChatHistory() {
    console.log("Refreshing chat history...");
    eel.getAllChatFiles()(function(files) {
        console.log("Retrieved chat history files:", files);
        updateHistoryList(elements.chatHistoryList, files, loadChatFile);
    });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - setting up event listeners");

    if (elements.userInputButton) {
        elements.userInputButton.addEventListener("click", getUserInput);
    }

    if (elements.userInput) {
        elements.userInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                getUserInput();
            }
        });
    }

    if (elements.chatHistoryBtn && elements.unifiedChatHistory) {
        elements.chatHistoryBtn.addEventListener("click", function() {
            elements.unifiedChatHistory.style.display = 
                elements.unifiedChatHistory.style.display === "block" ? "none" : "block";
            
            if (elements.unifiedChatHistory.style.display === "block") {
                refreshChatHistory();
            }
        });
    }

    if (elements.closeHistory) {
        elements.closeHistory.addEventListener("click", function() {
            elements.unifiedChatHistory.style.display = "none";
        });
    }

    if (elements.closeModal && elements.modal) {
        elements.closeModal.addEventListener("click", function() {
            elements.modal.style.display = "none";
        });
    }

    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", function() {
            eel.Logout();
        });
    }

    if (elements.refreshHistory) {
        elements.refreshHistory.addEventListener("click", refreshChatHistory);
    }
});

// Eel Exposed Functions
eel.expose(addUserMsg);
eel.expose(addAppMsg);

console.log("main.js fully loaded");
*/
/*// DOM Elements
const elements = {
    userInput: document.getElementById("userInput"),
    userInputButton: document.getElementById("userInputButton"),
    messages: document.getElementById("messages"),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.querySelector(".sidebar"),
    menu: document.querySelector(".menu"),
    chatHistoryBtn: document.getElementById("chatHistoryBtn"),
    chatHistoryContainer: document.querySelector(".chat-history-container"),
    closeCH: document.getElementById("closeCH"),
    chatHistoryList: document.getElementById("chat-history-list"),
    chatContent: document.getElementById("chat-content"),
    chatHistoryFilenames: document.getElementById("chatHistoryFilenames"),
    chatHistoryFiles: document.getElementById("chatHistoryFiles"),
    modal: document.querySelector(".modal"),
    closeModal: document.querySelector(".close"),
    logoutButton: document.getElementById("logout"),
    refreshHistory: document.getElementById("refreshHistory"),
    historyDisplayContainer: document.getElementById("history-display-container"),
    historyFileName: document.getElementById("history-file-name"),
    historyMessages: document.getElementById("history-messages"),
    closeHistoryBtn: document.getElementById("close-history-btn"),
    unifiedChatHistory: document.getElementById("unifiedChatHistory"),
    closeHistory: document.getElementById("closeHistory"),
    historyDisplayArea: document.getElementById("historyDisplayArea")
};

// Chat Functions
async function getUserInput() {
    let msg = elements.userInput.value.trim();

    if (msg.length !== 0) {
        console.log("User input:", msg);
        elements.userInput.value = "";

        addUserMsg(msg);  // Display user message in chat UI

        try {
            let response = await eel.getUserInput(msg)();  // Send input to Proton backend
            console.log("Proton Response:", response);
            addAppMsg(response);  // Display assistant response in chat UI
        } catch (error) {
            console.error("Eel Communication Error:", error);
            addAppMsg("Error: Could not connect to assistant.");
        }
    }
}

// Message Functions
function addUserMsg(msg) {
    if (!elements.messages) return;
    elements.messages.innerHTML += `<div class="message from"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

function addAppMsg(msg) {
    if (!elements.messages) return;
    elements.messages.innerHTML += `<div class="message to"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

// Menu Toggle Functionality
function toggleMenu() {
    if (elements.sidebar && elements.menu) {
        elements.sidebar.classList.toggle("visible");
        elements.menu.classList.toggle("active");
    }
}

// **FIXED: Chat History Functions**
async function refreshChatHistory() {
    console.log("Refreshing chat history...");
    
    try {
        let files = await eel.getAllChatFiles()();
        console.log("Retrieved chat history files:", files);
        updateHistoryList(elements.chatHistoryList, files, loadChatFile);
        updateHistoryList(elements.chatHistoryFilenames, files, loadChatFile);
        updateHistoryList(elements.chatHistoryFiles, files, loadChatFile);
    } catch (error) {
        console.error("Error fetching chat history:", error);
    }
}

// ✅ **Re-added `updateHistoryList()` function to fix chat history loading**
function updateHistoryList(listElement, files, onClickHandler) {
    if (!listElement) {
        console.log("chat history List element not found");
        return;
    }

    listElement.innerHTML = "";  // Clear previous content

    if (files && files.length > 0) {
        files.forEach(file => {
            const listItem = document.createElement("li");
            listItem.classList.add("chat-session-item");
            listItem.textContent = file;
            listItem.addEventListener("click", () => {
                console.log(`loading chat file :${file}`);
                onClickHandler(file)});
            listElement.appendChild(listItem);
        });
    } else {
        console.warn("No chat History found");
        const noFilesMessage = document.createElement("li");
        noFilesMessage.textContent = "No chat history found";
        listElement.appendChild(noFilesMessage);
    }
    if (listElement.style.display ==="none"){
        listElement.style.display ="block";
    }
}

// ✅ **Chat File Loading and Display**
async function loadChatFile(fileName) {
    console.log("Loading chat file:", fileName);

    if (!elements.historyDisplayArea) {
        console.error("History display area not found");
        return;
    }

    elements.historyDisplayArea.innerHTML = `<div class="loading-indicator">Loading chat...</div>`;

    try {
        let chatData = await eel.getChatHistory(fileName)();
        console.log("Chat History Loaded:", chatData);

        if (!chatData || !chatData.data || !Array.isArray(chatData.data)) {
            throw new Error("Invalid chat data format");
        }

        displayChatInHistoryContainer(chatData.data, fileName);
        
        if (elements.unifiedChatHistory) {
            elements.unifiedChatHistory.style.display = "block";
        }
    } catch (error) {
        console.error("Error loading chat file:", error);
        elements.historyDisplayArea.innerHTML = `<div class="error-message">Error loading chat</div>`;
    }
}

function displayChatInHistoryContainer(chatData, fileName) {
    if (!elements.historyDisplayArea) {
        console.error("History display area not found");
        return;
    }

    elements.historyDisplayArea.innerHTML = ''; // Clear previous chat

    const fragment = document.createDocumentFragment();

    const headerElement = document.createElement('div');
    headerElement.className = 'chat-session-header';
    const titleElement = document.createElement('h3');
    titleElement.textContent = fileName || "Chat Session";
    headerElement.appendChild(titleElement);
    fragment.appendChild(headerElement);

    chatData.forEach(message => {
        if (!message.sender || !message.message) {
            console.warn("Invalid message format:", message);
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.className = message.sender === 'User' ? 'history-message to' : 'history-message from';
        messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.message}`;
        fragment.appendChild(messageElement);
    });

    elements.historyDisplayArea.appendChild(fragment);
    elements.historyDisplayArea.scrollTop = elements.historyDisplayArea.scrollHeight;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - setting up event listeners");

    if (elements.userInputButton) {
        elements.userInputButton.addEventListener("click", getUserInput);
    }

    if (elements.userInput) {
        elements.userInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                getUserInput();
            }
        });
    }

    if (elements.menuToggle) {
        elements.menuToggle.addEventListener("click", toggleMenu);
    }

    if (elements.chatHistoryBtn && elements.unifiedChatHistory) {
        elements.chatHistoryBtn.addEventListener("click", function() {
            elements.unifiedChatHistory.style.display = 
                elements.unifiedChatHistory.style.display === "block" ? "none" : "block";
            
            if (elements.unifiedChatHistory.style.display === "block") {
                refreshChatHistory();
            }
        });
    }

    if (elements.closeHistory) {
        elements.closeHistory.addEventListener("click", function() {
            elements.unifiedChatHistory.style.display = "none";
        });
    }

    if (elements.closeModal && elements.modal) {
        elements.closeModal.addEventListener("click", function() {
            elements.modal.style.display = "none";
        });
    }

    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", function() {
            eel.Logout();
        });
    }

    if (elements.refreshHistory) {
        elements.refreshHistory.addEventListener("click", refreshChatHistory);
    }
});

// Eel Exposed Functions
eel.expose(addUserMsg);
eel.expose(addAppMsg);
*/
console.log("main.js fully loaded");

// DOM Elements
// const elements = {
//     userInput: document.getElementById("userInput"),
//     userInputButton: document.getElementById("userInputButton"),
//     messages: document.getElementById("messages"),
//     menuToggle: document.getElementById("menuToggle"),
//     sidebar: document.querySelector(".sidebar"),
//     menu: document.querySelector(".menu"),
//     chatHistoryBtn: document.getElementById("chatHistoryBtn"),
//     chatHistoryContainer: document.querySelector(".chat-history-container"),
//     closeCH: document.getElementById("closeCH"),
//     chatHistoryList: document.getElementById("chat-history-list"),
//     chatContent: document.getElementById("chat-content"),
//     chatHistoryFilenames: document.getElementById("chatHistoryFilenames"),
//     chatHistoryFiles: document.getElementById("chatHistoryFiles"),
//     modal: document.querySelector(".modal"),
//     closeModal: document.querySelector(".close"),
//     logoutButton: document.getElementById("logout"),
//     refreshHistory: document.getElementById("refreshHistory"),
//     historyDisplayContainer: document.getElementById("history-display-container"),
//     historyFileName: document.getElementById("history-file-name"),
//     historyMessages: document.getElementById("history-messages"),
//     closeHistoryBtn: document.getElementById("close-history-btn"),
//     unifiedChatHistory: document.getElementById("unifiedChatHistory"),
//     closeHistory: document.getElementById("closeHistory"),
//     historyDisplayArea: document.getElementById("historyDisplayArea"),
//     voiceButton: document.getElementById("voice-button") || document.createElement("button")
//      // Added voice button
// };

// // Initialize Eel and expose functions
// eel.expose(addUserMsg);
// eel.expose(addAppMsg);
// eel.expose(storeChatMessage);
// eel.expose(isUserInput);
// eel.expose(getUserInputFromUI);


// // Chat Functions
// async function getUserInput() {
//     let msg = elements.userInput.value.trim();

//     if (msg.length !== 0) {
//         console.log("User input:", msg);
//         elements.userInput.value = "";

//         addUserMsg(msg);  // Display user message in chat UI
//         await storeChatMessage("User", msg); // Store message in history

//         try {
//             let response = await eel.getUserInput(msg)();  // Send input to Proton backend
//             console.log("Proton Response:", response);
//             addAppMsg(response.message);  // Display assistant response in chat UI
//             await storeChatMessage("Proton", response.message); // Store assistant response
//         } catch (error) {
//             console.error("Eel Communication Error:", error);
//             addAppMsg("Error: Could not connect to assistant.");
//         }
//     }
// }

// // Message Functions
// function addUserMsg(msg) {
//     if (!elements.messages) return;
//     elements.messages.innerHTML += `<div class="message from"> ${msg}</div>`;
//     elements.messages.scrollTop = elements.messages.scrollHeight;
// }

// function addAppMsg(msg) {
//     if (!elements.messages) return;
//     elements.messages.innerHTML += `<div class="message to"> ${msg}</div>`;
//     elements.messages.scrollTop = elements.messages.scrollHeight;
// }

// // Store chat message (exposed to Python)
// function storeChatMessage(sender, message) {
//     console.log(`Storing message: ${sender} - ${message}`);
//     return eel.store_chat_message(sender, message)();
// }

// // Check for user input (exposed to Python)
// function isUserInput() {
//     return elements.userInput.value.trim() !== '';
// }

// // Get user input from UI (exposed to Python)
// function getUserInputFromUI() {
//     const input = elements.userInput;
//     const msg = input.value.trim();
//     input.value = '';
//     return msg;
// }

// // Menu Toggle Functionality
// function toggleMenu() {
//     if (elements.sidebar && elements.menu) {
//         elements.sidebar.classList.toggle("visible");
//         elements.menu.classList.toggle("active");
//     }
// }

// // Chat History Functions
// async function refreshChatHistory() {
//     console.log("Refreshing chat history...");
    
//     try {
//         let files = await eel.getAllChatFiles()();
//         console.log("Retrieved chat history files:", files);
//         updateHistoryList(elements.chatHistoryList, files, loadChatFile);
//         updateHistoryList(elements.chatHistoryFilenames, files, loadChatFile);
//         updateHistoryList(elements.chatHistoryFiles, files, loadChatFile);
//     } catch (error) {
//         console.error("Error fetching chat history:", error);
//     }
// }

// function updateHistoryList(listElement, files, onClickHandler) {
//     if (!listElement) {
//         console.log("chat history List element not found");
//         return;
//     }

//     listElement.innerHTML = "";  // Clear previous content

//     if (files && files.length > 0) {
//         files.forEach(file => {
//             const listItem = document.createElement("li");
//             listItem.classList.add("chat-session-item");
//             listItem.textContent = file;
//             listItem.addEventListener("click", () => {
//                 console.log(`loading chat file :${file}`);
//                 onClickHandler(file)});
//             listElement.appendChild(listItem);
//         });
//     } else {
//         console.warn("No chat History found");
//         const noFilesMessage = document.createElement("li");
//         noFilesMessage.textContent = "No chat history found";
//         listElement.appendChild(noFilesMessage);
//     }
//     if (listElement.style.display ==="none"){
//         listElement.style.display ="block";
//     }
// }

// // Chat File Loading and Display
// async function loadChatFile(fileName) {
//     console.log("Loading chat file:", fileName);

//     if (!elements.historyDisplayArea) {
//         console.error("History display area not found");
//         return;
//     }

//     elements.historyDisplayArea.innerHTML = `<div class="loading-indicator">Loading chat...</div>`;

//     try {
//         let chatData = await eel.getChatHistory(fileName)();
//         console.log("Chat History Loaded:", chatData);

//         if (!chatData || !chatData.data || !Array.isArray(chatData.data)) {
//             throw new Error("Invalid chat data format");
//         }

//         displayChatInHistoryContainer(chatData.data, fileName);
        
//         if (elements.unifiedChatHistory) {
//             elements.unifiedChatHistory.style.display = "block";
//         }
//     } catch (error) {
//         console.error("Error loading chat file:", error);
//         elements.historyDisplayArea.innerHTML = `<div class="error-message">Error loading chat</div>`;
//     }
// }

// function displayChatInHistoryContainer(chatData, fileName) {
//     if (!elements.historyDisplayArea) {
//         console.error("History display area not found");
//         return;
//     }

//     elements.historyDisplayArea.innerHTML = ''; // Clear previous chat

//     const fragment = document.createDocumentFragment();

//     const headerElement = document.createElement('div');
//     headerElement.className = 'chat-session-header';
//     const titleElement = document.createElement('h3');
//     titleElement.textContent = fileName || "Chat Session";
//     headerElement.appendChild(titleElement);
//     fragment.appendChild(headerElement);

//     chatData.forEach(message => {
//         if (!message.sender || !message.message) {
//             console.warn("Invalid message format:", message);
//             return;
//         }

//         const messageElement = document.createElement('div');
//         messageElement.className = message.sender === 'User' ? 'history-message to' : 'history-message from';
//         messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.message}`;
//         fragment.appendChild(messageElement);
//     });

//     elements.historyDisplayArea.appendChild(fragment);
//     elements.historyDisplayArea.scrollTop = elements.historyDisplayArea.scrollHeight;
// }

// // Voice Input Functionality
// function setupVoiceRecognition() {
//     if (!('webkitSpeechRecognition' in window)) {
//         console.warn("Web Speech API not supported");
//         return;
//     }

//     const recognition = new webkitSpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     elements.voiceButton.addEventListener('click', () => {
//         try {
//             recognition.start();
//             elements.voiceButton.classList.add('recording');
//             elements.userInput.placeholder = "Listening...";
//         } catch (error) {
//             console.error("Voice recognition error:", error);
//         }
//     });

//     recognition.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         elements.userInput.value = transcript;
//         elements.voiceButton.classList.remove('recording');
//         elements.userInput.placeholder = "Type your message...";
//         getUserInput();
//     };

//     recognition.onerror = (event) => {
//         console.error("Voice recognition error:", event.error);
//         elements.voiceButton.classList.remove('recording');
//         elements.userInput.placeholder = "Type your message...";
//     };
// }

// // Initialize Chat History on Load
// async function initializeChatHistory() {
//     try {
//         const history = await eel.get_chat_history()();
//         if (history.status === "success" && history.data) {
//             history.data.forEach(msg => {
//                 if (msg.sender === "User") {
//                     addUserMsg(msg.message);
//                 } else {
//                     addAppMsg(msg.message);
//                 }
//             });
//         }
//     } catch (error) {
//         console.error("Error initializing chat history:", error);
//     }
// }

// // Event Listeners
// document.addEventListener("DOMContentLoaded", function() {
//     console.log("DOM loaded - setting up event listeners");

//     // Initialize voice recognition if button exists
//     if (elements.voiceButton) {
//         setupVoiceRecognition();
//     }

//     // Initialize chat history
//     initializeChatHistory();

//     // Existing event listeners
//     if (elements.userInputButton) {
//         elements.userInputButton.addEventListener("click", getUserInput);
//     }

//     if (elements.userInput) {
//         elements.userInput.addEventListener("keyup", function(event) {
//             if (event.key === "Enter") {
//                 event.preventDefault();
//                 getUserInput();
//             }
//         });
//     }

//     if (elements.menuToggle) {
//         elements.menuToggle.addEventListener("click", toggleMenu);
//     }

//     if (elements.chatHistoryBtn && elements.unifiedChatHistory) {
//         elements.chatHistoryBtn.addEventListener("click", function() {
//             elements.unifiedChatHistory.style.display = 
//                 elements.unifiedChatHistory.style.display === "block" ? "none" : "block";
            
//             if (elements.unifiedChatHistory.style.display === "block") {
//                 refreshChatHistory();
//             }
//         });
//     }

//     if (elements.closeHistory) {
//         elements.closeHistory.addEventListener("click", function() {
//             elements.unifiedChatHistory.style.display = "none";
//         });
//     }

//     if (elements.closeModal && elements.modal) {
//         elements.closeModal.addEventListener("click", function() {
//             elements.modal.style.display = "none";
//         });
//     }

//     if (elements.logoutButton) {
//         elements.logoutButton.addEventListener("click", function() {
//             eel.Logout();
//         });
//     }

//     if (elements.refreshHistory) {
//         elements.refreshHistory.addEventListener("click", refreshChatHistory);
//     }
// });

// console.log("main.js fully loaded");

// DOM Elements
/*const elements = {
    // Chat elements
    userInput: document.getElementById("userInput"),
    userInputButton: document.getElementById("userInputButton"),
    messages: document.getElementById("messages"),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.querySelector(".sidebar"),
    menu: document.querySelector(".menu"),
    chatHistoryBtn: document.getElementById("chatHistoryBtn"),
    chatHistoryContainer: document.querySelector(".chat-history-container"),
    closeCH: document.getElementById("closeCH"),
    chatHistoryList: document.getElementById("chat-history-list"),
    chatContent: document.getElementById("chat-content"),
    chatHistoryFilenames: document.getElementById("chatHistoryFilenames"),
    chatHistoryFiles: document.getElementById("chatHistoryFiles"),
    modal: document.querySelector(".modal"),
    closeModal: document.querySelector(".close"),
    logoutButton: document.getElementById("logout"),
    refreshHistory: document.getElementById("refreshHistory"),
    historyDisplayContainer: document.getElementById("history-display-container"),
    historyFileName: document.getElementById("history-file-name"),
    historyMessages: document.getElementById("history-messages"),
    closeHistoryBtn: document.getElementById("close-history-btn"),
    unifiedChatHistory: document.getElementById("unifiedChatHistory"),
    closeHistory: document.getElementById("closeHistory"),
    historyDisplayArea: document.getElementById("historyDisplayArea"),
    voiceButton: document.getElementById("voice-button") || document.createElement("button"),
    
    // Gesture control elements
    gestureVideoContainer: document.getElementById("gesture-video-container"),
    gestureVideoFeed: document.getElementById("gesture-video-feed"),
    startGestureBtn: document.getElementById("start-gesture-btn"),
    stopGestureBtn: document.getElementById("stop-gesture-btn"),
    gestureStatus: document.getElementById("gesture-status-indicator")
};

// Initialize Eel and expose functions
eel.expose(addUserMsg);
eel.expose(addAppMsg);
eel.expose(storeChatMessage);
eel.expose(isUserInput);
eel.expose(getUserInputFromUI);

// Chat Functions
async function getUserInput() {
    let msg = elements.userInput.value.trim();

    if (msg.length !== 0) {
        console.log("User input:", msg);
        elements.userInput.value = "";

        addUserMsg(msg);
        await storeChatMessage("User", msg);

        try {
            let response = await eel.getUserInput(msg)();
            console.log("Proton Response:", response);
            
            if (response && response.message) {
                addAppMsg(response.message);
                await storeChatMessage("Proton", response.message);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Eel Communication Error:", error);
            addAppMsg("Error: Could not connect to assistant.");
        }
    }
}

// Message Functions
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

// Chat History Management
async function refreshChatHistory() {
    console.log("Refreshing chat history...");
    
    try {
        let files = await eel.getAllChatFiles()();
        console.log("Retrieved chat history files:", files);
        
        if (files && Array.isArray(files)) {
            updateHistoryList(elements.chatHistoryList, files, loadChatFile);
            updateHistoryList(elements.chatHistoryFilenames, files, loadChatFile);
            updateHistoryList(elements.chatHistoryFiles, files, loadChatFile);
        } else {
            throw new Error("No files array received");
        }
    } catch (error) {
        console.error("Error fetching chat history:", error);
        showError("Failed to load chat history. Please try again.");
    }
}

function updateHistoryList(listElement, files, onClickHandler) {
    if (!listElement) {
        console.log("Chat history list element not found");
        return;
    }

    listElement.innerHTML = "";

    if (files && files.length > 0) {
        files.forEach(file => {
            const listItem = document.createElement("li");
            listItem.classList.add("chat-session-item");
            listItem.textContent = file.replace('.json', '').replace('chat_', '');
            listItem.addEventListener("click", () => onClickHandler(file));
            listElement.appendChild(listItem);
        });
    } else {
        const noFilesMessage = document.createElement("li");
        noFilesMessage.textContent = "No chat history found";
        noFilesMessage.classList.add("no-history-item");
        listElement.appendChild(noFilesMessage);
    }
    
    if (listElement.style.display === "none") {
        listElement.style.display = "block";
    }
}

async function loadChatFile(filename) {
    console.log("Loading chat file:", filename);

    if (!elements.historyDisplayArea) {
        console.error("History display area not found");
        return;
    }

    elements.historyDisplayArea.innerHTML = `<div class="loading-indicator">Loading chat...</div>`;

    try {
        let response = await eel.getChatHistory(filename)();
        console.log("Chat History Response:", response);

        if (response && Array.isArray(response.data)) {
            displayChatInHistoryContainer(response.data, filename);
            elements.unifiedChatHistory.style.display = "block";
        } else {
            throw new Error("Invalid chat data format received");
        }
    } catch (error) {
        console.error("Error loading chat file:", error);
        elements.historyDisplayArea.innerHTML = 
            `<div class="error-message">Error loading chat: ${error.message}</div>`;
    }
}

function displayChatInHistoryContainer(chatData, fileName) {
    if (!elements.historyDisplayArea) return;

    elements.historyDisplayArea.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const headerElement = document.createElement('div');
    headerElement.className = 'chat-session-header';
    const titleElement = document.createElement('h3');
    titleElement.textContent = fileName.replace('.json', '').replace('chat_', '');
    headerElement.appendChild(titleElement);
    fragment.appendChild(headerElement);

    chatData.forEach(message => {
        if (!message || !message.sender || !message.message) return;

        const messageElement = document.createElement('div');
        messageElement.className = message.sender === 'User' ? 'history-message from' : 'history-message to';
        
        const timestamp = message.timestamp ? 
            `<span class="message-timestamp">${message.timestamp}</span>` : '';
            
        messageElement.innerHTML = `
            <strong>${message.sender}:</strong> 
            ${message.message}
            ${timestamp}
        `;
        fragment.appendChild(messageElement);
    });

    elements.historyDisplayArea.appendChild(fragment);
    elements.historyDisplayArea.scrollTop = elements.historyDisplayArea.scrollHeight;
}

// Gesture Control Functions
function setupGestureControl() {
    if (elements.startGestureBtn) {
        elements.startGestureBtn.addEventListener('click', startGestureControl);
    }
    
    if (elements.stopGestureBtn) {
        elements.stopGestureBtn.addEventListener('click', stopGestureControl);
    }
}

function startGestureControl() {
    eel.start_gesture()(function(response) {
        if (response && response.status === "success") {
            console.log("Gesture control started");
            updateGestureStatus(true);
            updateGestureVideo();
        } else {
            console.error("Failed to start gesture control:", response?.message);
            updateGestureStatus(false);
        }
    });
}

function stopGestureControl() {
    eel.stop_gesture()(function(response) {
        if (response && response.status === "success") {
            console.log("Gesture control stopped");
            updateGestureStatus(false);
            if (elements.gestureVideoContainer) {
                elements.gestureVideoContainer.style.display = "none";
            }
        } else {
            console.error("Failed to stop gesture control:", response?.message);
        }
    });
}

function updateGestureStatus(isActive) {
    if (!elements.gestureStatus) return;
    
    elements.gestureStatus.textContent = isActive ? "Active" : "Inactive";
    elements.gestureStatus.className = isActive ? "active" : "inactive";
}

function updateGestureVideo() {
    if (!elements.gestureVideoContainer || !elements.gestureVideoFeed) return;
    
    eel.get_video_frame()(function(frameData) {
        if (frameData) {
            elements.gestureVideoFeed.src = `data:image/jpeg;base64,${frameData}`;
            elements.gestureVideoContainer.style.display = "block";
        } else {
            elements.gestureVideoContainer.style.display = "none";
        }
        
        // Continue updating if gesture control is active
        eel.is_gesture_active()(function(isActive) {
            if (isActive) {
                requestAnimationFrame(updateGestureVideo);
            }
        });
    });
}

// Utility Functions
function showError(message) {
    console.error(message);
    alert(message); // Or use a more sophisticated error display
}

function showInfo(message) {
    console.log(message);
    // Could implement a toast notification or similar
}

// Initialize Chat History
async function initializeChatHistory() {
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

// Verify Chat Directory
async function verifyChatDirectory() {
    try {
        const result = await eel.verify_chat_directory()();
        console.log("Chat directory status:", result);
        
        if (!result.exists) {
            console.error("Chat directory does not exist:", result.path);
            showError("Chat history directory not found");
        } else if (!result.writable) {
            console.error("Chat directory not writable:", result.path);
            showError("Cannot save chat history - directory not writable");
        }
    } catch (error) {
        console.error("Error verifying chat directory:", error);
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - setting up event listeners");

    // Initialize systems
    verifyChatDirectory();
    initializeChatHistory();
    setupGestureControl();

    // Chat event listeners
    if (elements.userInputButton) {
        elements.userInputButton.addEventListener("click", getUserInput);
    }

    if (elements.userInput) {
        elements.userInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                getUserInput();
            }
        });
    }

    if (elements.menuToggle) {
        elements.menuToggle.addEventListener("click", toggleMenu);
    }

    if (elements.chatHistoryBtn && elements.unifiedChatHistory) {
        elements.chatHistoryBtn.addEventListener("click", function() {
            elements.unifiedChatHistory.style.display = 
                elements.unifiedChatHistory.style.display === "block" ? "none" : "block";
            
            if (elements.unifiedChatHistory.style.display === "block") {
                refreshChatHistory();
            }
        });
    }

    if (elements.closeHistory) {
        elements.closeHistory.addEventListener("click", function() {
            elements.unifiedChatHistory.style.display = "none";
        });
    }

    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", function() {
            eel.Logout();
        });
    }

    if (elements.refreshHistory) {
        elements.refreshHistory.addEventListener("click", refreshChatHistory);
    }
});

console.log("main.js fully loaded");*/
/// DOM Elements
//******************************************************************working model 
/*const elements = {
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
    voiceButton: document.getElementById("voice-button") || null,
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

    // Add header
    const header = document.createElement('div');
    header.className = 'chat-session-header';
    header.innerHTML = `<h3>${filename.replace('.json', '').replace('chat_', '')}</h3>`;
    fragment.appendChild(header);

    // Add messages
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

// ==================== VOICE RECOGNITION ====================
function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("Web Speech API not supported");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    elements.voiceButton.addEventListener('click', () => {
        try {
            recognition.start();
            elements.voiceButton.classList.add('recording');
            elements.userInput.placeholder = "Listening...";
        } catch (error) {
            console.error("Voice recognition error:", error);
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.userInput.value = transcript;
        elements.voiceButton.classList.remove('recording');
        elements.userInput.placeholder = "Type your message...";
        getUserInput();
    };

    recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        elements.voiceButton.classList.remove('recording');
        elements.userInput.placeholder = "Type your message...";
    };
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

    // Voice recognition
    if (elements.voiceButton) {
        setupVoiceRecognition();
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
console.log("main.js fully loaded");*/
// DOM Elements (Combined for both chat and gesture pages)
// const elements = {
//     // Common elements
//     menuToggle: document.getElementById("menuToggle"),
//     sidebar: document.querySelector(".sidebar"),
//     menu: document.querySelector(".menu"),
//     logoutButton: document.getElementById("logout"),
    
//     // Chat page elements
//     userInput: document.getElementById("userInput"),
//     userInputButton: document.getElementById("userInputButton"),
//     messages: document.getElementById("messages"),
//     chatHistoryBtn: document.getElementById("chatHistoryBtn"),
//     chatHistoryList: document.getElementById("chatHistoryFiles"),
//     unifiedChatHistory: document.getElementById("unifiedChatHistory"),
//     closeHistory: document.getElementById("closeHistory"),
//     refreshHistory: document.getElementById("refreshHistory"),
//     historyDisplayArea: document.getElementById("historyDisplayArea"),
//     voiceButton: document.getElementById("voice-button"),
    
//     // Gesture page elements
//     videoFeed: document.getElementById("video-feed"),
//     startGestureBtn: document.querySelector(".start-btn"),
//     stopGestureBtn: document.querySelector(".stop-btn"),
//     statsPanel: document.querySelector(".stats-panel") || document.createElement("div")
// };

// // State variables
// let isGestureActive = false;
// let videoStreamInterval = null;
// let frameRate = 100; // Default 10fps (1000ms/100ms)
// const gestureHistory = [];
// const MAX_HISTORY = 20;

// // Initialize Eel and expose functions
// eel.expose(addUserMsg);
// eel.expose(addAppMsg);
// eel.expose(storeChatMessage);
// eel.expose(updateGestureHistory);

// // ==================== CHAT FUNCTIONS ====================
// async function getUserInput() {
//     const msg = elements.userInput.value.trim();
//     if (!msg) return;

//     console.log("User input:", msg);
//     elements.userInput.value = "";

//     addUserMsg(msg);
//     await storeChatMessage("User", msg);

//     try {
//         const response = await eel.getUserInput(msg)();
//         console.log("Proton Response:", response);
        
//         if (response && response.message) {
//             addAppMsg(response.message);
//             await storeChatMessage("Proton", response.message);
//         } else {
//             throw new Error("Invalid response format");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         addAppMsg("Error: Could not connect to assistant.");
//     }
// }

// function addUserMsg(msg) {
//     if (!elements.messages) return;
//     elements.messages.innerHTML += `<div class="message from">${msg}</div>`;
//     elements.messages.scrollTop = elements.messages.scrollHeight;
// }

// function addAppMsg(msg) {
//     if (!elements.messages) return;
//     elements.messages.innerHTML += `<div class="message to">${msg}</div>`;
//     elements.messages.scrollTop = elements.messages.scrollHeight;
// }

// async function storeChatMessage(sender, message) {
//     console.log(`Storing message: ${sender} - ${message}`);
//     return eel.store_chat_message(sender, message)();
// }

// // ==================== CHAT HISTORY FUNCTIONS ====================
// async function refreshChatHistory() {
//     console.log("Refreshing chat history...");
    
//     try {
//         const response = await eel.getAllChatFiles()();
//         if (response && Array.isArray(response.data)) {
//             updateHistoryList(response.data);
//         } else {
//             throw new Error("Invalid response format");
//         }
//     } catch (error) {
//         console.error("Error fetching chat history:", error);
//         showError("Failed to load chat history");
//     }
// }

// function updateHistoryList(files) {
//     if (!elements.chatHistoryList) return;

//     elements.chatHistoryList.innerHTML = "";

//     if (files && files.length > 0) {
//         files.forEach(file => {
//             const listItem = document.createElement("li");
//             listItem.classList.add("chat-session-item");
//             listItem.textContent = file.replace('.json', '').replace('chat_', '');
//             listItem.addEventListener("click", () => loadChatFile(file));
//             elements.chatHistoryList.appendChild(listItem);
//         });
//     } else {
//         const noFilesMsg = document.createElement("li");
//         noFilesMsg.textContent = "No chat history found";
//         noFilesMsg.classList.add("no-history-item");
//         elements.chatHistoryList.appendChild(noFilesMsg);
//     }
// }

// async function loadChatFile(filename) {
//     console.log("Loading chat file:", filename);
//     if (!elements.historyDisplayArea) return;

//     elements.historyDisplayArea.innerHTML = `<div class="loading-indicator">Loading chat...</div>`;

//     try {
//         const response = await eel.getChatHistory(filename)();
//         if (response && Array.isArray(response.data)) {
//             displayChatHistory(response.data, filename);
//         } else {
//             throw new Error("Invalid chat data format");
//         }
//     } catch (error) {
//         console.error("Error loading chat file:", error);
//         elements.historyDisplayArea.innerHTML = 
//             `<div class="error-message">Error loading chat: ${error.message}</div>`;
//     }
// }

// function displayChatHistory(chatData, filename) {
//     if (!elements.historyDisplayArea) return;

//     elements.historyDisplayArea.innerHTML = '';
//     const fragment = document.createDocumentFragment();

//     // Add header
//     const header = document.createElement('div');
//     header.className = 'chat-session-header';
//     header.innerHTML = `<h3>${filename.replace('.json', '').replace('chat_', '')}</h3>`;
//     fragment.appendChild(header);

//     // Add messages
//     chatData.forEach(msg => {
//         if (!msg || !msg.sender || !msg.message) return;

//         const msgDiv = document.createElement('div');
//         msgDiv.className = msg.sender === 'User' ? 'history-message from' : 'history-message to';
//         msgDiv.innerHTML = `
//             <strong>${msg.sender}:</strong> 
//             ${msg.message}
//             ${msg.timestamp ? `<span class="timestamp">${msg.timestamp}</span>` : ''}
//         `;
//         fragment.appendChild(msgDiv);
//     });

//     elements.historyDisplayArea.appendChild(fragment);
//     elements.historyDisplayArea.scrollTop = elements.historyDisplayArea.scrollHeight;
// }

// // ==================== GESTURE CONTROL FUNCTIONS ====================
// function updateGestureHistory(gesture, hand) {
//     // Add to beginning of array
//     gestureHistory.unshift({
//         timestamp: new Date().toISOString(),
//         gesture: gesture,
//         hand: hand
//     });
    
//     // Keep only the last MAX_HISTORY items
//     if (gestureHistory.length > MAX_HISTORY) {
//         gestureHistory.pop();
//     }
    
//     updateStatsDisplay();
// }

// function updateStatsDisplay() {
//     if (!elements.statsPanel) return;
    
//     // Create stats panel if it doesn't exist
//     if (!document.contains(elements.statsPanel)) {
//         elements.statsPanel = document.createElement('div');
//         elements.statsPanel.className = 'stats-panel';
//         document.querySelector('.video-container').appendChild(elements.statsPanel);
//     }
    
//     // Update FPS display
//     const fpsDisplay = elements.statsPanel.querySelector('.fps-display') || document.createElement('div');
//     fpsDisplay.className = 'fps-display';
//     fpsDisplay.textContent = `FPS: ${calculateFPS()}`;
    
//     // Update gesture display
//     const gestureDisplay = elements.statsPanel.querySelector('.gesture-display') || document.createElement('div');
//     gestureDisplay.className = 'gesture-display';
    
//     if (gestureHistory.length > 0) {
//         gestureDisplay.textContent = `Last Gesture: ${gestureHistory[0].gesture} (${gestureHistory[0].hand})`;
//     } else {
//         gestureDisplay.textContent = 'Last Gesture: None';
//     }
    
//     // Add elements if they don't exist
//     if (!elements.statsPanel.querySelector('.fps-display')) {
//         elements.statsPanel.appendChild(fpsDisplay);
//     }
//     if (!elements.statsPanel.querySelector('.gesture-display')) {
//         elements.statsPanel.appendChild(gestureDisplay);
//     }
// }

// function calculateFPS() {
//     // Simple FPS calculation (implement your own logic if needed)
//     return Math.floor(Math.random() * 10) + 20; // Simulated 20-30 FPS
// }

// async function startGestureControl() {
//     if (isGestureActive) return;
    
//     try {
//         // UI feedback
//         if (elements.startGestureBtn) {
//             elements.startGestureBtn.disabled = true;
//             elements.startGestureBtn.textContent = 'Initializing...';
//         }
        
//         const response = await eel.start_gesture()();
//         console.log("Gesture control started:", response.message);
//         isGestureActive = true;
        
//         // Update UI
//         if (elements.startGestureBtn) {
//             elements.startGestureBtn.classList.add('active');
//             elements.startGestureBtn.disabled = false;
//             elements.startGestureBtn.textContent = 'Stop Gesture Control';
//         }
        
//         // Start video streaming
//         startVideoStream();
        
//     } catch (error) {
//         console.error("Error starting gesture control:", error);
//         showError("Failed to start gesture control");
        
//         // Reset UI
//         if (elements.startGestureBtn) {
//             elements.startGestureBtn.disabled = false;
//             elements.startGestureBtn.textContent = 'Start Gesture Control';
//         }
//     }
// }

// async function stopGestureControl() {
//     if (!isGestureActive) return;
    
//     try {
//         // UI feedback
//         if (elements.stopGestureBtn) {
//             elements.stopGestureBtn.disabled = true;
//             elements.stopGestureBtn.textContent = 'Stopping...';
//         }
        
//         const response = await eel.stop_gesture()();
//         console.log("Gesture control stopped:", response.message);
//         isGestureActive = false;
        
//         // Update UI
//         if (elements.startGestureBtn) {
//             elements.startGestureBtn.classList.remove('active');
//             elements.startGestureBtn.textContent = 'Start Gesture Control';
//         }
//         if (elements.stopGestureBtn) {
//             elements.stopGestureBtn.disabled = false;
//             elements.stopGestureBtn.textContent = 'Gesture Control Stopped';
//         }
        
//         // Stop video streaming
//         stopVideoStream();
        
//     } catch (error) {
//         console.error("Error stopping gesture control:", error);
//         showError("Failed to stop gesture control");
        
//         // Reset UI
//         if (elements.stopGestureBtn) {
//             elements.stopGestureBtn.disabled = false;
//             elements.stopGestureBtn.textContent = 'Stop Gesture Control';
//         }
//     }
// }

// function startVideoStream() {
//     stopVideoStream(); // Clear any existing stream
    
//     videoStreamInterval = setInterval(async () => {
//         if (!isGestureActive || !elements.videoFeed) {
//             stopVideoStream();
//             return;
//         }
        
//         try {
//             const frameData = await eel.get_video_frame()();
//             if (frameData) {
//                 elements.videoFeed.src = `data:image/jpeg;base64,${frameData}`;
//                 updateStatsDisplay();
//             }
//         } catch (error) {
//             console.error("Error getting video frame:", error);
//             stopVideoStream();
//         }
//     }, frameRate);
// }

// function stopVideoStream() {
//     if (videoStreamInterval) {
//         clearInterval(videoStreamInterval);
//         videoStreamInterval = null;
//     }
    
//     if (elements.videoFeed) {
//         elements.videoFeed.src = '';
//     }
// }

// function takeSnapshot() {
//     if (elements.videoFeed && elements.videoFeed.src) {
//         const canvas = document.createElement('canvas');
//         canvas.width = elements.videoFeed.videoWidth || 640;
//         canvas.height = elements.videoFeed.videoHeight || 480;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(elements.videoFeed, 0, 0, canvas.width, canvas.height);
        
//         const link = document.createElement('a');
//         link.download = `gesture-snapshot-${new Date().toISOString().slice(0, 10)}.png`;
//         link.href = canvas.toDataURL('image/png');
//         link.click();
//     }
// }

// function setFrameRate(newFrameRate) {
//     frameRate = Math.max(16, Math.min(1000, newFrameRate)); // Clamp between 16ms (~60fps) and 1000ms (1fps)
//     if (isGestureActive) {
//         startVideoStream(); // Restart with new frame rate
//     }
// }

// // ==================== UTILITY FUNCTIONS ====================
// function toggleMenu() {
//     if (elements.sidebar && elements.menu) {
//         elements.sidebar.classList.toggle("visible");
//         elements.menu.classList.toggle("active");
//     }
// }

// function showError(message) {
//     console.error(message);
//     alert(message);
// }

// // ==================== EVENT LISTENERS ====================
// function setupEventListeners() {
//     // Common listeners
//     if (elements.menuToggle) {
//         elements.menuToggle.addEventListener("click", toggleMenu);
//     }
    
//     if (elements.logoutButton) {
//         elements.logoutButton.addEventListener("click", () => eel.Logout());
//     }
    
//     // Chat page listeners
//     if (elements.userInputButton) {
//         elements.userInputButton.addEventListener("click", getUserInput);
//     }
    
//     if (elements.userInput) {
//         elements.userInput.addEventListener("keyup", (event) => {
//             if (event.key === "Enter") {
//                 event.preventDefault();
//                 getUserInput();
//             }
//         });
//     }
    
//     if (elements.chatHistoryBtn) {
//         elements.chatHistoryBtn.addEventListener("click", () => {
//             const isVisible = elements.unifiedChatHistory.style.display === "block";
//             elements.unifiedChatHistory.style.display = isVisible ? "none" : "block";
//             if (!isVisible) refreshChatHistory();
//         });
//     }
    
//     if (elements.closeHistory) {
//         elements.closeHistory.addEventListener("click", () => {
//             elements.unifiedChatHistory.style.display = "none";
//         });
//     }
    
//     if (elements.refreshHistory) {
//         elements.refreshHistory.addEventListener("click", refreshChatHistory);
//     }
    
//     // Gesture page listeners
//     if (elements.startGestureBtn) {
//         elements.startGestureBtn.addEventListener("click", () => {
//             if (isGestureActive) {
//                 stopGestureControl();
//             } else {
//                 startGestureControl();
//             }
//         });
//     }
    
//     if (elements.stopGestureBtn) {
//         elements.stopGestureBtn.addEventListener("click", stopGestureControl);
//     }
    
//     // Frame rate control
//     const frameRateControl = document.getElementById("frameRate");
//     if (frameRateControl) {
//         frameRateControl.addEventListener("input", (e) => {
//             const fps = parseInt(e.target.value);
//             const fpsValue = document.getElementById("frameRateValue");
//             if (fpsValue) fpsValue.textContent = `${fps} FPS`;
//             setFrameRate(1000 / fps);
//         });
//     }
// }

// // ==================== INITIALIZATION ====================
// async function initialize() {
//     console.log("Initializing application...");
//     setupEventListeners();
    
//     // Initialize based on current page
//     if (elements.messages) {
//         // Chat page initialization
//         try {
//             const history = await eel.get_chat_history()();
//             if (history && Array.isArray(history.data)) {
//                 history.data.forEach(msg => {
//                     if (msg.sender === "User") {
//                         addUserMsg(msg.message);
//                     } else {
//                         addAppMsg(msg.message);
//                     }
//                 });
//             }
//         } catch (error) {
//             console.error("Error initializing chat history:", error);
//         }
//     }
    
//     if (elements.videoFeed) {
//         // Gesture page initialization
//         updateStatsDisplay();
//     }
// }

// // Start the application
// document.addEventListener("DOMContentLoaded", initialize);
// console.log("main.js fully loaded");
// DOM Elements
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
console.log("main.js fully loaded");