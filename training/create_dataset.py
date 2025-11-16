import pandas as pd
import numpy as np

print("Generating fake dataset...")

NUM_SAMPLES = 1000

# Generate 3 "features" (our inputs)
# 1. Audio Jitter (0.0 = calm, 1.0 = very jittery)
audio_nervousness = np.random.rand(NUM_SAMPLES)

# 2. Blink Rate (avg blinks per answer)
# Normal is ~20. Nervous can be 50-60.
avg_blinks = np.random.randint(15, 60, NUM_SAMPLES)

# 3. Posture Score (0.0 = bad, 1.0 = perfect)
avg_posture = np.random.rand(NUM_SAMPLES)

# --- This is the "Magic" ---
# We create our "label" (the answer) based on rules.
# This simulates a human labeling the data.
# We'll say a person is "nervous" (1) if their audio is jittery AND they blink a lot.
blink_score = (avg_blinks - 15) / 45.0 # Scale blinks 0-1
jitter_score = audio_nervousness

# Combine them: if their combined score is > 1.2 (i.e., high on both), they are nervous.
is_nervous_label = [
    1 if (b + j) > 1.2 else 0 
    for b, j in zip(blink_score, jitter_score)
]

# Create a DataFrame
df = pd.DataFrame({
    'avg_blinks': avg_blinks,
    'avg_audio_nervousness': audio_nervousness,
    'avg_posture': avg_posture,
    'is_nervous_label': is_nervous_label # This is our "Y" (the answer)
})

# Save to a CSV file
df.to_csv('fake_interview_data.csv', index=False)

print(f"Done. Saved 1000 samples to 'fake_interview_data.csv'.")
print(f"Nervous samples: {np.sum(is_nervous_label)} / 1000")