# Contributing to TradeTracking.io

Thank you for considering contributing to TradeTracking.io! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node/Python versions)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed feature
- Why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit your changes with clear, descriptive messages
6. Push to your fork
7. Create a Pull Request

## Development Setup

### Prerequisites

- Node.js 20+
- Python 3.9+
- MongoDB 5.0+
- Docker & Docker Compose (optional)

### Local Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/tradezella-killer.git
   cd tradezella-killer
   ```

2. Backend setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Frontend setup:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Run with Docker (recommended):
   ```bash
   docker-compose up --build
   ```

## Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Maximum line length: 100 characters
- Use async/await for asynchronous operations

### TypeScript (Frontend)

- Follow TypeScript best practices
- Use ESLint and Prettier for formatting
- Prefer functional components with hooks
- Use TypeScript strict mode
- Write meaningful component and variable names

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests where applicable

Example:
```
Add password strength validation

- Implement validate_password_strength function
- Add validation to registration endpoint
- Update tests for password validation

Fixes #123
```

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Project Structure

```
tradezella-killer/
├── backend/           # FastAPI application
│   ├── main.py       # API routes
│   ├── auth.py       # Authentication logic
│   ├── models.py     # Pydantic models
│   └── database.py   # MongoDB connection
├── frontend/         # Next.js application
│   ├── app/         # App Router pages
│   ├── components/  # React components
│   └── lib/         # Utilities and API client
└── docker-compose.yml
```

## Questions?

Feel free to open an issue with the tag `question` if you need help or clarification.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
