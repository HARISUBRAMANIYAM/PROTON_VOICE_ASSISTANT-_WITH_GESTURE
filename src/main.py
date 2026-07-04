import eel
import os
import json
import subprocess
import logging
import sys
from hashlib import sha256
from datetime import datetime  # Moved up here for cleaner structure

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# 1. DYNAMIC PATH CALCULATION (Fixes hardcoded C:\\ absolute paths)
# This finds the absolute directory where THIS script is currently located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Add BASE_DIR to the Python path so spawned scripts can find modules like 'Proton'
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# Construct relative paths dynamically based on your project structure
USER_FILE = os.path.join(BASE_DIR, "validation", "Login.json")
WEB_DIR = os.path.join(BASE_DIR, "web")
APP_PATH = os.path.join(BASE_DIR, "app.py")

# Initialize Eel with the web directory
eel.init(WEB_DIR, allowed_extensions=['.js', '.html', '.css'])

def hash_password(password):
    """Hash password using SHA-256 (in production, use bcrypt)"""
    return sha256(password.encode('utf-8')).hexdigest()

def load_users():
    """Load user data from JSON file"""
    if not os.path.exists(USER_FILE):
        logging.warning(f"User file {USER_FILE} does not exist. Creating a new one.")
        os.makedirs(os.path.dirname(USER_FILE), exist_ok=True)
        with open(USER_FILE, "w") as f:
            json.dump({}, f)
        return {}
    
    try:
        with open(USER_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logging.error(f"Error loading user file: {e}")
        return {}

def save_users(users):
    """Save user data to JSON file"""
    try:
        os.makedirs(os.path.dirname(USER_FILE), exist_ok=True)
        with open(USER_FILE, "w") as f:
            json.dump(users, f, indent=4)
        return True
    except Exception as e:
        logging.error(f"Failed to save users: {e}")
        return False

@eel.expose
def register_user(email, password, fullname=None):
    """Register a new user"""
    try:
        users = load_users()
        
        # Validation
        if not email or not password:
            return {"status": "error", "message": "Email and password are required"}
            
        if "@" not in email or "." not in email.split("@")[1]:
            return {"status": "error", "message": "Please enter a valid email address"}
            
        if len(password) < 8:
            return {"status": "error", "message": "Password must be at least 8 characters"}
            
        if email in users:
            return {"status": "error", "message": "Email already registered"}
        
        # Store user data
        users[email] = {
            "password": hash_password(password),
            "fullname": fullname or "",
            "created_at": str(datetime.now())
        }
        
        if save_users(users):
            logging.info(f"New user registered: {email}")
            return {"status": "success", "message": "Registration successful"}
        else:
            return {"status": "error", "message": "Failed to save user data"}
            
    except Exception as e:
        logging.error(f"Registration error: {e}")
        return {"status": "error", "message": "An error occurred during registration"}

@eel.expose
def authenticate_user(email, password):
    """Authenticate user credentials"""
    try:
        users = load_users()
        
        if email not in users:
            logging.warning(f"Login attempt for non-existent user: {email}")
            return {"status": "error", "message": "Invalid email or password"}
            
        stored_hash = users[email].get("password", "")
        if stored_hash == hash_password(password):
            logging.info(f"User {email} logged in successfully")
            return {"status": "success", "message": "Login successful"}
        else:
            logging.warning(f"Failed login attempt for user: {email}")
            return {"status": "error", "message": "Invalid email or password"}
            
    except Exception as e:
        logging.error(f"Authentication error: {e}")
        return {"status": "error", "message": "An error occurred during login"}

@eel.expose
def launch_main_app():
    """Launch the main application"""
    try:
        logging.info(f"Launching main app from: {APP_PATH}")
        
        # 3. FIX FOR SUBPROCESS PIPELINES: Set 'cwd' (current working directory)
        # This tells python to treat BASE_DIR as the active execution context
        subprocess.Popen([sys.executable, APP_PATH], cwd=BASE_DIR)
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Failed to start main app: {e}")
        return {"status": "error", "message": str(e)}

def main():
    """Main entry point for the application"""
    try:
        # Start the Eel application with the login page
        eel.start('.Login.html', 
                 mode='chrome',
                 host='localhost',
                 port=8000,
                 block=True,
                 size=(400, 600),
                 position=(100, 100),
                 disable_cache=True)
    except Exception as e:
        logging.error(f"Failed to start Eel application: {e}")

if __name__ == "__main__":
    main()
