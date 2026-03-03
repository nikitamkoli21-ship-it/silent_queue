# ⚡ Silent Queue — AI Queue Intelligence Platform

A full-stack SaaS application that predicts queue wait times using Machine Learning and explains results using Google Gemini AI.

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, Axios |
| Backend | FastAPI, Python |
| ML Models | scikit-learn (GradientBoosting, RandomForest) |
| AI | Google Gemini 1.5 Flash |
| Styling | Custom CSS, Inter + JetBrains Mono |

---

## 📁 Project Structure

```
silent_queue/
├── silent-queue-backend/        # FastAPI ML backend
│   ├── api/
│   │   ├── routes.py            # Prediction endpoints
│   │   ├── gemini_service.py    # Gemini AI integration
│   │   ├── ai_routes.py         # AI endpoints
│   │   ├── schemas.py           # Pydantic models
│   │   ├── session.py           # Session state
│   │   └── insights.py          # Rule-based insights
│   ├── model/
│   │   ├── train.py             # ML training pipeline
│   │   └── predictor.py         # Inference class
│   ├── data/
│   │   └── generate_dataset.py  # Synthetic data generator
│   ├── main.py                  # FastAPI entry point
│   └── requirements.txt
│
└── silent-queue-frontend/       # React frontend
    └── src/
        └── App.js               # Complete single-file React app
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd silent-queue-backend

# Install dependencies
python -m pip install -r requirements.txt

# Generate training data
python data/generate_dataset.py

# Train ML models
python model/train.py

# Start server
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd silent-queue-frontend

npm install
npm start
```

Open **http://localhost:3000**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Live KPI metrics, area charts, congestion history |
| 🔮 Predict | ML-powered wait time and congestion prediction |
| ✦ Gemini AI | Plain English explanation of every prediction |
| 🎤 Voice Input | Speak queue numbers to auto-fill the form |
| 🔊 Voice Alerts | App reads prediction results aloud |
| 📋 History | Filterable prediction log with summary stats |
| 💡 Insights | AI-generated alerts and trend analysis |
| 🔄 Real-time | Dashboard auto-refreshes every 5 seconds |
| 📱 Responsive | Works on desktop and mobile |

---

## 🤖 ML Model Stack

| Model | Purpose | Performance |
|-------|---------|-------------|
| GradientBoosting Regressor | Predict wait time | MAE ~0.5 min |
| RandomForest Regressor | Predict congestion score | R² ~0.98 |
| RandomForest Classifier | Predict congestion level | Accuracy ~97% |

Training data: **5,000 synthetic records** with rush hour patterns, weekend factors, and queueing theory formulas.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run ML prediction |
| GET | `/dashboard` | Live KPI metrics |
| POST | `/ai/explain` | Gemini AI explanation |
| POST | `/ai/suggest` | Smart input suggestions |
| GET | `/ai/trend` | AI trend analysis |
| GET | `/health` | Health check |
| GET | `/docs` | Interactive Swagger UI |

---

## ⚙️ Environment Variables

Create a `.env` file in `silent-queue-backend/`:

```
GEMINI_API_KEY=your_gemini_key_here
```

Get a free key at: https://aistudio.google.com/apikey

---

## 🧠 How It Works

1. User enters queue data (length, service time, staff count)
2. FastAPI backend runs 3 ML models in parallel
3. Models return wait time, congestion score, and level
4. Gemini AI generates a plain English explanation
5. Frontend displays result with voice readout
6. History and Insights pages track patterns over time

---

## 👤 Author

**Nikita koli** — [github.com/nikitamkoli21-ship-it](https://github.com/nikitamkoli21-ship-it)
