// User clicked button
//document.getElementById("userInputButton").addEventListener("click", getUserInput, false);
// User pressed enter '13'
/*document.getElementById("userInput").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        getUserInput();
    }
});
 Menu toggle
document.addEventListener("DOMContentLoaded", function() {
    const chatHistoryFilenames = document.getElementById("chatHistoryFilenames");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const menu = document.querySelector(".menu");
    const chatHistoryBtn = document.getElementById("chatHistoryBtn");
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    const closeCH = document.getElementById("closeCH");
    const closModel = document.querySelector(".close");
    const chatHistoryList = document.getElementById("chat-history-list");
    const chatContent = document.getElementById("chat-content");
    if (menuToggle && sidebar && menu) {
        menuToggle.addEventListener("click", function() {
            console.log("Menu Clicked");
            sidebar.classList.toggle("visible");
            menu.classList.toggle("active");
        });
    }
    if (chatHistoryBtn && chatHistoryContainer) {
        chatHistoryBtn.addEventListener("click", function () {
            chatHistoryContainer.classList.toggle("visible");
            const buttonRect = chatHistoryBtn.getBoundingClientRect();
            chatHistoryContainer.style.top = buttonRect.top + "px";
            chatHistoryContainer.style.left = (buttonRect.right + 10) + "px";
            chatHistoryContainer.style.display = chatHistoryContainer.style.display === "none" ? "block" : "none";
        });
    } 
    if (closeCH && chatHistoryContainer){
        closeCH.addEventListener("click",function(){
            chatHistoryContainer.style.display = "none";
        });
    }
    if (closModel){
        closModel.addEventListener("click",function(){
            document.querySelector(".modal").style.display="none";
        });
    }
    if (chatHistoryFilenames){
        eel.get_chat_history_files() (function(files){
            files.forEach(file => addChatFilename(file));
        });
    }
    if(chatHistoryList){
        eel.get_chat_history_files()(function (files){
            files.forEach(file => addChatFilename(file));
        });
    }
    if(chatHistoryList){
        chatHistoryList.addEventListener("click",function(event){
            if(event.target.classList.contains("chat-session-item")){
                console.log("Chat History item Clicked",event.target.innerText);
                document.getElementById("chatHistoryContent").innerText = event.target.innerText;
                document.querySelector(".modal").style.display = "block";
            }
        });
    }
    async function fetchChatFiles() {
                    try {
                        let response = await fetch("chat_history/files.json"); // JSON file storing file names
                        let files = await response.json();
            
                        files.forEach(file => {
                            let listItem = document.createElement("li");
                            listItem.textContent = file;
                            listItem.addEventListener("click", () => loadChatContent(file));
                            chatHistoryList.appendChild(listItem);
                        });
                    } catch (error) {
                        console.error("Error fetching chat files:", error);
                    }
                }
            
                // Load chat content when clicking a file
                async function loadChatContent(fileName) {
                    try {
                        let response = await fetch(`src/chat_history/${fileName}`);
                        let data = await response.json();
                        chatContent.textContent = JSON.stringify(data, null, 2);
                    } catch (error) {
                        console.error("Error loading chat content:", error);
                        chatContent.textContent = "Error loading chat content!";
                    }
                }fetchChatFiles();});
// Chat History Modal Handling
document.getElementById("chatHistoryList").addEventListener("click", function(event) {
    if (event.target.classList.contains("chat-session-item")) {
        console.log("Chat History item Clicked",event.target.innerText);
        document.getElementById("chatHistoryContent").innerText = event.target.innerText;
        document.querySelector(".modal").style.display = "block";
    }
});
const closModel = document.querySelector(".close");
if(closModel){
    closModel.addEventListener("click", function() {
        console.log("Close Model Clicked");
        document.querySelector(".modal").style.display = "none";
    });
}
// Exposing functions to Eel
eel.expose(addUserMsg);
eel.expose(addAppMsg);

function addUserMsg(msg) {
    let element = document.getElementById("messages");
    if (!element){
        console.error("Msg container  not found");
        return;
    }
    console.log("User Msg added :",msg);
    element.innerHTML += `<div class="message from ready rtol"> ${msg}</div>`;
    element.scrollTop = element.scrollHeight - element.clientHeight - 15;
    let index = element.childElementCount - 1;
    setTimeout(changeClass.bind(null, element, index, "message from"), 500);
}

function addAppMsg(msg) {
    let element = document.getElementById("messages");
    if (!element){
        console.error("Msg container  not found");
        return;
    }
    console.log("App Msg added :",msg);
    element.innerHTML += `<div class="message to ready ltor"> ${msg}</div>`;
    element.scrollTop = element.scrollHeight- element.clientHeight - 15;
    let index = element.childElementCount - 1;
    setTimeout(changeClass.bind(null, element, index, "message to"), 500);
}

function changeClass(element, index, newClass) {
    console.log(newClass + ' ' + index);
    element.children[index].className = newClass;
}

async function getUserInput() {
    let element = document.getElementById("userInput");
    let msg = element.value.trim();

    if (msg.length !== 0) {
        console.log("User input:", msg);
        element.value = "";

        addUserMsg(msg);  // Store in UI & local storage

        try {
            let response = await eel.getUserInput(msg)();  // Send to backend
            addAppMsg(response);  // Store assistant response

            // Mark sync time
            localStorage.setItem("lastSynced", Date.now().toString());
        } catch (error) {
            console.error("Eel Communication Error:", error);
        }
    }
}
// Voice Recognition
const listeningButton = document.querySelector(".listening");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

listeningButton.addEventListener("click", function() {
    recognition.start();
});

recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    getUserInput();
};

recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
};

// Logout function
const logoutButton = document.getElementById("logout");
if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        eel.exit();
    });
}
function loadChatHistory(){
    eel.get_chat_history_files()(function (files){
        let container = document.getElementById("chatHistory");
        if(!container){
            console.error("Chat history conatiner not fonud");
            return;
        }
        container.innerHTML ="";
        files.forEach(file => {
            let historyItem = document.createElement("div");
            historyItem.className = "history-item";
            historyItem.textContent = file ;
            historyItem.onclick = function(){
                loadChatContent(file);
            };
            container.appendChild(historyItem);
        });
    });
}
async function loadChatContent(fileName) {
    let chatContent = document.getElementById("chat-content");
    chatContent.innerHTML = "Loading chat...";

    let localData = JSON.parse(localStorage.getItem(`conversation:${fileName}`));
    let localTimestamp = localStorage.getItem(`lastSynced:${fileName}`) || 0;

    try {
        let serverData = await eel.getChatHistory(fileName)();  // Fetch from backend
        let serverTimestamp = serverData.timestamp || 0;

        // If the server has newer data, update local storage
        if (serverTimestamp > localTimestamp) {
            localStorage.setItem(`conversation:${fileName}`, JSON.stringify(serverData));
            localStorage.setItem(`lastSynced:${fileName}`, serverTimestamp);
            chatContent.textContent = JSON.stringify(serverData, null, 2);
        } else {
            chatContent.textContent = JSON.stringify(localData, null, 2); // Load local data
        }
    } catch (error) {
        console.error("Error fetching chat:", error);
        chatContent.textContent = "Error loading chat!";
    }
}

function addChatHistory(filename) {
    const chatHistoryList = document.getElementById("chatHistoryList");
    const listItem = document.createElement("li");
    listItem.classList.add("chat-item");
    listItem.textContent = filename;
    chatHistoryList.appendChild(listItem);
}
async function syncChatHistory() {
    try {
        let serverFiles = await eel.getAllChatFiles()();  // Fetch all chat files
        let localFiles = JSON.parse(localStorage.getItem("chat_files")) || [];

        // Compare and update missing files
        serverFiles.forEach((file) => {
            if (!localFiles.includes(file)) {
                localFiles.push(file);
                loadChatContent(file);  // Fetch and store missing chat data
            }
        });

        localStorage.setItem("chat_files", JSON.stringify(localFiles));
    } catch (error) {
        console.error("Error syncing chat history:", error);
    }
}
// Run this on page load
window.onload = syncChatHistory;
/*******************************************************************/
/*function refreshChatHistory() {
    const chatHistoryList = document.getElementById("chatHistoryList");
    
    if (!chatHistoryList) {
        console.error("Chat history list element not found in DOM");
        return;
    }
    
    // Clear existing items
    chatHistoryList.innerHTML = "";
    
    // Add a loading indicator
    const loadingItem = document.createElement("li");
    loadingItem.textContent = "Loading chat history...";
    chatHistoryList.appendChild(loadingItem);
    
    // Get the files from the backend
    eel.get_chat_history_files()(function(files) {
        console.log("Retrieved chat history files:", files);
        
        // Clear the loading indicator
        chatHistoryList.innerHTML = "";
        
        if (files && files.length > 0) {
            files.forEach(file => {
                let listItem = document.createElement("li");
                listItem.classList.add("chat-session-item");
                listItem.textContent = file;
                chatHistoryList.appendChild(listItem);
            });
        } else {
            // No files found
            let listItem = document.createElement("li");
            listItem.textContent = "No chat history found";
            chatHistoryList.appendChild(listItem);
        }
    });
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", refreshChatHistory);
if (document.getElementById("refreshHistory")) {
    document.getElementById("refreshHistory").addEventListener("click", refreshChatHistory);
}*/// User clicked button
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
    chatHistoryFiles: document.getElementById("chatHistoryFiles"),  // Added for the refreshed implementation
    modal: document.querySelector(".modal"),
    closeModal: document.querySelector(".close"),
    listeningButton: document.querySelector(".listening"),
    logoutButton: document.getElementById("logout"),
    refreshHistory: document.getElementById("refreshHistory")
};

// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

// Message Functions
function addUserMsg(msg) {
    if (!elements.messages) {
        console.error("Message container not found");
        return;
    }
    console.log("User Msg added:", msg);
    elements.messages.innerHTML += `<div class="message from ready rtol"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight - elements.messages.clientHeight - 15;
    let index = elements.messages.childElementCount - 1;
    setTimeout(changeClass.bind(null, elements.messages, index, "message from"), 500);
}

function addAppMsg(msg) {
    if (!elements.messages) {
        console.error("Message container not found");
        return;
    }
    console.log("App Msg added:", msg);
    elements.messages.innerHTML += `<div class="message to ready ltor"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight - elements.messages.clientHeight - 15;
    let index = elements.messages.childElementCount - 1;
    setTimeout(changeClass.bind(null, elements.messages, index, "message to"), 500);
}

function changeClass(element, index, newClass) {
    console.log(newClass + ' ' + index);
    element.children[index].className = newClass;
}

async function getUserInput() {
    let msg = elements.userInput.value.trim();

    if (msg.length !== 0) {
        console.log("User input:", msg);
        elements.userInput.value = "";

        addUserMsg(msg);  // Store in UI & local storage

        try {
            let response = await eel.getUserInput(msg)();  // Send to backend
            addAppMsg(response);  // Store assistant response

            // Mark sync time
            localStorage.setItem("lastSynced", Date.now().toString());
        } catch (error) {
            console.error("Eel Communication Error:", error);
        }
    }
}

