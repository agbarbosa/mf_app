# Docker Setup Guide

This guide explains how to run the Mentor Futuro application using Docker containers with separated backend and frontend services.

## Architecture

The Docker setup consists of three main services:

1. **Database (db)**: PostgreSQL 15 database container
2. **Application (app)**: Next.js application serving both frontend and API routes
3. **Adminer** (optional): Database management interface

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher

## Quick Start

### Production Mode

1. **Clone the repository and navigate to the project directory**

```bash
cd /path/to/mf_app
```

2. **Create environment file**

Copy the Docker environment template:

```bash
cp .env.docker .env
```

Edit `.env` and update the values, especially:
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Stripe API keys
- Other configuration values

3. **Build and start the containers**

```bash
docker-compose up -d
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Run database migrations
- Start the application server

4. **Access the application**

- **Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
  - System: PostgreSQL
  - Server: db
  - Username: postgres
  - Password: postgres
  - Database: mentor_futuro

### Development Mode

For development with hot reload:

1. **Start development containers**

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Mount your source code as a volume
- Enable hot reloading
- Install dependencies automatically
- Watch for file changes

2. **Access the application**

- **Application**: http://localhost:3000
- **Database Admin**: http://localhost:8080

## Docker Commands

### Managing Containers

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# Rebuild containers
docker-compose up -d --build

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# Access database with Prisma Studio
docker-compose exec app npx prisma studio

# Execute raw SQL
docker-compose exec db psql -U postgres -d mentor_futuro
```

### Application Management

```bash
# Access application container shell
docker-compose exec app sh

# View application logs
docker-compose logs -f app

# Restart application
docker-compose restart app
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/mentor_futuro` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |

### Stripe Configuration

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_FREE` | Stripe price ID for free plan |
| `STRIPE_PRICE_ID_PREMIUM` | Stripe price ID for premium plan |

## Volumes

The setup uses named volumes for data persistence:

- `postgres_data`: PostgreSQL database files (production)
- `postgres_data_dev`: PostgreSQL database files (development)

## Network

All services communicate through a dedicated Docker network:
- Production: `mf_network`
- Development: `mf_network_dev`

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Database connection issues

1. Ensure the database container is healthy:
```bash
docker-compose ps
```

2. Check database logs:
```bash
docker-compose logs db
```

3. Verify DATABASE_URL uses `db` as hostname (not `localhost`)

### Port conflicts

If ports 3000, 5432, or 8080 are already in use:

1. Stop conflicting services
2. Or modify `docker-compose.yml` to use different ports:
```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Permission issues

If you encounter permission errors:

```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .

# Or rebuild with correct user
docker-compose build --no-cache
```

## Production Deployment

### Security Considerations

1. **Change default passwords**: Update PostgreSQL credentials
2. **Use secrets management**: Don't commit `.env` to version control
3. **Enable HTTPS**: Use a reverse proxy (nginx/Traefik)
4. **Limit exposed ports**: Only expose necessary ports
5. **Regular updates**: Keep Docker images updated

### Recommended Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Health Checks

The database service includes health checks. To add health checks for the app:

```yaml
app:
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Multi-Stage Build Explanation

The Dockerfile uses a multi-stage build for optimization:

1. **deps**: Installs production dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates minimal runtime image

This results in a smaller final image size and improved security.

## Development Workflow

1. Make code changes (automatically detected in dev mode)
2. Test changes at http://localhost:3000
3. Run tests: `docker-compose exec app npm test`
4. Build for production: `docker-compose -f docker-compose.yml up --build`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure all required services are running
4. Check the main README.md for application-specific documentation
