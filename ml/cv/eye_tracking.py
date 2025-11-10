import cv2
import numpy as np

# --- Landnmark constants for eyes ---
# These are the specific landmark indices for MediaPipe Face Mesh
LEFT_EYE_LANDMARKS = [362, 382, 381, 380, 373, 374, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
RIGHT_EYE_LANDMARKS = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
EAR_THRESHOLD = 0.2 # Eye Aspect Ratio threshold for blink

def get_head_pose(frame, landmarks):
    """
    Calculates the 3D head pose from 2D facial landmarks.
    Returns: (x, y, z) rotation angles
    """
    frame_h, frame_w, _ = frame.shape
    
    focal_length = frame_w
    center = (frame_w / 2, frame_h / 2)
    cam_matrix = np.array(
        [[focal_length, 0, center[0]], [0, focal_length, center[1]], [0, 0, 1]],
        dtype=np.float64,
    )
    
    dist_coeffs = np.zeros((4, 1), dtype=np.float64)

    model_points = np.array([
        (0.0, 0.0, 0.0),      # 1: Nose tip
        (0.0, -330.0, -65.0), # 152: Chin
        (-225.0, 170.0, -135.0), # 33: Left eye left corner
        (225.0, 170.0, -135.0),  # 263: Right eye right corner
        (-150.0, -150.0, -125.0), # 61: Left mouth corner
        (150.0, -150.0, -125.0),  # 291: Right mouth corner
    ])

    image_points = np.array([
        (landmarks[1].x * frame_w, landmarks[1].y * frame_h),
        (landmarks[152].x * frame_w, landmarks[152].y * frame_h),
        (landmarks[33].x * frame_w, landmarks[33].y * frame_h),
        (landmarks[263].x * frame_w, landmarks[263].y * frame_h),
        (landmarks[61].x * frame_w, landmarks[61].y * frame_h),
        (landmarks[291].x * frame_w, landmarks[291].y * frame_h),
    ], dtype=np.float64)

    try:
        (success, rot_vec, trans_vec) = cv2.solvePnP(
            model_points, image_points, cam_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
        )

        (nose_end_point_2D, _) = cv2.projectPoints(
            np.array([(0.0, 0.0, 1000.0)]), rot_vec, trans_vec, cam_matrix, dist_coeffs
        )

        rot_mat, _ = cv2.Rodrigues(rot_vec)
        sy = np.sqrt(rot_mat[0, 0] * rot_mat[0, 0] + rot_mat[1, 0] * rot_mat[1, 0])
        singular = sy < 1e-6
        if not singular:
            x = np.arctan2(rot_mat[2, 1], rot_mat[2, 2])
            y = np.arctan2(-rot_mat[2, 0], sy)
            z = np.arctan2(rot_mat[1, 0], rot_mat[0, 0])
        else:
            x = np.arctan2(-rot_mat[1, 2], rot_mat[1, 1])
            y = np.arctan2(-rot_mat[2, 0], sy)
            z = 0
            
        x_angle, y_angle, z_angle = np.degrees([x, y, z])
        
        return y_angle, x_angle, (int(image_points[0][0]), int(image_points[0][1])), (int(nose_end_point_2D[0][0][0]), int(nose_end_point_2D[0][0][1]))

    except Exception as e:
        return 0, 0, None, None

def is_looking_at_camera(x_angle, y_angle, threshold=15):
    """
    Check if the user is looking at the camera based on head angles.
    """
    return abs(y_angle) < threshold and abs(x_angle) < (threshold + 5)

# --- NEW BLINK DETECTION FUNCTIONS ---

def get_eye_aspect_ratio(eye_landmarks, frame_shape):
    """
    Calculates the Eye Aspect Ratio (EAR) for a single eye.
    """
    h, w, _ = frame_shape
    
    # Get 2D coordinates
    # We need to use the raw landmarks, not the pre-selected ones
    coords_list = []
    for lm in eye_landmarks:
        coords_list.append((lm.x * w, lm.y * h))
    coords = np.array(coords_list)
    
    # Get vertical distances
    # A = distance(P2, P6), B = distance(P3, P5)
    # Using indices from the landmark list
    A = np.linalg.norm(coords[1] - coords[14]) # 382 -> 385
    B = np.linalg.norm(coords[2] - coords[13]) # 381 -> 386
    
    # Get horizontal distance
    # C = distance(P1, P4)
    C = np.linalg.norm(coords[0] - coords[8]) # 362 -> 263 (for left eye)
    
    # Calculate EAR
    ear = (A + B) / (2.0 * C)
    return ear

def is_blinking(landmarks, frame_shape):
    """
    Checks if the user is blinking by averaging the EAR of both eyes.
    `landmarks` is the full list of 478 landmarks.
    """
    try:
        # Get landmarks for left eye (using indices from the full 478 list)
        left_eye_coords = [landmarks[i] for i in LEFT_EYE_LANDMARKS]
        left_ear = get_eye_aspect_ratio(left_eye_coords, frame_shape)
        
        # Get landmarks for right eye
        right_eye_coords = [landmarks[i] for i in RIGHT_EYE_LANDMARKS]
        right_ear = get_eye_aspect_ratio(right_eye_coords, frame_shape)
        
        # Average EAR
        avg_ear = (left_ear + right_ear) / 2.0
        
        # Check if below threshold
        return avg_ear < EAR_THRESHOLD
        
    except Exception as e:
        # print(f"Error calculating blink: {e}")
        return False