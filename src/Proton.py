import pyttsx3
import speech_recognition as sr
from datetime import date, datetime
import time
import webbrowser
import pyautogui
import sys
import os
import Gesture_Controller1
import app
from threading import Thread
from queue import Queue
import threading
from pynput.keyboard import Controller, Key
import eel
import vosk
import json
import pyaudio
from fuzzywuzzy import process

# -------------Object Initialization---------------
today = date.today()
recognizer = sr.Recognizer()
keyboard = Controller()
engine = pyttsx3.init('sapi5')
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)

# ----------------Variables------------------------
file_exp_status = False
files = []
path = ''
is_awake = True  # Bot status

# Initialize Vosk model
VOSK_MODEL_PATH = "C:\\Gesture-Controlled-Virtual-Mouse-main\\src\\vosk-model-small-en-us-0.15"
if not os.path.exists(VOSK_MODEL_PATH):
    print("Please download a model from https://alphacephei.com/vosk/models and extract to the path")
    sys.exit()

vosk_model = vosk.Model(VOSK_MODEL_PATH)
vosk_recognizer = vosk.KaldiRecognizer(vosk_model, 16000)

# ------------------Functions----------------------
def reply(audio):
    try:
        app.ChatBot.addAppMsg(audio)
        app.ChatBot.store_chat_message("Proton", audio)
        print(audio)
        engine.say(audio)
        engine.runAndWait()
    except Exception as e:
        print(f"Error Occurred in the reply function: {e}")

def wish():
    """Greet the user based on the time of day."""
    hour = datetime.now().hour
    if 0 <= hour < 12:
        reply("Good Morning!")
    elif 12 <= hour < 18:
        reply("Good Afternoon!")
    else:
        reply("Good Evening!")
    reply("I am Proton, how may I help you?")

def record_audio():
    """Record audio from the microphone and convert it to text using Vosk."""
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8192)
    stream.start_stream()
    
    print("Listening...")
    
    while True:
        data = stream.read(4096)
        if vosk_recognizer.AcceptWaveform(data):
            # result = vosk_recognizer.Result()
            # text = result[14:-3]
            result_json = json.loads(vosk_recognizer.Result())
            text = result_json.get("text","")  # Extract text from JSON result
            print(f"Recognized: {text}")
            stream.stop_stream()
            stream.close()
            p.terminate()
            return text.lower()
    
    # Fallback if no speech detected
    stream.stop_stream()
    stream.close()
    p.terminate()
    return ""
name = "Proton"
'''def open_browser(browser_name):
    """Open the specified browser."""
    if 'chrome' in browser_name:
        os.system('start chrome')
        reply('Chrome opened successfully')
        app.ChatBot.addAppMsg("opened Chrome")
    elif 'bing' in browser_name:
        os.system('start microsoft-edge:http://bing.com')
        reply('Bing opened successfully')
        #app.ChatBot.addAppMsg("opened Bing")
    else:
        reply('Browser not supported')
        #app.ChatBot.addAppMsg("Browser Not Supported")'''
def open_browser(browser_name):
    browsers = {
        'chrome': ('chrome', 'start chrome'),
        'edge': ('msedge', 'start microsoft-edge:http://bing.com'),
        'firefox': ('firefox', 'start firefox')
    }
    
    for name, (process_name, cmd) in browsers.items():
        if name in browser_name:
            os.system(cmd)
            reply(f'{name.capitalize()} opened successfully')
            return
    
    reply('Browser not supported')
reminders = []

def set_reminder(voice_data):
    try:
        parts = voice_data.split("remind me to", 1)[1].strip().split("in", 1)
        task = parts[0].strip()
        time_str = parts[1].strip()
        minutes = int(time_str.split()[0])
        seconds = minutes * 60
        reminder_time = time.time() + seconds
        reminders.append((reminder_time, task))
        reply(f"Okay, I'll remind you to {task} in {minutes} minutes.")
        threading.Thread(target=_trigger_reminder, args=(reminder_time, task)).start()
    except Exception as e:
        reply("Sorry, I didn't understand the reminder command.")
        print(f"Error setting reminder: {e}")

def _trigger_reminder(reminder_time, task):
    while time.time() < reminder_time:
        time.sleep(1)
    reply(f"Reminder: It's time to {task}!")
    app.ChatBot.addAppMsg(f"Reminder: It's time to {task}!")
    # Remove the reminder after triggering (optional, depending on desired behavior)
    for i, (time_check, task_check) in enumerate(reminders):
        if time_check == reminder_time and task_check == task:
            reminders.pop(i)
            break

