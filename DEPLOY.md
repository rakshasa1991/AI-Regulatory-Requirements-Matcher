# Deployment Guide

## Quick Start with Docker

```bash
# Start database and app
docker-compose up -d

# Generate Prisma client
docker-compose exec app npx prisma generate

# Run migrations
docker-compose exec app npx prisma migrate dev --name init

# View logs
docker-compose logs -f
```

## Environment Variables

See `.env.example` for all required variables.

## Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

## Health Check

```bash
curl http://localhost:3000/api/health
```
