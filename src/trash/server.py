from flask import Flask
import subprocess
import os
import signal

app = Flask(__name__)

process = None  # Store process reference

@app.route('/start_gesture_script')
def start_gesture_script():
    global process
    if process is None:  # Ensure only one instance runs
        process = subprocess.Popen(["python", "src\gesture1.py"])
    return "Gesture script started!"

@app.route('/stop_gesture_script')
def stop_gesture_script():
    global process
    if process:
        os.kill(process.pid, signal.SIGTERM)  # Kill the process safely
        process = None
    return "Gesture script stopped!"

if __name__ == '__main__':
    app.run(port=5000)
