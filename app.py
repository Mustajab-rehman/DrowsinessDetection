from flask import Flask, request, jsonify
import numpy as np
import cv2
import dlib
from imutils import face_utils
from scipy.spatial import distance as dist
import io
import os
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Global variables
detector = None
predictor = None
initialization_error = None

def initialize_models():
    """Initialize face detection models"""
    global detector, predictor, initialization_error

    try:
        logger.info("Initializing face detector...")
        detector = dlib.get_frontal_face_detector()
        logger.info("Face detector initialized successfully")

        # Check if landmark file exists
        landmark_path = 'shape_predictor_68_face_landmarks.dat'
        if not os.path.exists(landmark_path):
            # Try alternative paths
            alternative_paths = [
                '/app/shape_predictor_68_face_landmarks.dat',
                './models/shape_predictor_68_face_landmarks.dat',
                '/tmp/shape_predictor_68_face_landmarks.dat'
            ]

            found = False
            for path in alternative_paths:
                if os.path.exists(path):
                    landmark_path = path
                    found = True
                    break

            if not found:
                raise FileNotFoundError(f"Landmark file not found. Checked paths: {[landmark_path] + alternative_paths}")

        logger.info(f"Loading landmark predictor from: {landmark_path}")
        predictor = dlib.shape_predictor(landmark_path)
        logger.info("Landmark predictor loaded successfully")

    except Exception as e:
        initialization_error = str(e)
        logger.error(f"Failed to initialize models: {e}")

def eye_aspect_ratio(eye):
    """Calculate eye aspect ratio"""
    try:
        A = dist.euclidean(eye[1], eye[5])
        B = dist.euclidean(eye[2], eye[4])
        C = dist.euclidean(eye[0], eye[3])
        return (A + B) / (2.0 * C)
    except Exception as e:
        logger.error(f"Error calculating EAR: {e}")
        return 0.0

def lip_distance(shape):
    """Calculate lip distance for yawn detection"""
    try:
        top_lip = shape[50:53]
        top_lip = np.concatenate((top_lip, shape[61:64]))
        low_lip = shape[56:59]
        low_lip = np.concatenate((low_lip, shape[65:68]))
        top_mean = np.mean(top_lip, axis=0)
        low_mean = np.mean(low_lip, axis=0)
        return abs(top_mean[1] - low_mean[1])
    except Exception as e:
        logger.error(f"Error calculating lip distance: {e}")
        return 0.0

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'detector_loaded': detector is not None,
        'predictor_loaded': predictor is not None,
        'initialization_error': initialization_error
    })

@app.route('/detect', methods=['POST'])
def detect():
    """Main detection endpoint"""
    try:
        # Check if models are initialized
        if detector is None or predictor is None:
            return jsonify({
                'error': 'Models not initialized',
                'initialization_error': initialization_error
            }), 500

        # Check if frame is provided
        if 'frame' not in request.files:
            return jsonify({'error': 'No frame uploaded'}), 400

        file = request.files['frame']
        logger.info(f"Received frame: {file.filename}, size: {file.content_length}")

        # Read image
        in_memory = io.BytesIO()
        file.save(in_memory)
        data = np.frombuffer(in_memory.getvalue(), dtype=np.uint8)
        frame = cv2.imdecode(data, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({'error': 'Invalid image format'}), 400

        logger.info(f"Image decoded successfully: {frame.shape}")

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detection thresholds
        EYE_AR_THRESH = 0.25  # Lowered threshold for easier detection
        YAWN_THRESH = 15      # Lowered threshold for easier detection

        # Detect faces
        rects = detector(gray)
        logger.info(f"Detected {len(rects)} faces")

        if len(rects) == 0:
            return jsonify({'status': 'No face detected'})

        # Process first face
        rect = rects[0]
        logger.info(f"Processing face at: {rect}")

        # Get facial landmarks
        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)
        logger.info(f"Got {len(shape)} landmarks")

        # Calculate eye aspect ratio
        (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
        (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]

        left_ear = eye_aspect_ratio(leftEye)
        right_ear = eye_aspect_ratio(rightEye)
        ear = (left_ear + right_ear) / 2.0

        # Calculate yawn distance
        yawn = lip_distance(shape)

        logger.info(f"EAR: {ear:.3f}, YAWN: {yawn:.3f}")

        # Check for drowsiness
        if ear < EYE_AR_THRESH:
            logger.warning("Drowsiness detected!")
            return jsonify({
                'status': 'Drowsiness detected',
                'EAR': round(ear, 3),
                'YAWN': round(yawn, 3),
                'threshold': EYE_AR_THRESH
            })

        # Check for yawning
        if yawn > YAWN_THRESH:
            logger.warning("Yawning detected!")
            return jsonify({
                'status': 'Yawning detected',
                'EAR': round(ear, 3),
                'YAWN': round(yawn, 3),
                'threshold': YAWN_THRESH
            })

        # Normal state
        return jsonify({
            'status': 'Normal',
            'EAR': round(ear, 3),
            'YAWN': round(yawn, 3),
            'face_count': len(rects)
        })

    except Exception as e:
        logger.error(f"Error in detection: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({
        'message': 'Backend is running',
        'models_loaded': detector is not None and predictor is not None
    })

if __name__ == '__main__':
    # Initialize models on startup
    initialize_models()

    if detector is None or predictor is None:
        logger.error("Failed to initialize models. Server may not work properly.")
    else:
        logger.info("All models initialized successfully")

    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)