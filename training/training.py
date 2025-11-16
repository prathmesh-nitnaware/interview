import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib # This is for saving the model

print("Loading dataset...")
try:
    df = pd.read_csv('fake_interview_data.csv')
except FileNotFoundError:
    print("Error: 'fake_interview_data.csv' not found.")
    print("Please run 'generate_fake_data.py' first!")
    exit()

# --- 1. Define our Features (X) and Label (y) ---
# We want to predict "is_nervous_label"
# using *all* our features.
features = ['avg_blinks', 'avg_audio_nervousness', 'avg_posture']
label = 'is_nervous_label'

X = df[features]
y = df[label]

# --- 2. Split the data for training and testing ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training model on {len(X_train)} samples...")

# --- 3. Create and Train the Model ---
# A RandomForest is a great "judgment" model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# --- 4. Test the Model ---
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model trained! Accuracy on test data: {acc * 100:.2f}%")

# --- 5. Save the Trained Model to a File ---
# This is the "golden" file you will move to your HP laptop.
MODEL_FILE_PATH = 'judgment_model.joblib'
joblib.dump(model, MODEL_FILE_PATH)

print(f"Model saved successfully to '{MODEL_FILE_PATH}'.")
print("You can now move this file to your 'backend/' folder.")