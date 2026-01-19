# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within TradeTracking.io, please send an e-mail to security@tradetracking.io. All security vulnerabilities will be promptly addressed.

Please do not publicly disclose the issue until it has been addressed by the team.

## Security Measures

This application implements the following security measures:

1. **Authentication & Authorization**
   - JWT-based authentication with secure token expiration (1 hour)
   - Password strength validation (minimum 8 characters, uppercase, lowercase, numbers)
   - Bcrypt password hashing with secure salt rounds

2. **API Security**
   - CORS configuration with explicit origin whitelisting
   - Rate limiting on authentication endpoints
   - Input validation using Pydantic models
   - SQL injection prevention through MongoDB parameterized queries

3. **Frontend Security**
   - Security headers (X-Frame-Options, X-Content-Type-Options, CSP)
   - XSS protection
   - Secure session management
   - Environment-based configuration

4. **Production Requirements**
   - SECRET_KEY must be set to a cryptographically secure random value
   - ENVIRONMENT variable enforces production security checks
   - HTTPS required for production deployments
   - MongoDB connection string with authentication

## Best Practices

When deploying this application:

1. Always use HTTPS in production
2. Set strong SECRET_KEY (min 32 characters, random)
3. Configure ALLOWED_ORIGINS to match your production domain
4. Use MongoDB with authentication enabled
5. Enable rate limiting at the reverse proxy level
6. Regularly update dependencies
7. Monitor logs for suspicious activity
