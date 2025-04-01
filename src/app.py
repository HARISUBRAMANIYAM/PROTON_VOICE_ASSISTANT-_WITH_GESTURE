'''import eel
import os
import sys
import json
import time
import atexit
import logging
import threading
import subprocess
import tkinter as tk
import tkinter.messagebox as messagebox
from queue import Queue
from datetime import datetime
from pynput.keyboard import Controller, Key
# Third-party imports
import Proton
import Gesture_Controller

# Constants
LOG_IN_PATH = r"C:\Gesture-Controlled-Virtual-Mouse-main\src\main.py"
CHAT_HISTORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_history")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

class ChatBot:
    """Main chatbot class handling communication between frontend and backend"""
    
    started = False
    userinputQueue = Queue()
    chat_data = []
    session_file = None
    gesture_controller = None

    # Create chat history directory if it doesn't exist
    if not os.path.exists(CHAT_HISTORY_DIR):
        os.makedirs(CHAT_HISTORY_DIR)

    # ==================== CHAT HISTORY MANAGEMENT ====================
    @staticmethod
    def get_chat_filename():
        """Generate filename for chat history based on current timestamp"""
        return os.path.join(CHAT_HISTORY_DIR, datetime.now().strftime("%Y-%m-%d_%I-%M-%p") + ".json")

    @staticmethod
    @eel.expose
    def store_chat_message(sender, message):
        """Store a single chat message in memory and save to file"""
        ChatBot.chat_data.append({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sender": sender,
            "message": message
        })
        ChatBot.save_chat_history()

    @staticmethod
    @eel.expose
    def save_chat_history():
        """Save current chat history to file"""
        if ChatBot.chat_data:
            if ChatBot.session_file is None:
                ChatBot.session_file = ChatBot.get_chat_filename()
            try:
                with open(ChatBot.session_file, "w", encoding="utf-8") as f:
                    json.dump(ChatBot.chat_data, f, indent=4)
                logging.info(f"Chat history saved to {ChatBot.session_file}")
            except Exception as e:
                logging.error(f"Failed to save chat history: {e}")

    @staticmethod
    @eel.expose
    def get_chat_history_files():
        """Get list of all available chat history files"""
        try:
            logging.info(f"Looking for chat history in {CHAT_HISTORY_DIR}")
            files = sorted(os.listdir(CHAT_HISTORY_DIR), reverse=True)
            logging.info(f"Found {len(files)} chat history files")
            return files
        except Exception as e:
            logging.error(f"Error listing chat files: {e}")
            return []

    @staticmethod
    @eel.expose
    def getAllChatFiles():
        """Alias for get_chat_history_files to match JS function calls"""
        return ChatBot.get_chat_history_files()

    @staticmethod
    @eel.expose
    def getChatHistory(filename):
        """Load chat history with timestamp for frontend sync"""
        try:
            data = ChatBot.load_chat_file(filename)
            file_path = os.path.join(CHAT_HISTORY_DIR, filename)
            timestamp = os.path.getmtime(file_path) if os.path.exists(file_path) else 0
            return {
                "data": data,
                "timestamp": timestamp
            }
        except Exception as e:
            logging.error(f"Error loading chat history {filename}: {e}")
            return {"data": [], "timestamp": 0}

    @staticmethod
    @eel.expose
    def load_latest_chat():
        """Load the most recent chat history file"""
        try:
            files = sorted(os.listdir(CHAT_HISTORY_DIR), reverse=True)
            if not files:
                return []
            latest_file = os.path.join(CHAT_HISTORY_DIR, files[0])
            with open(latest_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Failed to load chat history: {e}")
            return []

    @staticmethod
    def load_chat_file(filename):
        """Load specific chat history file"""
        try:
            filepath = os.path.join(CHAT_HISTORY_DIR, filename)
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    file_content = f.read()
                    logging.info(f"File Content of {filename}: {file_content}")
                    return json.loads(file_content)
            logging.warning(f"File {filepath} does not exist")
            return []
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON format in file {filename}: {e}")
            return []
        except Exception as e:
            logging.error(f"Error loading chat file {filename}: {e}")
            return []

    # ==================== USER INPUT HANDLING ====================
    @staticmethod
    def isUserInput():
        """Check if there's user input in the queue"""
        return not ChatBot.userinputQueue.empty()

    @staticmethod
    def popUserInput():
        """Get user input from the queue"""
        return ChatBot.userinputQueue.get()

    @staticmethod
    @eel.expose
    def getUserInput(msg):
        """Process user input and generate response"""
        ChatBot.userinputQueue.put(msg)
        logging.info(f"User: {msg}")
        return Proton.respond(msg)

    # ==================== MESSAGE DISPLAY ====================
    @staticmethod
    def addUserMsg(msg):
        """Add user message to chat"""
        logging.info(f"User: {msg}")
        eel.addUserMsg(msg)
    
    @staticmethod    
    def addAppMsg(msg):
        """Add bot message to chat"""
        logging.info(f"Bot: {msg}")
        eel.addAppMsg(msg)
    @eel.expose
    def start_gesture():
        global gesture_controller
        gesture_controller = Gesture_Controller.GestureController()
        thread = threading.Thread(target=gesture_controller.start)
        thread.daemon = True
        thread.start()
        return {"message": "Gesture control started"}

    @eel.expose
    def stop_gesture():
        global gesture_controller
        if gesture_controller:
            gesture_controller.gc_mode = 0
        return {"message": "Gesture control stopped"}

    @eel.expose
    def get_video_frame():
        global gesture_controller
        if gesture_controller and hasattr(gesture_controller, 'get_video_frame'):
            return gesture_controller.get_video_frame()
        return None

    # ==================== APPLICATION CONTROL ====================
    @staticmethod
    def close_callback(route, websockets):
        """
        Handle application close or navigation
        Only close when there are no websockets AND not navigating internally
        """
        internal_pages = ['/index.html', '/about.html', '/register.html', '/.Login.html']
        
        if route not in internal_pages and not websockets:
            logging.info('Closing application...')
            ChatBot.save_chat_history()
        else:
            logging.info(f"Navigation detected to {route}, not closing application")

    @eel.expose 
    def Logout():
        #Logout and restart the application
        try:
            keyboard = Controller()
            keyboard.press(Key.alt_l)
            keyboard.press(Key.f4)
            keyboard.release(Key.f4)
            keyboard.release(Key.alt_l)
            ChatBot.addAppMsg('Closed Successfully')
            subprocess.Popen([sys.executable, LOG_IN_PATH])
            ChatBot.started = False
            os._exit(0)
        except Exception as e:
            logging.error(f"Error restarting the app: {e}")

    @eel.expose
    def navigate_to(page):
        """Handle navigation between pages"""
        logging.info(f"Navigating to: {page}")
        return {"status": "success", "message": f"Navigating to {page}"}
    #========================Login And Register=======================
    @eel.expose
    def authenticate_user(username, password):
        # Your authentication logic here
        pass

    @eel.expose
    def launch_main_app():
        # Logic to launch main application
        eel.show("dashboard.html")  # or whatever your main page is
        return {"status": "success"}

    @eel.expose
    def register(email, password,fullname=None):
        # Registration logic
        try:
            if not email or not password:
                return {"status": "error", "message": "Email and password are required"}
            if len(password) < 8:
                return {"status": "error", "message": "Password must be at least 6 characters long"}
        except Exception as e:
            return {"status": "error", "message": f"Error registering user: {e}"}

    # ==================== APPLICATION STARTUP ====================
    @staticmethod
    def start():
        """Start the Eel application"""
        path = os.path.dirname(os.path.abspath(__file__))
        eel.init(path + r'\web', allowed_extensions=['.js', '.html'])
        
        # Register cleanup handlers
        atexit.register(ChatBot.save_chat_history)
        
        try:
            eel.start('index.html', 
                     mode='chrome',
                     host='localhost',
                     port=27005,
                     block=False,
                     size=(350, 480),
                     position=(10, 100),
                     disable_cache=True,
                     close_callback=ChatBot.close_callback,
                     app_mode=True)
            
            ChatBot.started = True
            while ChatBot.started:
                try:
                    eel.sleep(1)  # Keep the Python process running
                except:
                    break
        
        except Exception as e:
            logging.error(f"Failed to start Eel: {e}")'''
