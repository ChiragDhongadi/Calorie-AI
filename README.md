# 🔥 Calorie AI — Premium Fitness Dashboard & AI Coach

<img width="1600" height="1048" alt="Screenshot 2026-05-02 015234" src="https://github.com/user-attachments/assets/fe8d8b32-6166-45dc-b78d-f69a9c31e5c7" />


**Calorie AI** is a state-of-the-art fitness management ecosystem that combines machine learning with agentic AI. It features a high-performance React dashboard, a synchronized prediction engine, and **Calyx AI**—a stateful fitness coach powered by Groq.

---

## 🚀 Key Features

### 🧠 Prediction Engine
* **Precision Calculation**: Uses a pre-trained **XGBoost** model to predict calorie burn with high accuracy.
* **7-Feature Input**: Real-time analysis of Gender, Age, Height, Weight, Exercise Duration, Heart Rate, and Body Temperature.
* **Glassmorphic UI**: Interactive sliders and inputs designed for a premium user experience.

### 🦾 AI Vision Intake
* **Neural Meal Analysis**: Uses **Groq Llama 4 Scout Vision** to analyze food photos and extract precise calorie/macro data.
* **Frictionless Logging**: Automatically pre-fills meal logs from images with a "verify-before-save" workflow.
* **Instant Breakdown**: Provides real-time JSON extraction of Proteins, Carbs, and Fats directly from visual input.

### 🤖 Intelligent Assistant (Helper AI)
* **Real-time Retrieval**: A floating assistant that queries your **Supabase** logs to answer questions about your history.
* **Context-Aware Memory**: Remembers what you ate, how much you burned, and how close you are to your daily goals.
* **Multi-Tool Agent**: Equipped with web search, platform RAG, and database query tools for a true "Agentic" experience.

### 📊 Performance Dashboard & Database
* **Persistent Storage**: Powered by **Supabase** for secure, real-time synchronization of meal logs and activity history.
* **Modern Aesthetic**: Dark theme (`#0B0F19`) with vibrant neon accents (`#A3FF12`, `#C084FC`).
* **Atomic Updates**: Seamlessly syncs burned calories, consumed calories, and macro goals across all sessions.


---

## 🧩 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Flask (Python), LangChain, LangGraph |
| **Database** | Supabase (PostgreSQL) |
| **Vision AI** | Groq Llama 4 Scout Vision |
| **Chatbot AI** | Groq Llama 3 / 4 (Agentic Workflow) |
| **ML Model** | XGBoost (Calories Burn Regressor) |


---

## 📁 Project Structure

```bash
Calorie-AI/
├── app.py                 # Unified Flask Backend (serves React dist)
├── calorie_counter.py      # Groq Vision Engine for meal analysis
├── HelperChatModel.py     # Agentic Chatbot with Database Tools
├── FitnessChatbot.py      # AI Coach logic and stateful onboarding
├── model.pkl              # Pre-trained XGBoost model
├── requirements.txt       # Python dependencies
├── .env                   # API Keys & DB Credentials
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # Chatbot, Dashboard, Vision Modals, etc.
│   │   ├── App.jsx        # Main application logic & Auth handling
│   │   └── supabaseClient.js # Supabase connection config

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

Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
SERPER_API_KEY=your_serper_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
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
