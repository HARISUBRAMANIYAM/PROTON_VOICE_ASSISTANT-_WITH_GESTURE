import cv2
from mediapipe.python import *
import mediapipe as mp
import pyautogui
import math
from enum import IntEnum
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from google.protobuf.json_format import MessageToDict
import screen_brightness_control as sbcontrol
import base64
import eel
import threading

# Initialize eel with the directory where your HTML files are stored
eel.init('.')  # Using current directory - change if needed

# Keep all your existing class definitions (Gest, HLabel, HandRecog, Controller)
# Just as they are in your original code...

# Existing gesture enums, hand recognition, and controller classes remain unchanged
# ...

class GestureController:
    """
    Handles camera, obtain landmarks from mediapipe, entry point
    for whole program.
    """
    gc_mode = 0
    cap = None
    CAM_HEIGHT = None
    CAM_WIDTH = None
    hr_major = None # Right Hand by default
    hr_minor = None # Left Hand by default
    dom_hand = True

    def __init__(self):
        """Initilaizes attributes."""
        GestureController.gc_mode = 1
        GestureController.cap = cv2.VideoCapture(0)
        GestureController.CAM_HEIGHT = GestureController.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        GestureController.CAM_WIDTH = GestureController.cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    
    def classify_hands(results):
        """
        sets 'hr_major', 'hr_minor' based on classification(left, right) of 
        hand obtained from mediapipe, uses 'dom_hand' to decide major and
        minor hand.
        """
        # Keep the existing implementation
        left, right = None, None
        try:
            handedness_dict = MessageToDict(results.multi_handedness[0])
            if handedness_dict['classification'][0]['label'] == 'Right':
                right = results.multi_hand_landmarks[0]
            else:
                left = results.multi_hand_landmarks[0]
        except:
            pass

        try:
            handedness_dict = MessageToDict(results.multi_handedness[1])
            if handedness_dict['classification'][0]['label'] == 'Right':
                right = results.multi_hand_landmarks[1]
            else:
                left = results.multi_hand_landmarks[1]
        except:
            pass
        
        if GestureController.dom_hand == True:
            GestureController.hr_major = right
            GestureController.hr_minor = left
        else:
            GestureController.hr_major = left
            GestureController.hr_minor = right

    def start(self):
        """
        Entry point of whole program, captures video frame and passes, obtains
        landmark from mediapipe and passes it to 'handmajor' and 'handminor' for
        controlling.
        """
        handmajor = HandRecog(HLabel.MAJOR)
        handminor = HandRecog(HLabel.MINOR)

        with mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
            while GestureController.cap.isOpened() and GestureController.gc_mode:
                success, image = GestureController.cap.read()

                if not success:
                    print("Ignoring empty camera frame.")
                    continue
                
                image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = hands.process(image)
                
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                if results.multi_hand_landmarks:
                    GestureController.classify_hands(results)
                    handmajor.update_hand_result(GestureController.hr_major)
                    handminor.update_hand_result(GestureController.hr_minor)

                    handmajor.set_finger_state()
                    handminor.set_finger_state()
                    gest_name = handminor.get_gesture()

                    if gest_name == Gest.PINCH_MINOR:
                        Controller.handle_controls(gest_name, handminor.hand_result)
                    else:
                        gest_name = handmajor.get_gesture()
                        Controller.handle_controls(gest_name, handmajor.hand_result)
                    
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                else:
                    Controller.prev_hand = None
                
                # Convert image to base64 to send to JavaScript
                _, buffer = cv2.imencode('.jpg', image)
                img_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Send the frame to JavaScript
                eel.update_camera_feed(img_base64)()
                
                # Small delay to limit CPU usage
                cv2.waitKey(10)

# Global instance of the controller
gc_instance = None

@eel.expose
def start_gesture_control():
    """Start the gesture controller."""
    global gc_instance
    if gc_instance is None:
        gc_instance = GestureController()
        threading.Thread(target=gc_instance.start, daemon=True).start()
        return True
    return False

@eel.expose
def stop_gesture_control():
    """Stop the gesture controller."""
    global gc_instance
    if gc_instance is not None:
        GestureController.gc_mode = 0
        gc_instance = None
        return True
    return False

# Start the eel application
if __name__ == "__main__":
    # Create a simple HTML page with the camera feed
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gesture Control</title>
        <script type="text/javascript" src="/eel.js"></script>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container {
                text-align: center;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
            }
            h1 {
                color: #333;
            }
            .button-container {
                margin: 20px 0;
            }
            button {
                padding: 10px 20px;
                margin: 0 10px;
                font-size: 16px;
                cursor: pointer;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            button:hover {
                background-color: #45a049;
            }
            #camera-container {
                width: 640px;
                height: 480px;
                margin: 0 auto;
                border: 3px solid #4CAF50;
                border-radius: 8px;
                overflow: hidden;
                background-color: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #camera-feed {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .gesture-info {
                margin-top: 20px;
                padding: 15px;
                background-color: #ffffff;
                border-radius: 8px;
                text-align: left;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .gesture-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            .pulse {
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Gesture Control</h1>
            <p>Control your computer using hand gestures</p>
            
            <div class="button-container">
                <button id="start-btn" class="pulse" onclick="startGesture()">Start Gesture Control</button>
                <button id="stop-btn" onclick="stopGesture()">Stop Gesture Control</button>
            </div>
            
            <div id="camera-container">
                <img id="camera-feed" src="" alt="Camera feed will appear here when started">
            </div>
            
            <div class="gesture-info">
                <h2>Available Gestures</h2>
                <div class="gesture-grid">
                    <p><strong>✌️ V Gesture:</strong> Move cursor</p>
                    <p><strong>👊 Fist:</strong> Click and drag</p>
                    <p><strong>🖕 Middle finger:</strong> Left click</p>
                    <p><strong>☝️ Index finger:</strong> Right click</p>
                    <p><strong>🤏 Pinch (major hand):</strong> Adjust brightness/volume</p>
                    <p><strong>🤏 Pinch (minor hand):</strong> Scroll horizontally/vertically</p>
                    <p><strong>✌️ (closed):</strong> Double click</p>
                </div>
            </div>
        </div>
        
        <script>
            // Function to update the camera feed
            eel.expose(update_camera_feed);
            function update_camera_feed(base64Image) {
                document.getElementById('camera-feed').src = 'data:image/jpeg;base64,' + base64Image;
            }
            
            // Start gesture control
            function startGesture() {
                eel.start_gesture_control()(function(result) {
                    if (result) {
                        document.getElementById('start-btn').classList.remove('pulse');
                    }
                });
            }
            
            // Stop gesture control
            function stopGesture() {
                eel.stop_gesture_control()(function(result) {
                    if (result) {
                        document.getElementById('start-btn').classList.add('pulse');
                        document.getElementById('camera-feed').src = '';
                    }
                });
            }
        </script>
    </body>
    </html>
    """
    
    # Write the HTML content to a file
    with open("gesture_control.html", "w") as f:
        f.write(html_content)
    
    # Start the Eel application with the HTML page
    eel.start('gesture_control.html', size=(800, 600))