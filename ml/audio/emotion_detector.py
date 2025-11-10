import numpy as np
import librosa
import soundfile as sf
import io

def analyze_audio_features(audio_data, sample_rate):
    """
    Analyzes raw audio data for confidence, nervousness, and fluency
    using the Librosa library.
    """
    try:
        # 1. Confidence (from Vocal Energy)
        # We use Root-Mean-Square (RMS) energy
        rms_energy = librosa.feature.rms(y=audio_data)[0]
        avg_energy = np.mean(rms_energy)
        # Normalize: A simple threshold - quiet is < 0.01, loud is > 0.1
        confidence_score = (np.clip(avg_energy, 0.01, 0.1) - 0.01) / (0.1 - 0.01)

        # 2. Nervousness (from Pitch Variation)
        # We use the YIN algorithm to detect pitch (f0)
        f0, voiced_flag, voiced_probs = librosa.pyin(audio_data, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        
        # Get only the pitches where the sound is "voiced"
        voiced_f0 = f0[voiced_flag]
        
        if len(voiced_f0) > 0:
            pitch_std_dev = np.std(voiced_f0)
            # Normalize: High variation (>20) might mean nervousness/jitter
            nervousness_score = np.clip(pitch_std_dev / 20.0, 0.0, 1.0)
        else:
            nervousness_score = 0.5 # Neutral if no speech detected

        # 3. Fluency (from Speech-to-Silence Ratio)
        # Split the audio into "speech" and "silence" parts
        # top_db=30 means anything 30dB below the max is considered silence
        clips = librosa.effects.split(audio_data, top_db=30)
        
        total_samples = len(audio_data)
        speech_samples = 0
        for (start, end) in clips:
            speech_samples += (end - start)
            
        fluency_score = (speech_samples / total_samples) if total_samples > 0 else 0.0
        
        # If fluency is very low, it might be an error, set neutral
        if fluency_score < 0.1:
            fluency_score = 0.5 
            nervousness_score = 0.5
            confidence_score = 0.5

        return {
            "confidence": float(confidence_score),
            "nervousness": float(nervousness_score),
            "fluency": float(fluency_score)
        }

    except Exception as e:
        # print(f"Error in audio analysis: {e}")
        return {"confidence": 0.5, "nervousness": 0.5, "fluency": 0.5}