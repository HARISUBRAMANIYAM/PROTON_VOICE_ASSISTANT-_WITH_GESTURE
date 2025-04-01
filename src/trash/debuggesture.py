import eel
import cv2
import mediapipe as mp
import pyautogui
import math
from enum import IntEnum
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
import screen_brightness_control as sbcontrol
import numpy as np
import base64
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s: %(message)s')

# Existing Gest and HLabel classes remain the same as in the original file
# Gesture Encodings 
class Gest(IntEnum):
    FIST = 0
    PINKY = 1
    RING = 2
    MID = 4
    LAST3 = 7
    INDEX = 8
    FIRST2 = 12
    LAST4 = 15
    THUMB = 16    
    PALM = 31
    
    # Extra Mappings
    V_GEST = 33
    TWO_FINGER_CLOSED = 34
    PINCH_MAJOR = 35
    PINCH_MINOR = 36

# Multi-handedness Labels
class HLabel(IntEnum):
    MINOR = 0
    MAJOR = 1

class HandRecog:
    def __init__(self, hand_label):
        self.finger = 0
        self.ori_gesture = Gest.PALM
        self.prev_gesture = Gest.PALM
        self.frame_count = 0
        self.hand_result = None
        self.hand_label = hand_label
        
        # New stability tracking
        self.gesture_stability_threshold = 5  # Frames to confirm a gesture
        self.stable_gesture_count = 0
    
    # Existing methods remain the same...
    def update_hand_result(self, hand_result):
        self.hand_result = hand_result

    def get_signed_dist(self, point):
        sign = -1
        if self.hand_result.landmark[point[0]].y < self.hand_result.landmark[point[1]].y:
            sign = 1
        dist = (self.hand_result.landmark[point[0]].x - self.hand_result.landmark[point[1]].x)**2
        dist += (self.hand_result.landmark[point[0]].y - self.hand_result.landmark[point[1]].y)**2
        dist = math.sqrt(dist)
        return dist*sign
    
    def get_dist(self, point):
        dist = (self.hand_result.landmark[point[0]].x - self.hand_result.landmark[point[1]].x)**2
        dist += (self.hand_result.landmark[point[0]].y - self.hand_result.landmark[point[1]].y)**2
        dist = math.sqrt(dist)
        return dist
    
    def get_dz(self, point):
        return abs(self.hand_result.landmark[point[0]].z - self.hand_result.landmark[point[1]].z)
    
    def set_finger_state(self):
        if self.hand_result is None:
            return

        points = [[8,5,0],[12,9,0],[16,13,0],[20,17,0]]
        self.finger = 0
        self.finger = self.finger | 0  # thumb
        for point in points:
            dist = self.get_signed_dist(point[:2])
            dist2 = self.get_signed_dist(point[1:])
            
            try:
                ratio = round(dist/dist2, 1)
            except:
                ratio = round(dist/0.01, 1)

            self.finger = self.finger << 1
            if ratio > 0.5:
                self.finger = self.finger | 1
    def get_gesture(self):
        if self.hand_result is None:
            return Gest.PALM

        current_gesture = Gest.PALM
        
        # Enhanced gesture recognition with more precise conditions
        if self.finger in [Gest.LAST3, Gest.LAST4] and self.get_dist([8,4]) < 0.05:
            current_gesture = Gest.PINCH_MINOR if self.hand_label == HLabel.MINOR else Gest.PINCH_MAJOR

        elif Gest.FIRST2 == self.finger:
            point = [[8,12],[5,9]]
            dist1 = self.get_dist(point[0])
            dist2 = self.get_dist(point[1])
            ratio = dist1/dist2
            
            # More nuanced gesture detection
            if ratio > 1.7:
                current_gesture = Gest.V_GEST
            elif self.get_dz([8,12]) < 0.1:
                current_gesture = Gest.TWO_FINGER_CLOSED
            else:
                current_gesture = Gest.MID

        else:
            current_gesture = self.finger
        
        # Improved gesture stability tracking
        if current_gesture == self.prev_gesture:
            self.stable_gesture_count += 1
            if self.stable_gesture_count >= self.gesture_stability_threshold:
                self.ori_gesture = current_gesture
                self.stable_gesture_count = 0
        else:
            self.stable_gesture_count = 0
            self.prev_gesture = current_gesture

        return self.ori_gesture

