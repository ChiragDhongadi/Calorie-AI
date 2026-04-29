from flask import Flask, request, jsonify, send_from_directory, session
import os
import pickle
import numpy as np
import uuid
from flask_cors import CORS
from FitnessChatbot import chat_function
from HelperChatModel import helper_chat_function

# Initialize Flask app to serve React dist
app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get('SECRET_KEY', 'calorie-ai-secret-key')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False # Set to True in production with HTTPS


# In-memory store for chat sessions (for demo purposes)
CHAT_SESSIONS = {}
HELPER_CHAT_SESSIONS = {}

# Load the model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("ML Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# --- FRONTEND ROUTES ---

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    # Check if the file exists in the static_folder
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    # Otherwise return index.html for React Router compatibility
    return send_from_directory(app.static_folder, 'index.html')

# --- API ROUTES ---

@app.route('/api/predict', methods=['POST'])
def api_predict():
    if model is None:
        return jsonify({'success': False, 'error': 'Model not loaded'}), 500
        
    try:
        data = request.json
        
        # Mapping frontend JSON names to model features
        # Features: [Gender, Age, Height, Weight, Duration, Heart_Rate, Body_Temp]
        # Gender: male=0, female=1 (per common dataset encoding)
        gender = 0 if data.get('gender') == 'male' else 1
        age = int(data.get('age'))
        height = float(data.get('height'))
        weight = float(data.get('weight'))
        duration = float(data.get('duration'))
        heart_rate = float(data.get('heart_rate'))
        body_temp = float(data.get('body_temp'))
        
        features = np.array([[gender, age, height, weight, duration, heart_rate, body_temp]])
        prediction = model.predict(features)
        
        return jsonify({
            'success': True,
            'prediction': round(float(prediction[0]), 2)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        # Establish persistent chat ID in session
        if 'chat_id' not in session:
            session['chat_id'] = str(uuid.uuid4())
        
        chat_id = session['chat_id']
        data = request.json
        user_input = data.get('message', '')
        
        # Initialize or retrieve session state
        if chat_id not in CHAT_SESSIONS:
            CHAT_SESSIONS[chat_id] = {
                'history': [],
                'user_data': {}
            }
            
        session_data = CHAT_SESSIONS[chat_id]
        
        # Call the chatbot engine
        history, user_data, _ = chat_function(
            user_input, 
            session_data['history'], 
            session_data['user_data']
        )
        
        # Update session state
        session_data['history'] = history
        session_data['user_data'] = user_data
        
        # ... rest of status message logic ...
        status_text = "Processing..."
        progress = 0
        
        if 'tracker' in user_data:
            tracker = user_data['tracker']
            progress = tracker.get_completion_percentage()
            next_q = tracker.get_next_question()
            if next_q:
                status_text = f"Information Collection: {progress}% Complete. Next: {next_q}"
            else:
                status_text = "Analysis Complete! Generating your plan..."
        
        if user_data.get('plan_generated'):
            status_text = "✅ Plan Generated! Providing details below."
        if user_data.get('plan_sent'):
            status_text = f"📧 Plan sent to {user_data.get('email', 'your email')}!"

        # Convert history tuples to role/content objects for React
        formatted_history = []
        for msg_pair in history:
            u_msg, b_msg = msg_pair
            if u_msg: formatted_history.append({'role': 'user', 'content': u_msg})
            if b_msg: formatted_history.append({'role': 'bot', 'content': b_msg})
            
        return jsonify({
            'history': formatted_history,
            'status': status_text,
            'progress': progress
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/helper-chat', methods=['POST'])
def api_helper_chat():
    try:
        if 'chat_id' not in session:
            session['chat_id'] = str(uuid.uuid4())
            
        chat_id = session['chat_id']
        data = request.json
        user_input = data.get('message', '')
        
        if chat_id not in HELPER_CHAT_SESSIONS:
            HELPER_CHAT_SESSIONS[chat_id] = {
                'history': []
            }
            
        session_data = HELPER_CHAT_SESSIONS[chat_id]
        
        user_email = "guest@example.com"
        if 'user' in session and 'email' in session['user']:
            user_email = session['user']['email']
            
        history, _ = helper_chat_function(
            user_input, 
            session_data['history'],
            user_email
        )
        
        session_data['history'] = history

        
        formatted_history = []
        for msg_pair in history:
            u_msg, b_msg = msg_pair
            if u_msg: formatted_history.append({'role': 'user', 'content': u_msg})
            if b_msg: formatted_history.append({'role': 'bot', 'content': b_msg})
            
        return jsonify({
            'history': formatted_history,
            'status': "Helper Active"
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        # Simple mock authentication for now
        # In production, use a database and hash validation
        if email and password:
            session['user'] = {
                'email': email,
                'name': email.split('@')[0].capitalize(),
                'id': str(uuid.uuid4())
            }
            return jsonify({
                'success': True,
                'user': session['user'],
                'message': 'Login successful'
            })
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user', None)
    session.pop('chat_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user', methods=['GET'])
def get_user():
    if 'user' in session:
        return jsonify({'success': True, 'user': session['user']})
    return jsonify({'success': False, 'message': 'Not authenticated'}), 401

if __name__ == "__main__":
    app.run(debug=True, port=10000, host='0.0.0.0')