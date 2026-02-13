# Bloom: Postpartum AI Support Platform

Bloom is a comprehensive digital companion designed to support mothers and their families during the critical fourth trimester. It combines AI-driven health monitoring with an anonymous community space and intelligent alerts.

## 🌟 Key Features

### Mother Mode
- **Daily Dashboard**: Personalized check-ins with random supportive affirmations.
- **Nurse AI Health Vision**: Visual AI analysis of physical symptoms (e.g., C-section healing, breastfeeding concerns) using Gemini Pro Vision.
- **Anonymous Community Forum**: Safe space to share, like, and reply anonymously to other mothers.
- **Recovery Tracker**: Comprehensive tool to monitor physical and mental wellbeing.
- **3AM AI Chat**: A 24/7 AI companion for middle-of-the-night support.

### Family Mode
- **Bloom Circle Dashboard**: Real-time alerts and awareness for support partners.
- **Smart Alerts**: Logic-driven alerts for physical pain, mood dips, and vital symptoms.
- **Care Guide & Checklist**: Actionable steps for support partners to help the mother thrive.
- **SOS Monitoring**: Passive monitoring for silent distress signals.

## 🏗️ Architecture

- **Frontend**: [Next.js](https://nextjs.org/) (React, Tailwind CSS, Framer Motion)
- **Backend**: [Django REST Framework](https://www.django-rest-framework.org/) (SQLite, SimpleJWT)
- **AI Integration**: [Google Gemini Pro Vision](https://ai.google.dev/) for health analysis and chat.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) for Mother Mode or [http://localhost:3000/family](http://localhost:3000/family) for Family Mode.

## 🔒 Security
Bloom uses JWT-based authentication to separate Mother and Family access, ensuring privacy and focused support.