// Chat History Functions
function addChatFilename(file) {
    const listItem = document.createElement("li");
    listItem.classList.add("chat-session-item");
    listItem.textContent = file;
    
    if (elements.chatHistoryList) {
        elements.chatHistoryList.appendChild(listItem);
    }
    if (elements.chatHistoryFilenames) {
        elements.chatHistoryFilenames.appendChild(listItem.cloneNode(true));
    }
}

async function loadChatContent(fileName) {
    if (!elements.chatContent) return;
    
    elements.chatContent.innerHTML = "Loading chat...";

    let localData = JSON.parse(localStorage.getItem(`conversation:${fileName}`));
    let localTimestamp = localStorage.getItem(`lastSynced:${fileName}`) || 0;

    try {
        let serverData = await eel.getChatHistory(fileName)();  // Fetch from backend
        let serverTimestamp = serverData.timestamp || 0;

        // If the server has newer data, update local storage
        if (serverTimestamp > localTimestamp) {
            localStorage.setItem(`conversation:${fileName}`, JSON.stringify(serverData));
            localStorage.setItem(`lastSynced:${fileName}`, serverTimestamp);
            elements.chatContent.textContent = JSON.stringify(serverData, null, 2);
        } else {
            elements.chatContent.textContent = JSON.stringify(localData, null, 2); // Load local data
        }
    } catch (error) {
        console.error("Error fetching chat:", error);
        elements.chatContent.textContent = "Error loading chat!";
    }
}

