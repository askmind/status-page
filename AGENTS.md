# Project instructions

## Goal
Build a simple self-hosted web app for hobby use.

## Tech stack
- Next.js / React
- TypeScript
- Tailwind CSS
- PostgreSQL or SQLite
- Docker for deployment

## Rules
- Keep the app simple and maintainable.
- Prefer boring, well-documented solutions.
- Add comments only where useful.
- Use environment variables for secrets.
- Never hardcode API keys.
- Before finishing, run:
  - npm run lint
  - npm run build
  - npm test, if tests exist

## Deployment
The app should be self-hostable with Docker Compose.
Include or update:
- README.md
- .env.example
- docker-compose.yml