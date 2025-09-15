# 🐳 Docker Setup Guide for Voting App

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose available

### 1. Clone and Setup
```bash
# Navigate to your project directory
cd "D:\Web Development\ExpressJs\voiting_app"

# Copy environment file and customize
cp .env.example .env
```

### 2. Start the Application
```bash
# Start all services
docker-compose up -d

# Or start with MongoDB admin interface
docker-compose --profile admin up -d
```

### 3. Access Your Application
- **Voting App API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **MongoDB**: localhost:27017
- **Mongo Express** (if enabled): http://localhost:8081

## 📋 Available Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f voting-app
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables
Edit the `.env` file to customize:
- `JWT_SECRET`: Your JWT secret key
- `MONGO_ROOT_PASSWORD`: MongoDB password
- `PORT`: Application port (default: 3000)

### Development vs Production
- **Development**: Use `npm run dev` (with nodemon)
- **Production**: Uses `npm start` (with node)

## 🏗️ Services Overview

### voting-app
- **Port**: 3000
- **Health Check**: `/health` endpoint
- **Dependencies**: MongoDB

### mongodb
- **Port**: 27017
- **Authentication**: admin/password123 (configurable)
- **Data Persistence**: Named volumes

### mongo-express (Optional)
- **Port**: 8081
- **Profile**: `admin`
- **Usage**: Web-based MongoDB management

## 🔍 Troubleshooting

### Check Container Status
```bash
docker-compose ps
```

### View Container Logs
```bash
docker-compose logs voting-app
```

### Test API Connection
```bash
curl http://localhost:3000/health
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Application health status

### Authentication
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - User profile (requires auth)
- `PUT /api/users/profile/password` - Change password (requires auth)

### Voting
- `GET /api/candidates` - List candidates (requires auth)
- `POST /api/candidates` - Add candidate (admin only)
- `POST /api/candidates/vote/:id` - Vote for candidate (requires auth)
- `GET /api/candidates/vote/count` - Get vote results (requires auth)

## 🛡️ Security Notes

1. **Change default passwords** in `.env` file
2. **Use strong JWT_SECRET** in production
3. **Never commit** `.env` file to version control
4. **Use Docker secrets** for production deployment

## 🔄 Development Workflow

1. Make code changes
2. Rebuild container: `docker-compose up -d --build`
3. Test changes: `curl http://localhost:3000/health`
4. Check logs: `docker-compose logs -f voting-app`

Your Voting App is now fully dockerized and ready for development or deployment! 🎉