async function syncChatHistory() {
    try {
        let serverFiles = await eel.getAllChatFiles()();  // Fetch all chat files
        let localFiles = JSON.parse(localStorage.getItem("chat_files")) || [];

        // Compare and update missing files
        serverFiles.forEach((file) => {
            if (!localFiles.includes(file)) {
                localFiles.push(file);
                loadChatContent(file);  // Fetch and store missing chat data
            }
        });

        localStorage.setItem("chat_files", JSON.stringify(localFiles));
        
        // Update UI with file list
        refreshChatHistoryUI(serverFiles);
    } catch (error) {
        console.error("Error syncing chat history:", error);
    }
}

// Function to update the chat history UI
function refreshChatHistoryUI(files) {
    // Clear existing lists
    if (elements.chatHistoryList) elements.chatHistoryList.innerHTML = "";
    if (elements.chatHistoryFilenames) elements.chatHistoryFilenames.innerHTML = "";
    if (elements.chatHistoryFiles) elements.chatHistoryFiles.innerHTML = "";
    
    if (files && files.length > 0) {
        files.forEach(file => {
            // Add to all relevant containers
            const listItem = document.createElement("li");
            listItem.classList.add("chat-session-item");
            listItem.textContent = file;
            
            if (elements.chatHistoryList) {
                elements.chatHistoryList.appendChild(listItem.cloneNode(true));
            }
            
            if (elements.chatHistoryFilenames) {
                elements.chatHistoryFilenames.appendChild(listItem.cloneNode(true));
            }
            
            if (elements.chatHistoryFiles) {
                elements.chatHistoryFiles.appendChild(listItem.cloneNode(true));
            }
        });
    } else {
        // No files found - add message to all containers
        const noFilesMessage = document.createElement("li");
        noFilesMessage.textContent = "No chat history found";
        
        if (elements.chatHistoryList) {
            elements.chatHistoryList.appendChild(noFilesMessage.cloneNode(true));
        }
        
        if (elements.chatHistoryFilenames) {
            elements.chatHistoryFilenames.appendChild(noFilesMessage.cloneNode(true));
        }
        
        if (elements.chatHistoryFiles) {
            elements.chatHistoryFiles.appendChild(noFilesMessage.cloneNode(true));
        }
    }
}

