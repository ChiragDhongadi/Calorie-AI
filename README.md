# 🔥 Calorie AI — Calories Burnt Prediction App

👇 **Click the below badge to view the live Calorie Prediction App Demo**

[![Render App](https://img.shields.io/badge/Render-Live_App-blue?logo=render&logoColor=white)](https://calorie-ai-ua9s.onrender.com)

A simple **Flask web app** that predicts the number of calories burnt during physical activity based on user inputs like gender, age, height, weight, heart rate, duration, and body temperature.  
The model is trained using **XGBoost** and deployed on **Render**.

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/dc7af3b1-b368-4f25-9f9a-747cc5a42a2c"
    alt="Calorie AI Home Page"
    width="48%"
  />
  <img
    src="https://github.com/user-attachments/assets/9e796d58-edeb-4851-adda-bebad2f58666"
    alt="Calorie AI Prediction Page"
    width="48%"
  />
</p>

---

## 🚀 Features
- 🧠 Machine Learning model (`model.pkl`) for calorie prediction  
- 🌐 Interactive and responsive web UI built with HTML + CSS  
- ⚡ Flask backend for real-time predictions  
- ☁️ Ready for deployment on **Render** or local testing  
- 💾 Simple form-based user input with error handling  

---

## 🧩 Tech Stack
| Component | Technology |
|------------|-------------|
| Frontend | HTML5, CSS3 (static templates) |
| Backend | Flask (Python) |
| ML Model | XGBoost |
| Deployment | Render Cloud |
| Language | Python 3.10+ |

---

## 📁 Project Structure
```

Calorie-AI/
├── app.py                 # Flask main application
├── model.pkl              # Pre-trained XGBoost model
├── requirements.txt       # Python dependencies
├── Procfile               # Render start command
├── templates/
│   ├── index.html         # Home page (input form)
│   └── predict.html       # Prediction result page
└── static/
└── style.css          # Custom styling

````

---

## ⚙️ Installation & Local Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ChiragDhongadi/Calorie-AI.git
cd Calorie-AI
````

### 2️⃣ Create a Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate    # On Windows
# source venv/bin/activate  # On macOS/Linux
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run the Flask App

```bash
python app.py
```

### 5️⃣ Access the App

Visit [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## ☁️ Deploying to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set these configurations:

| Setting            | Value                             |
| ------------------ | --------------------------------- |
| **Build Command**  | `pip install -r requirements.txt` |
| **Start Command**  | `gunicorn app:app`                |
| **Python Version** | `3.10`                            |
| **Root Directory** | `/`                               |

✅ Once deployed, Render will automatically build and host your app!

---

## 🧠 Model Information

The included model (`model.pkl`) is trained using **XGBoost Regressor** on a fitness dataset.
It predicts **calories burnt (kcal)** using features:

* Gender
* Age
* Height (cm)
* Weight (kg)
* Duration (min)
* Heart Rate
* Body Temperature (°C)

---

## 🧑‍💻 Author

**[Chirag Dhongadi](https://github.com/ChiragDhongadi)**
Built as part of the **Calorie AI** project for Machine Learning practice and deployment.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---

### ⭐ If you like this project, give it a star on GitHub!


