# 🔥 Calorie AI — Premium Fitness Dashboard & AI Coach

![Calorie AI Header](https://github.com/user-attachments/assets/dc7af3b1-b368-4f25-9f9a-747cc5a42a2c)

**Calorie AI** is a state-of-the-art fitness management ecosystem that combines machine learning with agentic AI. It features a high-performance React dashboard, a synchronized metabolic prediction engine, and **Calyx AI**—a stateful fitness coach powered by Groq.

---

## 🚀 Key Features

### 🧠 Metabolic Prediction Engine
* **Precision Calculation**: Uses a pre-trained **XGBoost** model to predict calorie burn with high accuracy.
* **7-Feature Input**: Real-time analysis of Gender, Age, Height, Weight, Exercise Duration, Heart Rate, and Body Temperature.
* **Glassmorphic UI**: Interactive sliders and inputs designed for a premium user experience.

### 🤖 Calyx AI — Intelligent Fitness Coach
* **Stateful Onboarding**: A backend-driven 10-step data collection flow to build your personal metabolic profile.
* **Dynamic Intelligence**: Powered by **Groq API** for near-instantaneous responses and fitness plan generation.
* **Context-Aware**: Remembers your goals, dietary preferences, and physical constraints throughout the session.

### 📊 Performance Dashboard
* **Modern Aesthetic**: Dark theme (`#0B0F19`) with vibrant neon accents (`#A3FF12`, `#C084FC`).
* **Real-time Synchronization**: Frontend and backend are perfectly synced via a unified Flask-React architecture.
* **Responsive Design**: Optimized for desktop and mobile viewing with smooth **Framer Motion** animations.

---

## 🧩 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Flask (Python), Flask-CORS |
| **AI Engine** | Groq API (Llama 3), FitnessChatbot Logic |
| **ML Model** | XGBoost (Regressor) |
| **State Management** | React Hooks (useState, useEffect, useRef) |

---

## 📁 Project Structure

```bash
Calorie-AI/
├── app.py                 # Unified Flask Backend (serves React dist)
├── FitnessChatbot.py      # AI Coach logic and state management
├── model.pkl              # Pre-trained XGBoost model
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (Groq API Key)
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # CoachView, Prediction, Dashboard, etc.
│   │   ├── App.jsx        # Main application logic & API routing
│   │   └── index.css      # Design system and Tailwind config
│   ├── dist/              # Production build (served by Flask)
│   └── vite.config.js     # Frontend build configuration
└── templates/             # Legacy HTML templates
```

---

## ⚙️ Installation & Local Setup

### 1️⃣ Clone and Prepare
```bash
git clone https://github.com/ChiragDhongadi/Calorie-AI.git
cd Calorie-AI
```

### 2️⃣ Backend Setup
Create a virtual environment and install dependencies:
```bash
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
```

### 3️⃣ Environment Variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4️⃣ Frontend Setup
Install Node dependencies and build the production assets:
```bash
cd frontend
npm install
npm run build
cd ..
```

### 5️⃣ Run the Unified App
```bash
python app.py
```
Visit **[http://localhost:10000](http://localhost:10000)** to access the full dashboard.

---

## 🧠 AI Onboarding Flow
Calyx AI follows a strict data collection protocol to ensure your fitness plans are scientifically sound:
1. **Goal Identification** (Weight loss, Muscle gain, etc.)
2. **Age & Gender Verification**
3. **Physical Metrics** (Height/Weight)
4. **Activity Levels**
5. **Dietary Preferences & Allergies**
6. **Plan Generation**

---

## 🧑‍💻 Author
**[Chirag Dhongadi](https://github.com/ChiragDhongadi)**

Built with ❤️ for the fitness and AI community. 

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).

### ⭐ If you like this project, give it a star on GitHub!
