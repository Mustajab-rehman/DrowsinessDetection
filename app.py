from flask import Flask, request, jsonify
import numpy as np
import cv2
import dlib
from imutils import face_utils
from scipy.spatial import distance as dist
import io

app = Flask(__name__)

# Load once at start
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def lip_distance(shape):
    top_lip = shape[50:53]
    top_lip = np.concatenate((top_lip, shape[61:64]))
    low_lip = shape[56:59]
    low_lip = np.concatenate((low_lip, shape[65:68]))
    top_mean = np.mean(top_lip, axis=0)
    low_mean = np.mean(low_lip, axis=0)
    return abs(top_mean[1] - low_mean[1])

@app.route('/detect', methods=['POST'])
def detect():
    if 'frame' not in request.files:
        return jsonify({'error': 'No frame uploaded'}), 400

    file = request.files['frame']
    in_memory = io.BytesIO()
    file.save(in_memory)
    data = np.frombuffer(in_memory.getvalue(), dtype=np.uint8)
    frame = cv2.imdecode(data, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    EYE_AR_THRESH = 0.3
    YAWN_THRESH = 20

    rects = detector(gray)
    for rect in rects:
        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)

        (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
        (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]
        ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0
        yawn = lip_distance(shape)

        if ear < EYE_AR_THRESH:
            return jsonify({'status': 'Drowsiness detected', 'EAR': round(ear, 2)})

        if yawn > YAWN_THRESH:
            return jsonify({'status': 'Yawning detected', 'YAWN': round(yawn, 2)})

        return jsonify({'status': 'Normal', 'EAR': round(ear, 2), 'YAWN': round(yawn, 2)})

    return jsonify({'status': 'No face detected'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