def take_screenshot():
    """Take a screenshot and save it."""
    time_stamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    screenshot_path = f'C://Gesture-Controlled-Virtual-Mouse-main//ScreenShot//ScreenShot{time_stamp}.png'
    pyautogui.screenshot(screenshot_path)
    reply(f'Screenshot saved at {screenshot_path}')
    #app.ChatBot.addAppMsg(f'<img src="{screenshot_path}" alt="Screenshot" width="300" height="200">')

def handle_gesture_control(command):
    """Handle gesture control commands."""
    if 'launch' in command:
        if Gesture_Controller1.GestureController.gc_mode:
            reply('Gesture recognition is already active')
            #app.ChatBot.addAppMsg("Gesture recognition is already active")
        else:
            gc = Gesture_Controller1.GestureController()
            t =Thread(target=gc.start)
            t.start()
            reply('Launched Successfully')
    elif 'stop' in command or 'top' in command:
        if Gesture_Controller1.GestureController.gc_mode:
            Gesture_Controller1.GestureController.gc_mode = 0
            reply('Gesture recognition stopped')
            #app.ChatBot.addAppMsg("Gesture recognition stopped")
        else:
            reply('Gesture recognition is already inactive')
            #app.ChatBot.addAppMsg("Gesture recognition is already inactive")
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
        #app.ChatBot.addAppMsg(file_list)
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
                app.ChatBot.addAppMsg(file_list)
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
            app.ChatBot.addAppMsg(file_list)
def date_f():
    reply(today.strftime("%B %d, %Y"))
    #app.ChatBot.addAppMsg(today.strftime("%B %d, %Y"))
def time_now():
    reply(str(datetime.now()).split(" ")[1].split('.')[0])
    #app.ChatBot.addAppMsg(str(datetime.now()).split(" ")[1].split('.')[0])
def tell_name():
    reply('My name is Proton!')
    #app.ChatBot.addAppMsg('My name is Proton!')
def search(voice_data):
    query = voice_data.split("search", 1)[1].strip()
    webbrowser.open(f'https://google.com/search?q={query}')
    reply('Here is what I found on the web')
    #app.ChatBot.addAppMsg('Here is what I found on the web for Search')
def minimize_all():
    pyautogui.hotkey('win', 'down')
    #app.ChatBot.addAppMsg('Minimized all windows')
def maximize_all():
    pyautogui.hotkey('win', 'up')
    #app.ChatBot.addAppMsg('Maximized all windows')
def notePad():
    os.system('start notepad')
    #app.ChatBot.addAppMsg('Opened Notepad')
def closeNotePad():
    os.system('taskkill /f /im notepad.exe')
    #app.ChatBot.addAppMsg('Closed Notepad')
def type():
    keyboard.type(record_audio())
    #app.ChatBot.addAppMsg('Typed Successfully')
def open_website(url):
    print(f"Opening {url}")
    webbrowser.open(url)
def tell_time():
    now = datetime.now()
    time_string = now.strftime("%H:%M")
    print(f"The time is {time_string}")
    reply(f"The time is {time_string}")

# Command Mapping

# [Rest of your functions remain the same...]

