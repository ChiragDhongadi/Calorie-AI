from flask import Flask, render_template, request, jsonify, session
import pickle
import numpy as np
import pandas as pd
import os
import uuid
import dotenv

# Load environment variables
dotenv.load_dotenv()

from FitnessChatbot import chat_function, UserDataTracker

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key')

model = None
# In-memory store for chat sessions
CHAT_SESSIONS = {}

def load_model():
    global model
    try:
        with open('model.pkl', 'rb') as f:
            model = pickle.load(f)
        print("Model loaded successfully!")
    except FileNotFoundError:
        print("Warning: model.pkl not found. Please upload your model file.")
        model = None
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

load_model()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        try:
            gender = request.form.get('gender')
            age = float(request.form.get('age'))
            height = float(request.form.get('height'))
            weight = float(request.form.get('weight'))
            duration = float(request.form.get('duration'))
            heart_rate = float(request.form.get('heart_rate'))
            body_temp = float(request.form.get('body_temp'))
            
            gender_encoded = 0 if gender == 'male' else 1
            
            input_features = np.array([[gender_encoded, age, height, weight, duration, heart_rate, body_temp]])
            
            if model is None:
                return render_template('predict.html', 
                                     error="Model not loaded. Please ensure model.pkl is uploaded.")
            
            prediction = model.predict(input_features)
            calories = round(prediction[0], 2)
            
            return render_template('predict.html', 
                                 prediction=calories,
                                 gender=gender.capitalize(),
                                 age=age,
                                 height=height,
                                 weight=weight,
                                 duration=duration,
                                 heart_rate=heart_rate,
                                 body_temp=body_temp)
        
        except ValueError as e:
            return render_template('predict.html', 
                                 error="Please enter valid numeric values for all fields.")
        except Exception as e:
            return render_template('predict.html', 
                                 error=f"An error occurred: {str(e)}")
    
    return render_template('predict.html')

@app.route('/chat')
def chat():
    if 'chat_id' not in session:
        session['chat_id'] = str(uuid.uuid4())
    
    # Initialize session if not exists
    chat_id = session['chat_id']
    if chat_id not in CHAT_SESSIONS:
        # Trigger the initial greeting
        history, user_data, _ = chat_function("", [], {})
        CHAT_SESSIONS[chat_id] = {
            'history': history,
            'user_data': user_data
        }
        
    return render_template('chat.html')

@app.route('/api/chat', methods=['POST'])
def api_chat():
    if 'chat_id' not in session:
        return jsonify({'error': 'No session'}), 400
        
    chat_id = session['chat_id']
    if chat_id not in CHAT_SESSIONS:
        history, user_data, _ = chat_function("", [], {})
        CHAT_SESSIONS[chat_id] = {'history': history, 'user_data': user_data}
        
    data = request.json
    message = data.get('message', '')
    
    if data.get('clear'):
        history, user_data, _ = chat_function("", [], {})
        CHAT_SESSIONS[chat_id] = {'history': history, 'user_data': user_data}
        
        formatted_history = []
        for user_msg, bot_msg in history:
            if user_msg:
                formatted_history.append({'role': 'user', 'content': user_msg})
            if bot_msg:
                formatted_history.append({'role': 'bot', 'content': bot_msg})
                
        return jsonify({
            'history': formatted_history,
            'status': 'Chat cleared! Ready to start fresh. 🚀'
        })
        
    # Process message
    history = CHAT_SESSIONS[chat_id]['history']
    user_data = CHAT_SESSIONS[chat_id]['user_data']
    
    new_history, new_user_data, _ = chat_function(message, history, user_data)
    
    # Save back to session
    CHAT_SESSIONS[chat_id]['history'] = new_history
    CHAT_SESSIONS[chat_id]['user_data'] = new_user_data
    
    # Generate status string
    if new_user_data.get("plan_sent"):
        status_html = "✅ Plan sent successfully! Check your email! 📧"
    elif new_user_data.get("plan_generated"):
        status_html = "🎯 Plan ready! Please provide your email address. 📧"
    elif new_user_data.get("email"):
        status_html = f"📧 Email saved: {new_user_data['email']} ✅"
    else:
        tracker = new_user_data.get("tracker", None)
        if tracker:
            completion = tracker.get_completion_percentage()
            status_html = f"📋 Information Collection: {completion}% Complete 🤖"
        else:
            status_html = "💬 Ready to create your personalized fitness plan! 🚀"
            
    # Send the latest bot reply (the last item in history is a tuple (-user_input-, response))
    # and we also might need to send full history. We will just send full history tuples.
    # We serialize it to strings.
    
    formatted_history = []
    for user_msg, bot_msg in new_history:
        if user_msg:
            formatted_history.append({'role': 'user', 'content': user_msg})
        if bot_msg:
            formatted_history.append({'role': 'bot', 'content': bot_msg})

    return jsonify({
        'history': formatted_history,
        'status': status_html
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
    