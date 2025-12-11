from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# 1. Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# 2. Connect to MongoDB Cloud
try:
    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri)
    # Ping the database to check connection
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
    
    db_name = os.getenv('DB_NAME', 'prep_ai_db')
    db = client[db_name]
    users_collection = db['users']

except Exception as e:
    print("❌ Failed to connect to MongoDB:", e)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username') # Email
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Check if user already exists in MongoDB
    if users_collection.find_one({"email": username}):
        return jsonify({"error": "User already exists"}), 409

    # Insert new user
    new_user = {
        "email": username,
        "password": password, # In a real app, you should Hash this!
        "role": "candidate",
        "createdAt": "today" 
    }
    users_collection.insert_one(new_user)
    
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Find user in MongoDB
    user = users_collection.find_one({"email": username})

    if user and user['password'] == password:
        return jsonify({
            "message": "Login successful",
            "user": {
                "name": username.split('@')[0],
                "email": username
            }
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"message": "Backend is running with MongoDB!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)