// Refreshes chat history from backend
function refreshChatHistory() {
    console.log("Refreshing chat history...");
    
    // Add loading indicators to all containers
    const loadingMessage = "Loading chat history...";
    
    if (elements.chatHistoryList) {
        elements.chatHistoryList.innerHTML = `<li>${loadingMessage}</li>`;
    }
    
    if (elements.chatHistoryFilenames) {
        elements.chatHistoryFilenames.innerHTML = `<li>${loadingMessage}</li>`;
    }
    
    if (elements.chatHistoryFiles) {
        elements.chatHistoryFiles.innerHTML = `<li>${loadingMessage}</li>`;
    }

    // Fetch chat files from the backend
    eel.getAllChatFiles()(function(files) {
        console.log("Retrieved chat history files:", files);
        refreshChatHistoryUI(files);
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // User input handling
    if (elements.userInputButton) {
        elements.userInputButton.addEventListener("click", getUserInput, false);
    }
    
    if (elements.userInput) {
        elements.userInput.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                getUserInput();
            }
        });
    }

    // Menu toggle
    if (elements.menuToggle && elements.sidebar && elements.menu) {
        elements.menuToggle.addEventListener("click", function() {
            console.log("Menu Clicked");
            elements.sidebar.classList.toggle("visible");
            elements.menu.classList.toggle("active");
        });
    }

    // Chat history button
    if (elements.chatHistoryBtn && elements.chatHistoryContainer) {
        elements.chatHistoryBtn.addEventListener("click", function() {
            elements.chatHistoryContainer.classList.toggle("visible");
            const buttonRect = elements.chatHistoryBtn.getBoundingClientRect();
            elements.chatHistoryContainer.style.top = buttonRect.top + "px";
            elements.chatHistoryContainer.style.left = (buttonRect.right + 10) + "px";
            elements.chatHistoryContainer.style.display =
            elements.chatHistoryContainer.style.display === "none" ? "block" : "none";
        });
    }

    // Close chat history
    if (elements.closeCH && elements.chatHistoryContainer) {
        elements.closeCH.addEventListener("click", function() {
            elements.chatHistoryContainer.style.display = "none";
        });
    }

    // Close modal
    if (elements.closeModal && elements.modal) {
        elements.closeModal.addEventListener("click", function() {
            elements.modal.style.display = "none";
        });
    }

    // Chat history list click handlers for both lists
    const setupChatHistoryClickHandler = (element) => {
        if (element) {
            element.addEventListener("click", function(event) {
                if (event.target.classList.contains("chat-session-item")) {
                    console.log("Chat History item Clicked", event.target.innerText);
                    
                    if (document.getElementById("chatHistoryContent")) {
                        document.getElementById("chatHistoryContent").innerText = event.target.innerText;
                    }
                    
                    if (elements.modal) {
                        elements.modal.style.display = "block";
                    }
                    
                    loadChatContent(event.target.innerText);
                }
            });
        }
    };
    
    setupChatHistoryClickHandler(elements.chatHistoryList);
    setupChatHistoryClickHandler(elements.chatHistoryFilenames);
    setupChatHistoryClickHandler(elements.chatHistoryFiles);

    // Speech recognition
    if (elements.listeningButton) {
        elements.listeningButton.addEventListener("click", function() {
            recognition.start();
        });
    }

    // Logout button
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", function() {
            eel.exit();
        });
    }
    
    // Refresh history button
    if (elements.refreshHistory) {
        elements.refreshHistory.addEventListener("click", refreshChatHistory);
    }
}

// Speech Recognition Handlers
recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    if (elements.userInput) {
        elements.userInput.value = transcript;
        getUserInput();
    }
};

recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
};

// Eel Exposed Functions
eel.expose(addUserMsg);
eel.expose(addAppMsg);

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - setting up event listeners");
    setupEventListeners();
    
    // Initial load of chat history files
    refreshChatHistory();
    
    // Also sync chat history
    syncChatHistory();
});

// Run refresh on page load as well
window.onload = function() {
    console.log("Window loaded - refreshing chat history");
    refreshChatHistory();
};*/
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
    listeningButton: document.querySelector(".listening"),
    logoutButton: document.getElementById("logout"),
    refreshHistory: document.getElementById("refreshHistory"),
    // New elements for history display
    historyDisplayContainer: document.getElementById("history-display-container"),
    historyFileName: document.getElementById("history-file-name"),
    historyMessages: document.getElementById("history-messages"),
    closeHistoryBtn: document.getElementById("close-history-btn")
};

// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

