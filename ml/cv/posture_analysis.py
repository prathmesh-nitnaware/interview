import mediapipe as mp
import numpy as np

# We must use the 'mp_pose' object, so we'll import it
mp_pose = mp.solutions.pose

def calculate_posture_score(landmarks):
    """
    Calculate posture score based on shoulder and spine alignment.
    Returns: Posture score (0 to 1, where 1 is ideal posture).
    """
    try:
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

        VISIBILITY_THRESHOLD = 0.4 
        
        if not (left_shoulder.visibility > VISIBILITY_THRESHOLD and 
                right_shoulder.visibility > VISIBILITY_THRESHOLD and
                left_hip.visibility > VISIBILITY_THRESHOLD and 
                right_hip.visibility > VISIBILITY_THRESHOLD):
            
            return 0.5 # Neutral score if key landmarks aren't visible

        shoulder_angle = np.degrees(
            np.arctan2(right_shoulder.y - left_shoulder.y, right_shoulder.x - left_shoulder.x)
        )
        hip_angle = np.degrees(
            np.arctan2(right_hip.y - left_hip.y, right_hip.x - left_hip.x)
        )

        shoulder_score = 1.0 - min(abs(shoulder_angle) / 30, 1.0)
        hip_score = 1.0 - min(abs(hip_angle) / 20, 1.0)
        
        posture_score = (shoulder_score + hip_score) / 2.0
        return posture_score
        
    except Exception as e:
        # print(f"Error in posture calculation: {e}")
        return 0.5 # Return neutral score on error