'''import eel
import os
import sys
import json
import time
import atexit
import logging
import threading
import subprocess
import tkinter as tk
import tkinter.messagebox as messagebox
from queue import Queue
from datetime import datetime
from pynput.keyboard import Controller, Key
import base64
import cv2
import numpy as np
# Third-party imports
import Proton
import Gesture_Controller

# Constants
LOG_IN_PATH = r"C:\Gesture-Controlled-Virtual-Mouse-main\src\main.py"
CHAT_HISTORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_history")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

class ChatBot:
    """Main chatbot class handling communication between frontend and backend"""
    
    started = False
    userinputQueue = Queue()
    chat_data = []
    session_file = None
    gesture_controller = None
    gesture_active = False

    # Create chat history directory if it doesn't exist
    if not os.path.exists(CHAT_HISTORY_DIR):
        os.makedirs(CHAT_HISTORY_DIR)

    # ==================== CHAT HISTORY MANAGEMENT ====================
    @staticmethod
    def get_chat_filename():
        """Generate filename for chat history based on current timestamp"""
        return os.path.join(CHAT_HISTORY_DIR, datetime.now().strftime("%Y-%m-%d_%I-%M-%p") + ".json")

    @staticmethod
    @eel.expose
    def store_chat_message(sender, message):
        """Store a single chat message in memory and save to file"""
        ChatBot.chat_data.append({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sender": sender,
            "message": message
        })
        ChatBot.save_chat_history()
        return {"status": "success"}

    @staticmethod
    @eel.expose
    def save_chat_history():
        """Save current chat history to file"""
        if ChatBot.chat_data:
            if ChatBot.session_file is None:
                ChatBot.session_file = ChatBot.get_chat_filename()
            try:
                with open(ChatBot.session_file, "w", encoding="utf-8") as f:
                    json.dump(ChatBot.chat_data, f, indent=4)
                logging.info(f"Chat history saved to {ChatBot.session_file}")
                return {"status": "success"}
            except Exception as e:
                logging.error(f"Failed to save chat history: {e}")
                return {"status": "error", "message": str(e)}
        return {"status": "success", "message": "No data to save"}

    @staticmethod
    @eel.expose
    def get_chat_history_files():
        """Get list of all available chat history files"""
        try:
            if not os.path.exists(CHAT_HISTORY_DIR):
                return {"status": "error", "message": "Chat history directory not found", "data": []}
                
            files = [f for f in os.listdir(CHAT_HISTORY_DIR) if f.endswith('.json')]
            files.sort(reverse=True)
            logging.info(f"Found {len(files)} chat history files")
            return {"status": "success", "data": files}
        except Exception as e:
            logging.error(f"Error listing chat files: {e}")
            return {"status": "error", "message": str(e), "data": []}

    @staticmethod
    @eel.expose
    def getAllChatFiles():
        """Alias for get_chat_history_files to match JS function calls"""
        return ChatBot.get_chat_history_files()

    @staticmethod
    @eel.expose
    def getChatHistory(filename):
        """Load chat history with timestamp for frontend sync"""
        try:
            if not filename.endswith('.json'):
                filename += '.json'
                
            file_path = os.path.join(CHAT_HISTORY_DIR, filename)
            if not os.path.exists(file_path):
                return {"status": "error", "message": "File not found", "data": []}
                
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if not isinstance(data, list):
                return {"status": "error", "message": "Invalid data format", "data": []}
                
            return {
                "status": "success",
                "data": data,
                "timestamp": os.path.getmtime(file_path)
            }
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON in file {filename}: {e}")
            return {"status": "error", "message": f"Invalid JSON: {str(e)}", "data": []}
        except Exception as e:
            logging.error(f"Error loading chat history {filename}: {e}")
            return {"status": "error", "message": str(e), "data": []}

    @staticmethod
    @eel.expose
    def get_chat_history():
        """Get current session chat history"""
        try:
            return {
                "status": "success",
                "data": ChatBot.chat_data
            }
        except Exception as e:
            logging.error(f"Error getting current chat history: {e}")
            return {"status": "error", "message": str(e), "data": []}

    # ==================== GESTURE CONTROL ====================
    @staticmethod
    @eel.expose
    def start_gesture():
        """Start gesture control system"""
        try:
            if ChatBot.gesture_controller is None:
                ChatBot.gesture_controller = Gesture_Controller.GestureController()
                thread = threading.Thread(target=ChatBot.gesture_controller.start)
                thread.daemon = True
                thread.start()
            
            ChatBot.gesture_active = True
            logging.info("Gesture control started")
            return {"status": "success", "message": "Gesture control started"}
        except Exception as e:
            logging.error(f"Error starting gesture control: {e}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    @eel.expose
    def stop_gesture():
        """Stop gesture control system"""
        try:
            if ChatBot.gesture_controller:
                ChatBot.gesture_controller.gc_mode = 0
                ChatBot.gesture_controller = None
            
            ChatBot.gesture_active = False
            logging.info("Gesture control stopped")
            return {"status": "success", "message": "Gesture control stopped"}
        except Exception as e:
            logging.error(f"Error stopping gesture control: {e}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    @eel.expose
    def is_gesture_active():
        """Check if gesture control is active"""
        return ChatBot.gesture_active

    @staticmethod
    @eel.expose
    def get_video_frame():
        """Get current video frame from gesture controller"""
        try:
            if ChatBot.gesture_controller and ChatBot.gesture_active:
                frame = ChatBot.gesture_controller.get_frame()
                if frame is not None:
                    # Convert frame to base64
                    _, buffer = cv2.imencode('.jpg', frame)
                    return base64.b64encode(buffer).decode('utf-8')
            return None
        except Exception as e:
            logging.error(f"Error getting video frame: {e}")
            return None

    # ==================== USER INPUT HANDLING ====================
    @staticmethod
    def isUserInput():
        """Check if there's user input in the queue"""
        return not ChatBot.userinputQueue.empty()

    @staticmethod
    def popUserInput():
        """Get user input from the queue"""
        return ChatBot.userinputQueue.get()

    @staticmethod
    @eel.expose
    def getUserInput(msg):
        """Process user input and generate response"""
        try:
            ChatBot.userinputQueue.put(msg)
            logging.info(f"User: {msg}")
            response = Proton.respond(msg)
            return {"status": "success", "message": response}
        except Exception as e:
            logging.error(f"Error processing user input: {e}")
            return {"status": "error", "message": "Error processing your request"}

    # ==================== MESSAGE DISPLAY ====================
    @staticmethod
    def addUserMsg(msg):
        """Add user message to chat"""
        logging.info(f"User: {msg}")
        eel.addUserMsg(msg)
    
    @staticmethod    
    def addAppMsg(msg):
        """Add bot message to chat"""
        logging.info(f"Bot: {msg}")
        eel.addAppMsg(msg)

    # ==================== APPLICATION CONTROL ====================
    @staticmethod
    def close_callback(route, websockets):
        """
        Handle application close or navigation
        Only close when there are no websockets AND not navigating internally
        """
        internal_pages = ['/index.html', '/about.html', '/register.html', '/.Login.html']
        
        if route not in internal_pages and not websockets:
            logging.info('Closing application...')
            ChatBot.save_chat_history()
            ChatBot.stop_gesture()
        else:
            logging.info(f"Navigation detected to {route}, not closing application")

    @eel.expose 
    def Logout():
        """Logout and restart the application"""
        try:
            keyboard = Controller()
            keyboard.press(Key.alt_l)
            keyboard.press(Key.f4)
            keyboard.release(Key.f4)
            keyboard.release(Key.alt_l)
            ChatBot.addAppMsg('Closed Successfully')
            subprocess.Popen([sys.executable, LOG_IN_PATH])
            ChatBot.started = False
            os._exit(0)
        except Exception as e:
            logging.error(f"Error restarting the app: {e}")

    @staticmethod
    def start():
        """Start the Eel application"""
        path = os.path.dirname(os.path.abspath(__file__))
        eel.init(path + r'\web', allowed_extensions=['.js', '.html'])
        
        # Register cleanup handlers
        atexit.register(ChatBot.save_chat_history)
        atexit.register(ChatBot.stop_gesture)
        
        try:
            eel.start('index.html', 
                     mode='chrome',
                     host='localhost',
                     port=27005,
                     block=False,
                     size=(350, 480),
                     position=(10, 100),
                     disable_cache=True,
                     close_callback=ChatBot.close_callback,
                     app_mode=True)
            
            ChatBot.started = True
            while ChatBot.started:
                try:
                    eel.sleep(1)  # Keep the Python process running
                except:
                    break
        
        except Exception as e:
            logging.error(f"Failed to start Eel: {e}")

if __name__ == "__main__":
    ChatBot.start()'''
