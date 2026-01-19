# TradeTracking.io (TradeZella Killer)

High-performance trading analytics platform built with Next.js 16 and FastAPI. A modern, production-ready alternative to TradeZella with advanced filtering, real-time analytics, and enterprise-grade security.

## Features

- Real-time trading dashboard with P&L analytics
- Advanced trade filtering and search
- CSV trade import with intelligent column mapping
- Daily journal with calendar view
- Equity curve visualization
- Secure authentication with JWT
- Production-hardened security

## Tech Stack

### Frontend
- **Next.js 16** (App Router) with React 19
- **Tailwind CSS v4** for styling
- **NextAuth.js** for authentication
- **Recharts** for data visualization
- **TypeScript** for type safety

### Backend
- **FastAPI** (Python 3.9) with AsyncIO
- **MongoDB** with Motor async driver
- **JWT** authentication with bcrypt
- **Pydantic** for data validation
- **Pandas** for CSV processing

### Infrastructure
- **Docker Compose** for local development
- **Vercel** deployment ready (frontend)
- **Railway/Render** compatible (backend)
- **MongoDB Atlas** ready

## Quick Start

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- Python 3.9+ (see `.python-version`)
- MongoDB 5.0+
- Docker & Docker Compose (optional, recommended)

### Running with Docker (Recommended)

This will start the frontend (port 3000), backend (port 8000), and MongoDB (port 27017):

```bash
docker-compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development (Manual)

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection and SECRET_KEY

# Run server
uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL and NextAuth settings

# Run development server
npm run dev
```

## Environment Configuration

### Backend (.env)

```bash
MONGODB_URL=mongodb://localhost:27017
ALLOWED_ORIGINS=http://localhost:3000
SECRET_KEY=your-super-secret-key-change-in-production
ENVIRONMENT=development  # Set to 'production' when deploying
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

## Security Features

### Authentication
- JWT tokens with 1-hour expiration
- Bcrypt password hashing with secure salt rounds
- Password strength validation (min 8 chars, uppercase, lowercase, numbers)
- Environment-based SECRET_KEY validation (fails in production if not set)

### API Security
- CORS with explicit origin whitelisting
- Request validation using Pydantic models
- MongoDB parameterized queries (injection prevention)
- Secure session management

### Frontend Security
- Security headers (X-Frame-Options, CSP, X-Content-Type-Options)
- XSS protection
- HTTPS enforcement in production
- Referrer policy configuration

## API Documentation

Once the backend is running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API documentation (Swagger UI).

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/token` - Login (OAuth2 password flow)
- `GET /api/v1/dashboard/stats` - Dashboard analytics
- `GET /api/v1/journal/stats` - Daily journal statistics
- `GET /api/v1/reports/equity` - Equity curve data
- `POST /api/v1/trades/import` - CSV import
- `GET /api/v1/trades` - List trades with filtering
- `POST /api/v1/trades` - Create trade
- `PUT /api/v1/trades/{id}` - Update trade
- `DELETE /api/v1/trades/{id}` - Delete trade

## CSV Import Format

The application supports flexible CSV formats with intelligent column mapping. Supported column names:

- **Symbol:** symbol, ticker, pair, instrument
- **Side:** side, type, direction, action (BUY/SELL)
- **Quantity:** quantity, qty, size, amount, volume
- **Price:** price, entry price, avg price, fill price
- **Time:** time, date, entry time, timestamp, open time

Example CSV:

```csv
symbol,side,quantity,price,time
AAPL,BUY,100,150.25,2026-01-15 09:30:00
TSLA,SELL,50,245.50,2026-01-15 14:20:00
```

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

Environment variables to set in Vercel:
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXTAUTH_URL` - Your frontend URL
- `NEXTAUTH_SECRET` - Random secure string

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URL` - MongoDB Atlas connection string
   - `SECRET_KEY` - Cryptographically secure random string (min 32 chars)
   - `ALLOWED_ORIGINS` - Your frontend URL
   - `ENVIRONMENT=production`
3. Deploy from `backend/` directory

### MongoDB (Atlas)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your application IPs
4. Copy connection string to `MONGODB_URL`

## Project Structure

```
tradezella-killer/
├── backend/
│   ├── main.py              # FastAPI routes and endpoints
│   ├── auth.py              # Authentication & password validation
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models
│   ├── schemas.py           # Response schemas
│   ├── indexes.py           # Database indexes
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/           # Auth pages (login, register)
│   │   ├── dashboard/      # Dashboard page
│   │   ├── journal/        # Trading journal
│   │   ├── reports/        # Reports and analytics
│   │   └── api/            # API routes (NextAuth)
│   ├── components/          # React components
│   │   ├── Dashboard.tsx   # Dashboard component
│   │   ├── Journal.tsx     # Journal component
│   │   ├── EquityCurve.tsx # Equity curve chart
│   │   └── TradeList.tsx   # Trade list table
│   ├── lib/                # Utilities
│   │   └── api.ts          # API client
│   ├── types/              # TypeScript types
│   ├── next.config.ts      # Next.js configuration
│   └── tailwind.config.ts  # Tailwind configuration
├── docker-compose.yml       # Docker orchestration
├── LICENSE                  # MIT License
├── SECURITY.md             # Security policy
├── CONTRIBUTING.md         # Contribution guidelines
├── .dockerignore           # Docker ignore file
├── .nvmrc                  # Node version (20)
├── .python-version         # Python version (3.9)
└── README.md               # This file
```

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and test locally

3. Run tests:
   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && npm test
   ```

4. Commit with descriptive messages:
   ```bash
   git commit -m "Add feature: description"
   ```

5. Push and create a Pull Request

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development setup
- Coding standards
- Pull request process

## Security

For security concerns, please see [SECURITY.md](SECURITY.md) or email security@tradetracking.io.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Real-time trade notifications
- [ ] Advanced charting with TradingView integration
- [ ] Multi-account support
- [ ] Mobile app (React Native)
- [ ] Broker integrations (TD Ameritrade, Interactive Brokers)
- [ ] AI-powered trade analysis
- [ ] Social trading features
- [ ] Advanced risk management tools

## Support

- Documentation: [http://docs.tradetracking.io](http://docs.tradetracking.io)
- Issues: [GitHub Issues](https://github.com/yourusername/tradezella-killer/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/tradezella-killer/discussions)

## Acknowledgments

Built with inspiration from TradeZella, designed to be faster, more secure, and fully open-source.

---

Made with passion by the TradeTracking.io team