class Controller:
    # Most of the existing implementation remains the same
    
    @staticmethod
    def get_position(hand_result):
        """
        Enhanced cursor positioning with more sophisticated movement tracking
        """
        point = 9  # Wrist landmark
        position = [hand_result.landmark[point].x, hand_result.landmark[point].y]
        sx, sy = pyautogui.size()
        x_old, y_old = pyautogui.position()
        
        # Linear mapping with added smoothing
        x = int(position[0] * sx)
        y = int(position[1] * sy)
        
        # Adaptive movement speed based on hand movement intensity
        if Controller.prev_hand is None:
            Controller.prev_hand = x, y
        
        delta_x = x - Controller.prev_hand[0]
        delta_y = y - Controller.prev_hand[1]

        # Improved movement calculation
        distsq = delta_x**2 + delta_y**2
        movement_multiplier = 1.0
        
        if distsq <= 25:  # Very small movement
            movement_multiplier = 0.2
        elif distsq <= 400:  # Moderate movement
            movement_multiplier = 0.5
        elif distsq <= 900:  # Significant movement
            movement_multiplier = 1.0
        else:  # Very large movement
            movement_multiplier = 1.5
        
        # Smoothed cursor movement
        x = x_old + delta_x * movement_multiplier
        y = y_old + delta_y * movement_multiplier
        
        Controller.prev_hand = [x, y]
        
        logging.debug(f"Cursor Movement: Old ({x_old}, {y_old}) → New ({x}, {y})")
        return (x, y)

    @staticmethod
    def handle_controls(gesture, hand_result):
        """
        Enhanced gesture control with more robust handling
        """
        try:
            x, y = None, None
            
            # Only calculate position for non-palm gestures
            if gesture != Gest.PALM:
                x, y = Controller.get_position(hand_result)
                logging.debug(f"Gesture: {gesture}, Position: ({x}, {y})")
            
            # Reset flags with more comprehensive state management
            if gesture != Gest.FIST:
                if Controller.grabflag:
                    Controller.grabflag = False
                    pyautogui.mouseUp(button="left")

            if gesture != Gest.PINCH_MAJOR:
                Controller.pinchmajorflag = False

            if gesture != Gest.PINCH_MINOR:
                Controller.pinchminorflag = False

            # Refined gesture implementations
            if gesture == Gest.V_GEST:
                Controller.flag = True
                if x is not None and y is not None:
                    logging.info(f"Cursor Navigation: ({x}, {y})")
                    pyautogui.moveTo(x, y, duration=0.1)

            elif gesture == Gest.FIST:
                if not Controller.grabflag:
                    Controller.grabflag = True
                    pyautogui.mouseDown(button="left")
                if x is not None and y is not None:
                    pyautogui.moveTo(x, y, duration=0.1)

            elif gesture == Gest.MID and Controller.flag:
                pyautogui.click()
                Controller.flag = False

            elif gesture == Gest.INDEX and Controller.flag:
                pyautogui.click(button='right')
                Controller.flag = False

            elif gesture == Gest.TWO_FINGER_CLOSED and Controller.flag:
                pyautogui.doubleClick()
                Controller.flag = False

            elif gesture == Gest.PINCH_MINOR:
                if not Controller.pinchminorflag:
                    Controller.pinch_control_init(hand_result)
                    Controller.pinchminorflag = True
                Controller.pinch_control(hand_result, Controller.scrollHorizontal, Controller.scrollVertical)
            
            elif gesture == Gest.PINCH_MAJOR:
                if not Controller.pinchmajorflag:
                    Controller.pinch_control_init(hand_result)
                    Controller.pinchmajorflag = True
                Controller.pinch_control(hand_result, Controller.changesystembrightness, Controller.changesystemvolume)

        except Exception as e:
            logging.error(f"Gesture Control Error: {e}")