import eel
import os
import sys
import json
import time
import atexit
import logging
import threading
import subprocess
import tkinter as tk
import tkinter.messagebox as messagebox
from queue import Queue
from datetime import datetime
from pynput.keyboard import Controller, Key
import base64
import cv2
import numpy as np
# Third-party imports
import Proton
import Gesture_Controller

# Constants
LOG_IN_PATH = r"C:\Gesture-Controlled-Virtual-Mouse-main\src\main.py"
CHAT_HISTORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_history")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

class ChatBot:
    """Main chatbot class handling communication between frontend and backend"""
    
    started = False
    userinputQueue = Queue()
    chat_data = []
    session_file = None
    gesture_controller = None
    gesture_active = False
    frame = None  # To store the current video frame

    # Create chat history directory if it doesn't exist
    if not os.path.exists(CHAT_HISTORY_DIR):
        os.makedirs(CHAT_HISTORY_DIR)

    # ==================== CHAT HISTORY MANAGEMENT ====================
    @staticmethod
    def get_chat_filename():
        """Generate filename for chat history based on current timestamp"""
        return os.path.join(CHAT_HISTORY_DIR, datetime.now().strftime("%Y-%m-%d_%I-%M-%p") + ".json")

    @staticmethod
    @eel.expose
    def store_chat_message(sender, message):
        """Store a single chat message in memory and save to file"""
        ChatBot.chat_data.append({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sender": sender,
            "message": message
        })
        ChatBot.save_chat_history()
        return {"status": "success"}

    @staticmethod
    @eel.expose
    def save_chat_history():
        """Save current chat history to file"""
        if ChatBot.chat_data:
            if ChatBot.session_file is None:
                ChatBot.session_file = ChatBot.get_chat_filename()
            try:
                with open(ChatBot.session_file, "w", encoding="utf-8") as f:
                    json.dump(ChatBot.chat_data, f, indent=4)
                logging.info(f"Chat history saved to {ChatBot.session_file}")
                return {"status": "success"}
            except Exception as e:
                logging.error(f"Failed to save chat history: {e}")
                return {"status": "error", "message": str(e)}
        return {"status": "success", "message": "No data to save"}

    @staticmethod
    @eel.expose
    def get_chat_history_files():
        """Get list of all available chat history files"""
        try:
            if not os.path.exists(CHAT_HISTORY_DIR):
                return {"status": "error", "message": "Chat history directory not found", "data": []}
                
            files = [f for f in os.listdir(CHAT_HISTORY_DIR) if f.endswith('.json')]
            files.sort(reverse=True)
            logging.info(f"Found {len(files)} chat history files")
            return {"status": "success", "data": files}
        except Exception as e:
            logging.error(f"Error listing chat files: {e}")
            return {"status": "error", "message": str(e), "data": []}

    @staticmethod
    @eel.expose
    def getAllChatFiles():
        """Alias for get_chat_history_files to match JS function calls"""
        return ChatBot.get_chat_history_files()

    @staticmethod
    @eel.expose
    def getChatHistory(filename):
        """Load chat history with timestamp for frontend sync"""
        try:
            if not filename.endswith('.json'):
                filename += '.json'
                
            file_path = os.path.join(CHAT_HISTORY_DIR, filename)
            if not os.path.exists(file_path):
                return {"status": "error", "message": "File not found", "data": []}
                
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if not isinstance(data, list):
                return {"status": "error", "message": "Invalid data format", "data": []}
                
            return {
                "status": "success",
                "data": data,
                "timestamp": os.path.getmtime(file_path)
            }
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON in file {filename}: {e}")
            return {"status": "error", "message": f"Invalid JSON: {str(e)}", "data": []}
        except Exception as e:
            logging.error(f"Error loading chat history {filename}: {e}")
            return {"status": "error", "message": str(e), "data": []}

    @staticmethod
    @eel.expose
    def get_chat_history():
        """Get current session chat history"""
        try:
            return {
                "status": "success",
                "data": ChatBot.chat_data
            }
        except Exception as e:
            logging.error(f"Error getting current chat history: {e}")
            return {"status": "error", "message": str(e), "data": []}

    # ==================== GESTURE CONTROL ====================
    @staticmethod
    @eel.expose
    def start_gesture():
        """Start gesture control system"""
        try:
            if ChatBot.gesture_controller is None:
                ChatBot.gesture_controller = Gesture_Controller.GestureController()
                thread = threading.Thread(target=ChatBot.capture_frames)
                thread.daemon = True
                thread.start()
            
            ChatBot.gesture_active = True
            logging.info("Gesture control started")
            return {"status": "success", "message": "Gesture control started"}
        except Exception as e:
            logging.error(f"Error starting gesture control: {e}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    def capture_frames():
        """Continuously capture frames from camera"""
        cap = cv2.VideoCapture(0)
        while ChatBot.gesture_active:
            ret, frame = cap.read()
            if ret:
                ChatBot.frame = frame
            else:
                logging.error("Failed to capture frame from camera")
                break
        cap.release()

    @staticmethod
    @eel.expose
    def stop_gesture():
        """Stop gesture control system"""
        try:
            ChatBot.gesture_active = False
            if ChatBot.gesture_controller:
                ChatBot.gesture_controller.gc_mode = 0
                ChatBot.gesture_controller = None
            
            logging.info("Gesture control stopped")
            return {"status": "success", "message": "Gesture control stopped"}
        except Exception as e:
            logging.error(f"Error stopping gesture control: {e}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    @eel.expose
    def is_gesture_active():
        """Check if gesture control is active"""
        return ChatBot.gesture_active

    @staticmethod
    @eel.expose
    def get_video_frame():
        """Get current video frame from gesture controller"""
        try:
            if ChatBot.gesture_active and ChatBot.frame is not None:
                # Convert frame to base64
                _, buffer = cv2.imencode('.jpg', ChatBot.frame)
                return {
                    "status": "success",
                    "frame": base64.b64encode(buffer).decode('utf-8')
                }
            return {
                "status": "error",
                "message": "No frame available" if not ChatBot.gesture_active else "Frame capture failed"
            }
        except Exception as e:
            logging.error(f"Error getting video frame: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    # ==================== USER INPUT HANDLING ====================
    @staticmethod
    def isUserInput():
        """Check if there's user input in the queue"""
        return not ChatBot.userinputQueue.empty()

    @staticmethod
    def popUserInput():
        """Get user input from the queue"""
        return ChatBot.userinputQueue.get()

    @staticmethod
    @eel.expose
    def getUserInput(msg):
        """Process user input and generate response"""
        try:
            ChatBot.userinputQueue.put(msg)
            logging.info(f"User: {msg}")
            response = Proton.respond(msg)
            return {"status": "success", "message": response}
        except Exception as e:
            logging.error(f"Error processing user input: {e}")
            return {"status": "error", "message": "Error processing your request"}

    # ==================== MESSAGE DISPLAY ====================
    @staticmethod
    def addUserMsg(msg):
        """Add user message to chat"""
        logging.info(f"User: {msg}")
        eel.addUserMsg(msg)
    
    @staticmethod    
    def addAppMsg(msg):
        """Add bot message to chat"""
        logging.info(f"Bot: {msg}")
        eel.addAppMsg(msg)

    # ==================== APPLICATION CONTROL ====================
    @staticmethod
    def close_callback(route, websockets):
        """
        Handle application close or navigation
        Only close when there are no websockets AND not navigating internally
        """
        internal_pages = ['/index.html', '/about.html', '/register.html', '/.Login.html']
        
        if route not in internal_pages and not websockets:
            logging.info('Closing application...')
            ChatBot.save_chat_history()
            ChatBot.stop_gesture()
        else:
            logging.info(f"Navigation detected to {route}, not closing application")

    @eel.expose 
    def Logout():
        """Logout and restart the application"""
        try:
            keyboard = Controller()
            keyboard.press(Key.alt_l)
            keyboard.press(Key.f4)
            keyboard.release(Key.f4)
            keyboard.release(Key.alt_l)
            ChatBot.addAppMsg('Closed Successfully')
            subprocess.Popen([sys.executable, LOG_IN_PATH])
            ChatBot.started = False
            os._exit(0)
        except Exception as e:
            logging.error(f"Error restarting the app: {e}")

    @staticmethod
    def start():
        """Start the Eel application"""
        path = os.path.dirname(os.path.abspath(__file__))
        eel.init(path + r'\web', allowed_extensions=['.js', '.html'])
        
        # Register cleanup handlers
        atexit.register(ChatBot.save_chat_history)
        atexit.register(ChatBot.stop_gesture)
        
        try:
            eel.start('index.html', 
                     mode='chrome',
                     host='localhost',
                     port=27005,
                     block=False,
                     size=(350, 480),
                     position=(10, 100),
                     disable_cache=True,
                     close_callback=ChatBot.close_callback,
                     app_mode=True)
            
            ChatBot.started = True
            while ChatBot.started:
                try:
                    eel.sleep(1)  # Keep the Python process running
                except:
                    break
        
        except Exception as e:
            logging.error(f"Failed to start Eel: {e}")

if __name__ == "__main__":
    ChatBot.start()