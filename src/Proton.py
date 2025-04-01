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

# ------------------Functions----------------------
def reply(audio):
    try:
        app.ChatBot.addAppMsg(audio)
        app.ChatBot.store_chat_message("Proton",audio)
        print(audio)
        engine.say(audio)
        engine.runAndWait()
    except Exception as e:
        print(f"Error Occured in the  reply function{e}")


def wish():
    """Greet the user based on the time of day."""
    hour = datetime.now().hour
    if 0 <= hour < 12:
        reply("Good Morning!")
        #app.ChatBot.addAppMsg("Good Morning!")
    elif 12 <= hour < 18:
        reply("Good Afternoon!")
        #app.ChatBot.addAppMsg("Good Afternoon!")
    else:
        reply("Good Evening!")
        #app.ChatBot.addAppMsg("Good Evening!")
    reply("I am Proton, how may I help you?")
    #app.ChatBot.addAppMsg("I am Proton, how may I help you?")

def record_audio():
    """Record audio from the microphone and convert it to text."""
    with sr.Microphone() as source:
        recognizer.pause_threshold = 0.5
        try:
            print("Listening...")
            audio = recognizer.listen(source, phrase_time_limit=5)
            return recognizer.recognize_google(audio).lower()
        except sr.UnknownValueError:
            print("Could not understand audio")
            return ""
        except sr.RequestError:
            reply('Sorry, my service is down. Please check your Internet connection.')
            return ""

def open_browser(browser_name):
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
        #app.ChatBot.addAppMsg("Browser Not Supported")

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
def name():
    reply('My name is Proton!')
    #app.ChatBot.addAppMsg('My name is Proton!')
def search():
    webbrowser.get().open(f'https://google.com/search?q={voice_data.split("search")[1]}')
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
# Command Mapping
COMMAND_MAP = {
    'hello': wish,
    'what is your name':name,
    'date': date_f,
    'time': time_now,
    'search': search,
    'minimize all': minimize_all,
    'maximize all': maximize_all,
    'open notepad': notePad,
    'close notepad': closeNotePad,
    'type': type,
    'save': lambda: (keyboard.press(Key.ctrl_l) or keyboard.press('s') or keyboard.release('s') or keyboard.release(Key.ctrl_l),app.ChatBot.addAppMsg('Saved Successfully')),
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
    'backspace': lambda: keyboard.press('backspace'),
    'enter': lambda: keyboard.press('enter'),
    'location': lambda: webbrowser.get().open(f'https://google.nl/maps/place/{record_audio()}/&amp;'),
    'bye': lambda: [reply("Good bye Sir! Have a nice day."), setattr(sys.modules[__name__], 'is_awake', False)],
    'exit': lambda: sys.exit(),
    'launch gesture recognition':lambda: handle_gesture_control('launch'),
    'stop gesture recognition': lambda: handle_gesture_control('stop'),
    'scroll up': lambda: pyautogui.scroll(3),
    'scroll down': lambda: pyautogui.scroll(-3),
    'scroll right': lambda: pyautogui.hscroll(3),
    'scroll left': lambda: pyautogui.hscroll(-3),
    'copy All': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('a') or keyboard.release('a') or keyboard.release(Key.ctrl_l),
    'copy': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('c') or keyboard.release('c') or keyboard.release(Key.ctrl_l),
    'paste': lambda: keyboard.press(Key.ctrl_l) or keyboard.press('v') or keyboard.release('v') or keyboard.release(Key.ctrl_l),
    'list': lambda: handle_file_navigation('list'),
    'open': lambda: handle_file_navigation('open'),
    'back': lambda: handle_file_navigation('back'),
}

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
                print(f"Executing Command:{command}")
                action()
                break
        else:
            print(f"Unrecognized Command :{voice_data}")
            reply('I am not functioned to do this!')
            app.ChatBot.addAppMsg('I am not functioned to do this!')


# ------------------Driver Code--------------------

t1 = Thread(target = app.ChatBot.start)
t1.start()

# Lock main thread until Chatbot has started
while not app.ChatBot.started:
    time.sleep(0.5)
wish()
voice_data = None
while True:
    if app.ChatBot.isUserInput():
        #take input from GUI
        voice_data = app.ChatBot.popUserInput()
        app.ChatBot.addUserMsg(voice_data)
    else:
        #take input from Voice
        voice_data = record_audio()
        app.ChatBot.addUserMsg(voice_data)
        app.ChatBot.store_chat_message("User",voice_data)

    #process voice_data
    if 'proton' in voice_data:
        try:
            #Handle sys.exit()
            respond(voice_data)
        except SystemExit:
            reply("Exit Successfull")
            #app.ChatBot.addAppMsg("Exit Successfull")
            break
        except:
            #some other exception got raised
            print("EXCEPTION raised while closing.") 
            break
        


