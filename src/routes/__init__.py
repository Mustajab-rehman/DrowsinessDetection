from flask import Flask
from app.controllers.drowsiness_controller import drowsinessController # type: ignore

def create_app():
    app = Flask(__name__)

    @app.route('/')
    def index():
        return "Welcome to the Drowsiness Detection App!"

    @app.route('/log', methods=['POST'])
    def log_drowsiness():
        return drowsinessController.log_drowsiness()

    @app.route('/logs', methods=['GET'])
    def fetch_logs():
        return drowsinessController.fetch_logs()

    return app