// Message Functions
function addUserMsg(msg) {
    if (!elements.messages) {
        console.error("Message container not found");
        return;
    }
    console.log("User Msg added:", msg);
    elements.messages.innerHTML += `<div class="message from ready rtol"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight - elements.messages.clientHeight - 15;
    let index = elements.messages.childElementCount - 1;
    setTimeout(changeClass.bind(null, elements.messages, index, "message from"), 500);
}

function addAppMsg(msg) {
    if (!elements.messages) {
        console.error("Message container not found");
        return;
    }
    console.log("App Msg added:", msg);
    elements.messages.innerHTML += `<div class="message to ready ltor"> ${msg}</div>`;
    elements.messages.scrollTop = elements.messages.scrollHeight - elements.messages.clientHeight - 15;
    let index = elements.messages.childElementCount - 1;
    setTimeout(changeClass.bind(null, elements.messages, index, "message to"), 500);
}

function changeClass(element, index, newClass) {
    console.log(newClass + ' ' + index);
    element.children[index].className = newClass;
}

async function getUserInput() {
    let msg = elements.userInput.value.trim();

    if (msg.length !== 0) {
        console.log("User input:", msg);
        elements.userInput.value = "";

        addUserMsg(msg);  // Store in UI & local storage

        try {
            let response = await eel.getUserInput(msg)();  // Send to backend
            addAppMsg(response);  // Store assistant response

            // Mark sync time
            localStorage.setItem("lastSynced", Date.now().toString());
        } catch (error) {
            console.error("Eel Communication Error:", error);
        }
    }
}

// Chat History Functions
function addChatFilename(file) {
    const listItem = document.createElement("li");
    listItem.classList.add("chat-session-item");
    listItem.textContent = file;
    
    if (elements.chatHistoryList) {
        elements.chatHistoryList.appendChild(listItem);
    }
    if (elements.chatHistoryFilenames) {
        elements.chatHistoryFilenames.appendChild(listItem.cloneNode(true));
    }
}

// New function to load a chat file into the history display container
async function loadChatFile(fileName) {
    console.log("Loading chat file:", fileName);
    
    if (!elements.historyDisplayContainer || !elements.historyFileName || !elements.historyMessages) {
        console.error("History display container elements not found");
        return;
    }
    
    // Update the file name in the header
    elements.historyFileName.textContent = fileName;
    
    // Show loading indicator
    elements.historyMessages.innerHTML = '<div class="loading-message">Loading chat...</div>';
    
    try {
        // Use the existing backend function to get chat data
        let chatData = await eel.getChatHistory(fileName)();
        
        // Display chat in the history container
        displayChatInHistoryContainer(chatData);
        
        // Show the history container
        elements.historyDisplayContainer.classList.add('active');
    } catch (error) {
        console.error("Error loading chat file:", error);
        elements.historyMessages.innerHTML = '<div class="error-message">Error loading chat!</div>';
    }
}

// New function to display chat data in the history container
function displayChatInHistoryContainer(chatData) {
    if (!elements.historyMessages) {
        console.error("History messages container not found");
        return;
    }
    
    // Clear existing content
    elements.historyMessages.innerHTML = '';
    
    if (!chatData || !chatData.messages || !Array.isArray(chatData.messages)) {
        elements.historyMessages.innerHTML = '<div class="error-message">Invalid chat data format</div>';
        return;
    }
    
    // Add chat messages to the container
    chatData.messages.forEach(message => {
        const messageElement = document.createElement('div');
        
        // Determine message type (user or bot)
        const isUserMessage = message.sender === 'user' || message.role === 'user';
        messageElement.className = isUserMessage ? 'message from' : 'message to';
        
        // Get message content
        const content = message.content || message.text || '';
        
        // Create message content element
        messageElement.innerHTML = content;
        
        // Add timestamp if available
        if (message.timestamp) {
            const timestampElement = document.createElement('div');
            timestampElement.className = 'message-timestamp';
            timestampElement.textContent = new Date(message.timestamp).toLocaleTimeString();
            messageElement.appendChild(timestampElement);
        }
        
        // Add to container
        elements.historyMessages.appendChild(messageElement);
    });
    
    // Scroll to the bottom of the container
    elements.historyMessages.scrollTop = elements.historyMessages.scrollHeight;
}

async function loadChatContent(fileName) {
    if (!elements.chatContent) return;
    
    elements.chatContent.innerHTML = "Loading chat...";

    let localData = JSON.parse(localStorage.getItem(`conversation:${fileName}`));
    let localTimestamp = localStorage.getItem(`lastSynced:${fileName}`) || 0;

    try {
        let serverData = await eel.getChatHistory(fileName)();  // Fetch from backend
        let serverTimestamp = serverData.timestamp || 0;

        // If the server has newer data, update local storage
        if (serverTimestamp > localTimestamp) {
            localStorage.setItem(`conversation:${fileName}`, JSON.stringify(serverData));
            localStorage.setItem(`lastSynced:${fileName}`, serverTimestamp);
            elements.chatContent.textContent = JSON.stringify(serverData, null, 2);
        } else {
            elements.chatContent.textContent = JSON.stringify(localData, null, 2); // Load local data
        }
        
        // Also load into the new history display container if it exists
        if (elements.historyDisplayContainer) {
            loadChatFile(fileName);
        }
        
    } catch (error) {
        console.error("Error fetching chat:", error);
        elements.chatContent.textContent = "Error loading chat!";
    }
}

async function syncChatHistory() {
    try {
        let serverFiles = await eel.getAllChatFiles()();  // Fetch all chat files
        let localFiles = JSON.parse(localStorage.getItem("chat_files")) || [];

        // Compare and update missing files
        serverFiles.forEach((file) => {
            if (!localFiles.includes(file)) {
                localFiles.push(file);
                loadChatContent(file);  // Fetch and store missing chat data
            }
        });

        localStorage.setItem("chat_files", JSON.stringify(localFiles));
        
        // Update UI with file list
        refreshChatHistoryUI(serverFiles);
    } catch (error) {
        console.error("Error syncing chat history:", error);
    }
}

// Function to update the chat history UI
function refreshChatHistoryUI(files) {
    // Clear existing lists
    if (elements.chatHistoryList) elements.chatHistoryList.innerHTML = "";
    if (elements.chatHistoryFilenames) elements.chatHistoryFilenames.innerHTML = "";
    if (elements.chatHistoryFiles) elements.chatHistoryFiles.innerHTML = "";
    
    if (files && files.length > 0) {
        files.forEach(file => {
            // Add to all relevant containers
            const listItem = document.createElement("li");
            listItem.classList.add("chat-session-item");
            listItem.textContent = file;
            listItem.addEventListener("click", function() {
                loadChatFile(file);
            });
            
            if (elements.chatHistoryList) {
                elements.chatHistoryList.appendChild(listItem.cloneNode(true));
            }
            
            if (elements.chatHistoryFilenames) {
                const fileItem = listItem.cloneNode(true);
                fileItem.addEventListener("click", function() {
                    loadChatFile(file);
                });
                elements.chatHistoryFilenames.appendChild(fileItem);
            }
            
            if (elements.chatHistoryFiles) {
                const fileItem = listItem.cloneNode(true);
                fileItem.addEventListener("click", function() {
                    loadChatFile(file);
                });
                elements.chatHistoryFiles.appendChild(fileItem);
            }
        });
    } else {
        // No files found - add message to all containers
        const noFilesMessage = document.createElement("li");
        noFilesMessage.textContent = "No chat history found";
        
        if (elements.chatHistoryList) {
            elements.chatHistoryList.appendChild(noFilesMessage.cloneNode(true));
        }
        
        if (elements.chatHistoryFilenames) {
            elements.chatHistoryFilenames.appendChild(noFilesMessage.cloneNode(true));
        }
        
        if (elements.chatHistoryFiles) {
            elements.chatHistoryFiles.appendChild(noFilesMessage.cloneNode(true));
        }
    }
}

// Refreshes chat history from backend
function refreshChatHistory() {
    console.log("Refreshing chat history...");
    
    // Add loading indicators to all containers
    const loadingMessage = "Loading chat history...";
    
    if (elements.chatHistoryList) {
        elements.chatHistoryList.innerHTML = `<li>${loadingMessage}</li>`;
    }
    
    if (elements.chatHistoryFilenames) {
        elements.chatHistoryFilenames.innerHTML = `<li>${loadingMessage}</li>`;
    }
    
    if (elements.chatHistoryFiles) {
        elements.chatHistoryFiles.innerHTML = `<li>${loadingMessage}</li>`;
    }

    // Fetch chat files from the backend
    eel.getAllChatFiles()(function(files) {
        console.log("Retrieved chat history files:", files);
        refreshChatHistoryUI(files);
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // User input handling
    if (elements.userInputButton) {
        elements.userInputButton.addEventListener("click", getUserInput, false);
    }
    
    if (elements.userInput) {
        elements.userInput.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                getUserInput();
            }
        });
    }

    // Menu toggle
    if (elements.menuToggle && elements.sidebar && elements.menu) {
        elements.menuToggle.addEventListener("click", function() {
            console.log("Menu Clicked");
            elements.sidebar.classList.toggle("visible");
            elements.menu.classList.toggle("active");
        });
    }

    // Chat history button
    if (elements.chatHistoryBtn && elements.chatHistoryContainer) {
        elements.chatHistoryBtn.addEventListener("click", function() {
            elements.chatHistoryContainer.classList.toggle("visible");
            const buttonRect = elements.chatHistoryBtn.getBoundingClientRect();
            elements.chatHistoryContainer.style.top = buttonRect.top + "px";
            elements.chatHistoryContainer.style.left = (buttonRect.right + 10) + "px";
            elements.chatHistoryContainer.style.display =
            elements.chatHistoryContainer.style.display === "none" ? "block" : "none";
        });
    }

    // Close chat history
    if (elements.closeCH && elements.chatHistoryContainer) {
        elements.closeCH.addEventListener("click", function() {
            elements.chatHistoryContainer.style.display = "none";
        });
    }

    // Close modal
    if (elements.closeModal && elements.modal) {
        elements.closeModal.addEventListener("click", function() {
            elements.modal.style.display = "none";
        });
    }

    // Close history display button
    if (elements.closeHistoryBtn && elements.historyDisplayContainer) {
        elements.closeHistoryBtn.addEventListener("click", function() {
            elements.historyDisplayContainer.classList.remove('active');
        });
    }

    // Chat history list click handlers for all lists
    const setupChatHistoryClickHandler = (element) => {
        if (element) {
            element.addEventListener("click", function(event) {
                if (event.target.classList.contains("chat-session-item")) {
                    const fileName = event.target.innerText;
                    console.log("Chat History item Clicked", fileName);
                    
                    if (document.getElementById("chatHistoryContent")) {
                        document.getElementById("chatHistoryContent").innerText = fileName;
                    }
                    
                    // Load in both the modal and the new history display
                    if (elements.modal) {
                        elements.modal.style.display = "block";
                    }
                    
                    loadChatContent(fileName);
                    loadChatFile(fileName);
                }
            });
        }
    };
    
    setupChatHistoryClickHandler(elements.chatHistoryList);
    setupChatHistoryClickHandler(elements.chatHistoryFilenames);
    setupChatHistoryClickHandler(elements.chatHistoryFiles);

    // Speech recognition
    if (elements.listeningButton) {
        elements.listeningButton.addEventListener("click", function() {
            recognition.start();
        });
    }

    // Logout button
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", function() {
            eel.exit();
        });
    }
    
    // Refresh history button
    if (elements.refreshHistory) {
        elements.refreshHistory.addEventListener("click", refreshChatHistory);
    }
}

// Speech Recognition Handlers
recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    if (elements.userInput) {
        elements.userInput.value = transcript;
        getUserInput();
    }
};

recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
};

// Eel Exposed Functions
eel.expose(addUserMsg);
eel.expose(addAppMsg);

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - setting up event listeners");
    setupEventListeners();
    
    // Initial load of chat history files
    refreshChatHistory();
    
    // Also sync chat history
    syncChatHistory();
});

// Run refresh on page load as well
window.onload = function() {
    console.log("Window loaded - refreshing chat history");
    refreshChatHistory();
};*/