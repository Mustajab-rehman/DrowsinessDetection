# app.py
from controllers.drowsiness_controller import drowsinessController # type: ignore
from flask import Flask

app = Flask(__name__)

# Register routes from controllers
@app.route('/')
def index():
    return "Welcome to the Drowsiness Detection App!"

@app.route('/log', methods=['POST'])
def log_drowsiness():
    return drowsinessController.log_drowsiness()

@app.route('/logs', methods=['GET'])
def fetch_logs():
    return drowsinessController.fetch_logs()

if __name__ == "__main__":
    app.run(debug=True)