# Command Mapping (same as before)
COMMAND_MAP = {
    'hello': wish,
    'what is your name': tell_name,
    'date': date_f,
    'time': time_now,
    'search': lambda :search(record_audio()),
    'minimize all': minimize_all,
    'tell time':tell_time,
    'maximize all': maximize_all,
    'open notepad': notePad,
    'close notepad': closeNotePad,
    'type': type,
    'remind me to':set_reminder,
    'save': lambda: (keyboard.press(Key.ctrl_l),keyboard.press('s'),keyboard.release('s'),keyboard.release(Key.ctrl_l),app.ChatBot.addAppMsg('Saved Successfully')),
    'close': lambda: (keyboard.press(Key.alt_l) or keyboard.press(Key.f4) or keyboard.release(Key.f4) or keyboard.release(Key.alt_l),app.ChatBot.addAppMsg('Closed Successfully')),
    'folders': lambda: (os.system('start explorer'),app.ChatBot.addAppMsg('Opened File Explorer')),
    'undo': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('z') or keyboard.release('z') or keyboard.release(Key.ctrl_l),
    'redo': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('y') or keyboard.release('y') or keyboard.release(Key.ctrl_l),
    'open calculator': lambda: os.system('start calc'),
    'close calculator': lambda: os.system('taskkill /f /im calculator.exe'),
    'open browser': lambda: open_browser(record_audio()),
    'close browser': lambda: [os.system(f'taskkill /f /im {browser}.exe') for browser in ['chrome', 'msedge']],
    'screen shot': take_screenshot,
    'select all': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('a') or keyboard.release('a') or keyboard.release(Key.ctrl_l),
    'shutdown': lambda: os.system('shutdown /s /t 1'),
    'restart': lambda: os.system('shutdown /r /t 1'),
    'new tab': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('t') or keyboard.release('t') or keyboard.release(Key.ctrl_l),
    'close tab': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('w') or keyboard.release('w') or keyboard.release(Key.ctrl_l),
    'delete': lambda: keyboard.press('delete'),
    "open youtube":lambda :open_website("https://youtube.com"),
    "open google":lambda :open_website("https://google.com"),
    'backspace': lambda: keyboard.press('backspace'),
    'enter': lambda: keyboard.press('enter'),
    'location': lambda: webbrowser.get().open(f'https://google.nl/maps/place/{record_audio()}/&amp;'),
    'bye': lambda: [reply("Good bye Sir! Have a nice day."), setattr(sys.modules[__name__], 'is_awake', False)],
    'exit': lambda: sys.exit(),
    'launch gesture recognition':lambda: handle_gesture_control('launch'),
    'stop gesture recognition': lambda: handle_gesture_control('stop'),
    'scroll up': lambda: pyautogui.scroll(300),
    'scroll down': lambda: pyautogui.scroll(-300),
    'scroll right': lambda: pyautogui.hscroll(3),
    'scroll left': lambda: pyautogui.hscroll(-3),
    'copy All': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('a') or keyboard.release('a') or keyboard.release(Key.ctrl_l),
    'copy': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('c') or keyboard.release('c') or keyboard.release(Key.ctrl_l),
    'paste': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('v') or keyboard.release('v') or keyboard.release(Key.ctrl_l),
    'list': lambda: handle_file_navigation('list'),
    'open': lambda: handle_file_navigation('open'),
    'back': lambda: handle_file_navigation('back'),
    # ... rest of your command mappings ...
}

COMMAND_KEYS = list(COMMAND_MAP.keys())


def execute_command_with_fuzzy_match(command_text):
    best_match, confidence = process.extractOne(command_text, COMMAND_KEYS)
    
    print(f"[DEBUG] Recognized: {command_text} → Best Match: {best_match} ({confidence}%)")

    if confidence > 70:  # Threshold can be adjusted
        try:
            COMMAND_MAP[best_match]()  # Execute matched command
        except Exception as e:
            reply("Sorry, I couldn't execute the command.")
            print(f"Execution Error: {e}")
    else:
        reply("I didn't understand the command.")



def match_command(user_input):
    commands = list(COMMAND_MAP.keys())
    best_match, score = process.extractOne(user_input, commands)
    if score > 75:
        return best_match
    return None
def respond(voice_data):
    """Process the voice command."""
    global is_awake
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

# [Rest of your driver code remains the same...]

t1 = Thread(target=app.ChatBot.start)
t1.start()

# Lock main thread until Chatbot has started
while not app.ChatBot.started:
    time.sleep(0.5)
    
wish()

while True:
    if app.ChatBot.isUserInput():
        # take input from GUI
        voice_data = app.ChatBot.popUserInput()
        app.ChatBot.addUserMsg(voice_data)
    else:
        # take input from Voice using Vosk
        voice_data = record_audio()
        command_key = match_command(voice_data)
        if command_key:
            if voice_data:  # Only process if we got some voice input
                execute_command_with_fuzzy_match(voice_data)
                app.ChatBot.addUserMsg(voice_data)
                app.ChatBot.store_chat_message("User", voice_data)
        else:
            reply("Sorry, I didn’t understand that command.")

    # process voice_data
    if 'proton' in voice_data:
        try:
            # Handle sys.exit()
            respond(voice_data)
        except SystemExit:
            reply("Exit Successful")
            break
        except Exception as e:
            print(f"EXCEPTION raised while processing command: {e}")
            break