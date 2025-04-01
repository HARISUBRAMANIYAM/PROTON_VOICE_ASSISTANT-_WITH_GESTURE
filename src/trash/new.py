import eel
import json
import os
from datetime import datetime

# Initialize Eel
eel.init('web')  # Assuming your HTML files are in the 'web' folder

# Mock user database (replace with a real database in production)
users = {
    "user@example.com": {"password": "password123", "fullname": "John Doe"},
}

# Chat history directory
CHAT_HISTORY_DIR = "chat_history"
if not os.path.exists(CHAT_HISTORY_DIR):
    os.makedirs(CHAT_HISTORY_DIR)

# Function to get chat history filename
def get_chat_filename():
    return os.path.join(CHAT_HISTORY_DIR, datetime.now().strftime("%Y-%m-%d_%I-%M-%p") + ".json")

# Expose Python functions to JavaScript
@eel.expose
def authenticate_user(email, password):
    """Authenticate user"""
    if email in users and users[email]["password"] == password:
        return {"status": "success", "message": "Login successful!"}
    else:
        return {"status": "error", "message": "Invalid email or password."}

@eel.expose
def register_user(email, password, fullname=None):
    """Register a new user"""
    if email in users:
        return {"status": "error", "message": "Email already registered."}
    users[email] = {"password": password, "fullname": fullname}
    return {"status": "success", "message": "Registration successful!"}

@eel.expose
def save_chat_message(sender, message):
    """Save chat message to a file"""
    chat_data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "sender": sender,
        "message": message,
    }
    chat_file = get_chat_filename()
    try:
        with open(chat_file, "a") as f:
            f.write(json.dumps(chat_data) + "\n")
        return {"status": "success", "message": "Message saved."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@eel.expose
def get_chat_history():
    """Retrieve chat history"""
    try:
        chat_files = sorted(os.listdir(CHAT_HISTORY_DIR), reverse=True)
        if not chat_files:
            return {"status": "success", "data": []}
        latest_file = os.path.join(CHAT_HISTORY_DIR, chat_files[0])
        with open(latest_file, "r") as f:
            chat_data = [json.loads(line) for line in f.readlines()]
        return {"status": "success", "data": chat_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@eel.expose
def logout():
    """Logout the user"""
    return {"status": "success", "message": "Logged out successfully."}

# Start the Eel application
if __name__ == "__main__":
    eel.start('index.html',port=27005, size=(800, 600))  # Start the app with the main HTML file