class GestureController:
    gc_mode = 0
    cap = None
    CAM_HEIGHT = None
    CAM_WIDTH = None
    hr_major = None 
    hr_minor = None 
    dom_hand = True
    is_running = False

    def __init__(self):
        """Initializes attributes."""
        GestureController.gc_mode = 1
        GestureController.cap = None
        self.hands = mp.solutions.hands.Hands(
            max_num_hands=2, 
            min_detection_confidence=0.5, 
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils

    @classmethod
    def classify_hands(cls, results):
        left, right = None, None
        try:
            handedness = results.multi_handedness
            hand_landmarks = results.multi_hand_landmarks

            if len(handedness) > 0 and len(hand_landmarks) > 0:
                for i, h in enumerate(handedness):
                    classification = h.classification[0]
                    if classification.label == 'Right':
                        right = hand_landmarks[i]
                    else:
                        left = hand_landmarks[i]

                if cls.dom_hand:
                    cls.hr_major = right
                    cls.hr_minor = left
                else:
                    cls.hr_major = left
                    cls.hr_minor = right
        except Exception as e:
            print(f"Hand classification error: {e}")

    def process_frame(self):
        """Process a single frame for gesture recognition."""
        if not GestureController.cap or not GestureController.cap.isOpened():
            logging.warning("camera not initialized or not opened") 
            return None

        success, image = GestureController.cap.read()
        if not success:
            logging.warning("Failed to read frame from camera")
            return None

        # Flip and convert image
        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = self.hands.process(image)
    
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Draw hand landmarks if detected
        if results.multi_hand_landmarks:
            logging.debug(f"Detected {len(results.multi_hand_landmarks)} hands")
            # Use a try-except block for hand classification
            try:
                # Classify hands (similar to the original implementation)
                handedness = results.multi_handedness
                hand_landmarks = results.multi_hand_landmarks

                left, right = None, None
                for i, h in enumerate(handedness):
                    classification = h.classification[0]
                    if classification.label == 'Right':
                        right = hand_landmarks[i]
                    else:
                        left = hand_landmarks[i]

                # Set major and minor hands
                self.hr_major = right if self.dom_hand else left
                self.hr_minor = left if self.dom_hand else right

                # Create hand recognizers
                handmajor = HandRecog(HLabel.MAJOR)
                handminor = HandRecog(HLabel.MINOR)

                handmajor.update_hand_result(self.hr_major)
                handminor.update_hand_result(self.hr_minor)

                handmajor.set_finger_state()
                handminor.set_finger_state()

                # Gesture recognition
                gest_name = handminor.get_gesture()
                if gest_name == Gest.PINCH_MINOR:
                    Controller.handle_controls(gest_name, handminor.hand_result)
                else:
                    gest_name = handmajor.get_gesture()
                    Controller.handle_controls(gest_name, handmajor.hand_result)

                # Draw landmarks
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image, 
                        hand_landmarks, 
                        mp.solutions.hands.HAND_CONNECTIONS
                    )

            except Exception as e:
                print(f"Hand processing error: {e}")
        else:
            logging.debug("No hands detected in the frame")

        return image

# Determine project root and web directory
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(PROJECT_ROOT, 'web')

# Eel-exposed functions
gc = GestureController()

@eel.expose
def start_gesture():
    """Start gesture recognition."""
    if not GestureController.cap:
        GestureController.cap = cv2.VideoCapture(0)
    GestureController.is_running = True
    return {"message": "Gesture control started successfully"}

@eel.expose
def stop_gesture():
    """Stop gesture recognition."""
    GestureController.is_running = False
    if GestureController.cap:
        GestureController.cap.release()
        GestureController.cap = None
    return {"message": "Gesture control stopped successfully"}

@eel.expose
def get_video_frame():
    """Capture and process video frame."""
    if not GestureController.is_running:
        return None
    
    frame = gc.process_frame()
    if frame is not None:
        # Encode frame to base64
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        return frame_base64
    return None

def start_eel_app():
    # Validate web directory
    if not os.path.exists(WEB_DIR):
        raise FileNotFoundError(f"Web directory not found: {WEB_DIR}")
    
    print("Web directory found")
    for item in os.listdir(WEB_DIR):
        print(f"- {item}")
    
    # Initialize Eel
    eel.init(WEB_DIR)
    
    # Specify HTML file path
    html_path = os.path.join(WEB_DIR, 'Gesture.html')
    
    # Check HTML file exists
    if not os.path.exists(html_path):
        raise FileNotFoundError(f"HTML file not found: {html_path}")
    
    # Start Eel application
    eel.start(html_path, mode='chrome', size=(800,600))

if __name__ == '__main__':
    try:
        # Configure pyautogui
        pyautogui.FAILSAFE = True
        
        # Start the application
        start_eel_app()
    except Exception as e:
        print(f"Error starting Eel app: {e}")
        input("Press Enter to exit...")
# The rest of the code (GestureController, Eel functions, etc.) remains largely the same
# Main improvements are in HandRecog, Controller.get_position(), and Controller.handle_controls()

# Optional: Add more logging and error handling in other methods if needed