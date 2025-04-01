import pyttsx3
import os
import sys
import time
import json
import vosk
import Gesture_Controller1
import pyaudio
import speech_recognition as sr
import webbrowser
import pyautogui
import ctypes
import subprocess
from ctypes import windll
from datetime import date, datetime
from threading import Thread
from pynput.keyboard import Controller, Key
import eel
import app

# Initialize text-to-speech engine
engine = pyttsx3.init('sapi5')
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)

# Initialize Speech Recognizer
recognizer = sr.Recognizer()

# Initialize Keyboard Controller
keyboard = Controller()

# Load Vosk model (Ensure you have downloaded the correct model)
VOSK_MODEL_PATH = "C:\\Gesture-Controlled-Virtual-Mouse-main\\src\\vosk-model-small-en-us-0.15"
if not os.path.exists(VOSK_MODEL_PATH):
    print("Please download a model from https://alphacephei.com/vosk/models")
    sys.exit()

model = vosk.Model(VOSK_MODEL_PATH)
vosk_recognizer = vosk.KaldiRecognizer(model, 16000)
mic = pyaudio.PyAudio()

is_awake = True
# ----------------- Enhanced Functions -------------------
def reply(audio):
    """Speaks out the response"""
    try:
        app.ChatBot.addAppMsg(audio)
        app.ChatBot.store_chat_message("Proton", audio)
        print(audio)
        engine.say(audio)
        engine.runAndWait()
    except Exception as e:
        print(f"Error in reply function: {e}")

def record_audio_vosk():
    """Record audio and transcribe it using Vosk offline model."""
    stream = mic.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8192)
    stream.start_stream()

    print("Listening...")
    while True:
        data = stream.read(4000, exception_on_overflow=False)
        if vosk_recognizer.AcceptWaveform(data):
            result = json.loads(vosk_recognizer.Result())
            return result.get("text", "").lower()

def record_audio_speech_recognition():
    """Record audio using speech recognition."""
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Listening...")
        try:
            audio = recognizer.listen(source)
            command = recognizer.recognize_google(audio).lower()
            print("You said:", command)
            return command
        except sr.UnknownValueError:
            print("Sorry, I couldn't understand.")
            return ""
        except sr.RequestError:
            print("Could not request results,please try again.....")
            return ""

def wish():
    """Greet the user based on the time of day."""
    hour = datetime.now().hour
    if 0 <= hour < 12:
        reply("Good Morning!")
    elif 12 <= hour < 18:
        reply("Good Afternoon!")
    else:
        reply("Good Evening!")
    reply("I am Proton Offline Based model Using Vosk, how may I assist you?")
def respond(voice_data):
    global is_awake
    
    # Wake up functionality
    if not is_awake and "wake up" in voice_data:
        is_awake = True
        reply("I am now awake and ready.")
        app.ChatBot.addAppMsg("I am now awake and ready.")
        return

    if is_awake:
        for command, action in COMMAND_MAP.items():
            if command in voice_data:
                print(f"Executing Command: {command}")
                action()
                break
        else:
            print(f"Unrecognized Command: {voice_data}")
            reply('I am not functioned to do this!')
            app.ChatBot.addAppMsg('I am not functioned to do this!')

def handle_file_navigation(command):
    """Handle file navigation commands."""
    global file_exp_status, files, path
    if 'list' in command:
        counter = 0
        path = 'C://'
        files = os.listdir(path)
        file_list = "<br>".join([f"{i+1}: {f}" for i, f in enumerate(files)])
        file_exp_status = True
        reply('These are the files in your root directory')
    elif file_exp_status and 'open' in command:
        try:
            file_index = int(command.split()[-1]) - 1
            file_path = os.path.join(path, files[file_index])
            if os.path.isfile(file_path):
                os.startfile(file_path)
                file_exp_status = False
            else:
                path = os.path.join(path, files[file_index])
                files = os.listdir(path)
                file_list = "<br>".join([f"{i+1}: {f}" for i, f in enumerate(files)])
                reply('Opened Successfully')
        except Exception as e:
            reply('You do not have permission to access this folder')
    elif file_exp_status and 'back' in command:
        if path == 'C://':
            reply('Sorry, this is the root directory')
        else:
            path = os.path.dirname(path)
            files = os.listdir(path)
            file_list = "<br>".join([f"{i+1}: {f}" for i, f in enumerate(files)])
            reply('OK')

