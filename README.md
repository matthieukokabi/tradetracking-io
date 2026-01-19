# TradeTracking.io (TradeZella Killer)

High-performance trading analytics platform built with Next.js 16 and FastAPI.

## 🚀 Architecture
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind v4.
- **Backend:** FastAPI (Python 3.9), AsyncIO.
- **Database:** MongoDB (via Motor async driver).
- **Infra:** Docker Compose for unified orchestration.

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev without docker)
- Python 3.9+ (for local dev without docker)

### Running with Docker (Recommended)
This will start Frontend (3000), Backend (8000), and MongoDB (27017).

```bash
docker-compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development (Manual)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ✅ Features (MVP)
- [x] Unified Monorepo Structure
- [x] Docker Orchestration
- [x] FastAPI Health Check & CORS
- [x] Next.js 16 Foundation
- [x] Authentication (NextAuth + JWT)
- [x] Trade Import (CSV)
- [x] Dashboard Analytics
- [x] Trading Journal (Calendar View)
- [x] Reports (Equity Curve)
- [x] Advanced Filtering
- [x] Performance Optimization (MongoDB Aggregation)
