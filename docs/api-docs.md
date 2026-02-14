# 📡 API Documentation

## Base URL
```
http://localhost:3000/api
```

All endpoints are Next.js API routes. The backend Django server runs separately on `http://localhost:8000`.

---

## Endpoints

### 1. POST `/api/gemini` — 3AM AI Chat

**Description**: Sends a user message to the Gemini 2.5 Flash model with a postpartum-care system prompt. Supports multi-turn conversation history.

**Request Body**:
```json
{
  "prompt": "I'm feeling really tired tonight",
  "chatHistory": [
    { "role": "user", "parts": [{ "text": "Hi" }] },
    { "role": "model", "parts": [{ "text": "Hello Mama..." }] }
  ]
}
```

**Success Response** (`200`):
```json
{
  "text": "That's completely normal, Mama. Your body is doing incredible work..."
}
```

**Error Response** (`429` / `500`):
```json
{
  "error": "Quota Exceeded (429)",
  "text": "I'm taking a 60-second break...",
  "debug": { "message": "RESOURCE_EXHAUSTED", "status": 429 }
}
```

---

### 2. POST `/api/nurse-vision` — Nurse AI Vision Analysis

**Description**: Accepts a base64-encoded image (from camera) and analyzes the mother's face for signs of fatigue, dehydration, or emotional distress using Gemini's multimodal capabilities.

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Success Response** (`200`):
```json
{
  "ai_insight_text": "Your eyes show moderate fatigue. Remember to stay hydrated, Mama.",
  "alert_level": "watch",
  "fatigue_score": 7,
  "hydration_check": "mild concern",
  "emotional_state": "tired but resilient"
}
```

**Error Response** (`429` / `500`):
```json
{
  "error": "Diagnostic: AI call failed",
  "ai_insight_text": "I'm having a technical hiccup...",
  "alert_level": "stable",
  "debug": { "message": "...", "status": 500 }
}
```

---

### 3. POST `/api/sentiment` — Sentiment Pulse Analysis

**Description**: Analyzes the mother's mood history (from localStorage) to generate a sentiment pulse for the family dashboard. Runs once per session to conserve API quota.

**Request Body**:
```json
{
  "history": [
    { "date": "2026-02-14", "mood": "exhausted", "pain": 6 },
    { "date": "2026-02-13", "mood": "hopeful", "pain": 3 }
  ]
}
```

**Success Response** (`200`):
```json
{
  "sentiment": "needs_support",
  "trend": "declining",
  "summary": "Mom has been experiencing increasing fatigue over the past 2 days.",
  "recommendation": "Consider offering to take the night shift tonight."
}
```

**Error Response** (`429` / `500`):
```json
{
  "error": "Quota Exceeded (429)",
  "sentiment": "stable",
  "debug": { "message": "RESOURCE_EXHAUSTED", "status": 429 }
}
```

---

## Django Backend (Port 8000)

### User Authentication
| Endpoint | Method | Description |
|---|---|---|
| `/api/register/` | POST | Register new user (mother/family) |
| `/api/login/` | POST | Login and receive JWT token |
| `/api/profile/` | GET | Get user profile |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |

## Rate Limits (Free Tier)
- **Gemini 2.5 Flash**: ~10 RPM, ~250 RPD
- Background sentiment analysis: throttled to 1 request per session
- Vision analysis: triggered only on user action (camera capture)