def handle_gesture_control(command):
    """Handle gesture control commands."""
    if 'launch' in command:
        if Gesture_Controller1.GestureController.gc_mode:
            reply('Gesture recognition is already active')
        else:
            gc = Gesture_Controller1.GestureController()
            t = Thread(target=gc.start)
            t.start()
            reply('Launched Successfully')
    elif 'stop' in command or 'top' in command:
        if Gesture_Controller1.GestureController.gc_mode:
            Gesture_Controller1.GestureController.gc_mode = 0
            reply('Gesture recognition stopped')
        else:
            reply('Gesture recognition is already inactive')

def control_windows(command):
    """Enhanced Windows Control Functionality"""
    if "minimize window" in command:
        pyautogui.hotkey("win", "down")
        reply("Window minimized.")
    elif "maximize window" in command:
        pyautogui.hotkey("win", "up")
        reply("Window maximized.")
    elif "close window" in command:
        pyautogui.hotkey("alt", "f4")
        reply("Window closed.")
    elif "switch window" in command:
        pyautogui.hotkey("alt", "tab")
        reply("Switching window.")
    elif "volume up" in command:
        pyautogui.press("volumeup", presses=5)
        reply("Volume increased.")
    elif "volume down" in command:
        pyautogui.press("volumedown", presses=5)
        reply("Volume decreased.")
    elif "mute" in command:
        pyautogui.press("volumemute")
        reply("Volume muted.")
    elif "lock system" in command:
        ctypes.windll.user32.LockWorkStation()
        reply("System locked.")
    elif "logout" in command:
        os.system("shutdown -l")
        reply("Logging out.")
    elif "sleep" in command:
        os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        reply("System going to sleep mode.")
    elif "increase brightness" in command:
        windll.dxva2.SetMonitorBrightness(100)
        reply("Brightness increased.")
    elif "decrease brightness" in command:
        windll.dxva2.SetMonitorBrightness(50)
        reply("Brightness decreased.")
    elif "new tab" in command:
        pyautogui.hotkey("ctrl", "t")
        reply("New tab opened.")
    elif "close tab" in command:
        pyautogui.hotkey("ctrl", "w")
        reply("Tab closed.")
    elif "next tab" in command:
        pyautogui.hotkey("ctrl", "tab")
        reply("Switching to next tab.")
    elif "previous tab" in command:
        pyautogui.hotkey("ctrl", "shift", "tab")
        reply("Switching to previous tab.")
    elif "take screenshot" in command:
        time_stamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
        screenshot_path = f'Screenshot_{time_stamp}.png'
        pyautogui.screenshot(screenshot_path)
        reply(f'Screenshot saved as {screenshot_path}')
    elif "task manager" in command:
        subprocess.Popen("taskmgr.exe")
        reply("Opening Task Manager.")
    elif "bluetooth settings" in command:
        os.system("start ms-settings:bluetooth")
        reply("Opening Bluetooth settings.")
    elif "wifi settings" in command:
        os.system("start ms-settings:network")
        reply("Opening Network & WiFi settings.")
    elif "system settings" in command:
        os.system("start ms-settings:")
        reply("Opening System Settings.")
    elif "screen timeout" in command:
        os.system("powercfg.cpl")
        reply("Opening Power Options.")
    elif "startup programs" in command:
        os.system("shell:startup")
        reply("Opening Startup Programs Folder.")
'''def search(query):
    webbrowser.get().open(f'https://google.com/search?q={query.split("search")[1]}')
    reply('Here is what I found on the web')
'''
def open_browser(browser_name):
    """Open the specified browser."""
    if 'chrome' in browser_name:
        os.system('start chrome')
        reply('Chrome opened successfully')
    elif 'bing' in browser_name or 'edge' in browser_name:
        os.system('start microsoft-edge:http://bing.com')
        reply('Edge browser opened successfully')
    elif 'brave' in browser_name:
        os.system('start brave')
        reply('Brave browser opened successfully')
    else:
        webbrowser.open("https://www.google.com")
        reply('Opening default browser')

def additional_app_controls(command):
    """Additional application-specific controls"""
    if "open notepad" in command:
        subprocess.Popen("notepad.exe")
        reply("Opening Notepad.")
    elif "close notepad" in command:
        os.system("taskkill /f /im notepad.exe")
        reply("Notepad closed.")
    elif "open calculator" in command:
        subprocess.Popen("calc.exe")
        reply("Opening Calculator.")
    elif "open file explorer" in command:
        subprocess.Popen("explorer.exe")
        reply("Opening File Explorer.")

