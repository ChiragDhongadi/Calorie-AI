from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key')

model = None

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)