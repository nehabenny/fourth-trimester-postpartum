# 🏗️ Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Frontend - Next.js 16 + React"
        LP["🏠 Landing Page<br/>Role Selection"]
        
        subgraph "🤱 Mother's Sanctuary"
            MD["Daily Check-In<br/>Mood & Pain Logging"]
            MC["📷 Nurse AI Vision<br/>CameraCapture.tsx"]
            MA["💬 3AM AI Chat<br/>AiChat.tsx"]
        end
        
        subgraph "🛡️ Family Circle"
            FA["🚨 Smart Alerts<br/>SmartAlerts.tsx"]
            FR["📋 Reminders<br/>Send Encouragement"]
            FS["💗 Sentiment Pulse<br/>Background Analysis"]
        end
    end

    subgraph "API Layer - Next.js API Routes"
        AG["/api/gemini<br/>Chat Endpoint"]
        AN["/api/nurse-vision<br/>Vision Analysis"]
        AS["/api/sentiment<br/>Sentiment Analysis"]
    end

    subgraph "Backend - Django REST"
        DJ["Django Server<br/>User Auth & Profiles"]
        DB["SQLite<br/>User Data"]
    end

    subgraph "External Services"
        GEM["🤖 Google Gemini 2.5 Flash<br/>@google/genai SDK"]
        SB["☁️ Supabase<br/>Cloud Auth & Storage"]
    end

    subgraph "Client Storage"
        LS["📦 localStorage<br/>Mood Logs, Breathing,<br/>Session State"]
        SS["🔒 sessionStorage<br/>Throttle Guards"]
    end

    LP --> MD & MC & MA & FA & FR & FS

    MA -- "POST /api/gemini" --> AG
    MC -- "POST /api/nurse-vision" --> AN
    FA -- "POST /api/sentiment" --> AS

    AG -- "generateContent()" --> GEM
    AN -- "generateContent()<br/>+ Image Data" --> GEM
    AS -- "generateContent()" --> GEM

    MD -- "Save/Load" --> LS
    FA -- "Read Mood Data" --> LS
    FA -- "Throttle Check" --> SS

    LP --> DJ
    DJ --> DB
    LP --> SB

    FR -- "Encouragement<br/>Notification" --> MD

    style GEM fill:#4285F4,color:#fff
    style SB fill:#3ECF8E,color:#fff
    style LP fill:#F8BBD0,color:#333
    style DB fill:#FFF3E0,color:#333
```

## Data Flow Summary

| Flow | From | To | Method |
|---|---|---|---|
| Chat Message | Mother → AiChat | `/api/gemini` → Gemini | POST |
| Face Analysis | Mother → Camera | `/api/nurse-vision` → Gemini (Vision) | POST |
| Sentiment Check | Family → SmartAlerts | `/api/sentiment` → Gemini | POST |
| Mood Sync | Mother → localStorage | Family Dashboard | Client-side read |
| Encouragement | Family → Reminders | Mother Dashboard | localStorage write |
| Auth | Both Dashboards | Django/Supabase | POST |

## Security Notes
- API keys stored server-side only (`.env.local`)
- Image data processed in-memory, never persisted
- Mood logs stored client-side in localStorage
- Session throttling prevents quota abuse