# Command Mapping
COMMAND_MAP = {
    # System Greetings and Basic Interactions
    'hello': wish,
    'hi proton': wish,
    'wake up': wish,
    'what is your name': lambda: reply('My name is Proton!'),
    
    # Date and Time
    'date': lambda: reply(str(date.today())),
    'time': lambda: reply(str(datetime.now()).split(" ")[1].split('.')[0]),
    
    # Browser and Web
    'open browser': lambda: open_browser(record_audio_vosk()),
    #'search': search(record_audio_vosk()),
    
    # Window and System Controls
    'minimize window': lambda: control_windows('minimize window'),
    'maximize window': lambda: control_windows('maximize window'),
    'close window': lambda: control_windows('close window'),
    'switch window': lambda: control_windows('switch window'),
    'lock system': lambda: control_windows('lock system'),
    'logout': lambda: control_windows('logout'),
    'sleep': lambda: control_windows('sleep'),
    
    # Audio Controls
    'volume up': lambda: control_windows('volume up'),
    'volume down': lambda: control_windows('volume down'),
    'mute': lambda: control_windows('mute'),
    
    # Display Controls
    'increase brightness': lambda: control_windows('increase brightness'),
    'decrease brightness': lambda: control_windows('decrease brightness'),
    
    # Browser Tab Controls
    'new tab': lambda: control_windows('new tab'),
    'close tab': lambda: control_windows('close tab'),
    'next tab': lambda: control_windows('next tab'),
    'previous tab': lambda: control_windows('previous tab'),
    
    # Application Controls
    'open notepad': lambda: additional_app_controls('open notepad'),
    'close notepad': lambda: additional_app_controls('close notepad'),
    'open calculator': lambda: additional_app_controls('open calculator'),
    'open file explorer': lambda: additional_app_controls('open file explorer'),
    
    # System Settings
    'bluetooth settings': lambda: control_windows('bluetooth settings'),
    'wifi settings': lambda: control_windows('wifi settings'),
    'system settings': lambda: control_windows('system settings'),
    'screen timeout': lambda: control_windows('screen timeout'),
    'startup programs': lambda: control_windows('startup programs'),
    
    # Gesture Recognition
    'launch gesture recognition': lambda: handle_gesture_control('launch'),
    'stop gesture recognition': lambda: handle_gesture_control('stop'),
    
    # File Navigation
    'list files': lambda: handle_file_navigation('list'),
    'open file': lambda: handle_file_navigation('open'),
    'back files': lambda: handle_file_navigation('back'),
    
    # Screenshot and Task Management
    'take screenshot': lambda: control_windows('take screenshot'),
    'task manager': lambda: control_windows('task manager'),
    
    # System Actions
    'shutdown': lambda: os.system('shutdown /s /t 1'),
    'restart': lambda: os.system('shutdown /r /t 1'),
    'exit': lambda: sys.exit(),
}

def handle_advanced_commands(voice_data):
    """Process advanced commands"""
    control_windows(voice_data)
    additional_app_controls(voice_data)

def respond(voice_data):
    """Process the voice command."""
    if not voice_data:
        return

    # Check predefined commands first
    for command, action in COMMAND_MAP.items():
        if command in voice_data:
            print(f"Executing Predefined Command: {command}")
            action()
            return

    # Check advanced commands
    handle_advanced_commands(voice_data)

# ------------------Driver Code--------------------
def main():
    t1 = Thread(target=app.ChatBot.start)
    t1.start()

    # Lock main thread until Chatbot has started
    while not app.ChatBot.started:
        time.sleep(0.5)
    
    wish()
    voice_data = None
    
    while True:
        # Check for user input from GUI
        if app.ChatBot.isUserInput():
            voice_data = app.ChatBot.popUserInput()
            app.ChatBot.addUserMsg(voice_data)
        else:
            # Fallback to voice recognition
            try:
                voice_data = record_audio_vosk()
            except Exception:
                voice_data = record_audio_speech_recognition()
            
            # Add user message to chat interface
            app.ChatBot.addUserMsg(voice_data)
            app.ChatBot.store_chat_message("User", voice_data)

        # Process the input
        if 'proton' in voice_data:
            try:
                respond(voice_data)
            except SystemExit:
                reply("Exit Successful")
                break
            except Exception as e:
                print(f"Exception raised: {e}")
                break

if __name__ == "__main__":
    main()