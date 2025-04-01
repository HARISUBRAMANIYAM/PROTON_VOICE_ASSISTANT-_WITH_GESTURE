'''
                        gest_name = handmajor.get_gesture()
                        Controller.handle_controls(gest_name, handmajor.hand_result)
                    
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                else:
                    Controller.prev_hand = None
   
                             cv2.imshow('Gesture Controller', imag'''
#Project title 
'''G-Voice Mouse: Gesture and Voice Interactive Control System
DeepMouse: Deep Learning Gesture and Voice Controlled Mouse
GVMouse: Gesture and Voice Controlled Mouse with Deep Learning
SmartMouse: Smart Gesture and Voice Controlled Mouse
DeepGesture Mouse: Deep Learning Gesture and Voice Mouse
IntelliMouse: Intelligent Gesture and Voice Controlled Mouse
GestureVoice Mouse: Gesture and Voice Enabled Virtual Mouse
DeepControl Mouse: Deep Learning Based Gesture and Voice Mouse
G-Voice Navigator: Gesture and Voice Based Mouse Navigator
DeepNav Mouse: Deep Learning Gesture and Voice Navigation Mouse'''

#For Proton 
'''Name Suggestions for PROTON:
PROTON: Personal Robotic Online Task-Oriented Navigator
PROTON: Personal Robotic Online Task-Oriented Network
PROTON: Personal Robotic Online Task-Oriented Notifier
PROTON: Personal Robotic Online Task-Oriented Assistant
PROTON: Personal Robotic Online Task-Oriented Navigator'''
'''import json
import os

CHAT_HISTORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_history")
print(CHAT_HISTORY_DIR)
filepath =CHAT_HISTORY_DIR + "\\2025-02-20_07-35-PM.json"
# Check if the file exists
if not os.path.exists(filepath):
    print(f"File {filepath} does not exist.")
else:
    # Check if the file is readable
    if not os.access(filepath, os.R_OK):
        print(f"File {filepath} is not readable.")
    else:
        print(f"File {filepath} is accessible.")'''
import json
import os

# Define the chat history directory
CHAT_HISTORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_history")
print(f"Chat history directory: {CHAT_HISTORY_DIR}")

# Define the file path
filepath = os.path.join(CHAT_HISTORY_DIR, "2025-02-20_07-35-PM.json")
print(f"Checking file: {filepath}")

# Check if the file exists
if not os.path.exists(filepath):
    print(f"File {filepath} does not exist.")
else:
    # Check if the file is readable
    if not os.access(filepath, os.R_OK):
        print(f"File {filepath} is not readable.")
    else:
        print(f"File {filepath} is accessible.")

        # Attempt to read and parse the JSON file
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                print("File content is valid JSON.")
                print("Content:", data)
        except json.JSONDecodeError as e:
            print(f"Invalid JSON format in file {filepath}: {e}")
        except Exception as e:
            print(f"Error reading file {filepath}: {e}")