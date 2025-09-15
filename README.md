# Voting Application - Docker Setup

[![Docker Build & Push](https://github.com/Rafiqdevhub/Node.js_Voting_App/actions/workflows/docker-build.yaml/badge.svg)](https://github.com/Rafiqdevhub/Node.js_Voting_App/actions/workflows/docker-build.yaml)
[![Docker Hub](https://img.shields.io/docker/pulls/rafiq9323/voting-app?style=flat-square&logo=docker)](https://hub.docker.com/r/rafiq9323/voting-app)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

A modern voting application built with Node.js, Express.js, and MongoDB, featuring Docker containerization, CI/CD pipeline, and Kubernetes deployment for both development and production environments.

## 🏗️ Architecture Overview

- **Development Environment**: Uses local MongoDB container
- **Production Environment**: Uses MongoDB Cloud (Atlas) or external MongoDB service
- **Application**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Node.js](https://nodejs.org/) (version 18+) - only for local development without Docker
- [Git](https://git-scm.com/) for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd voiting_app
```

### 2. Development Environment Setup

#### Start Development Environment

```bash
# Start all services (MongoDB + App) for development
npm run dev:up

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
```

#### View Development Services

- **Application**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **MongoDB Admin (Mongo Express)**: http://localhost:8081
  - Username: `admin`
  - Password: `password123`

#### Development Test Credentials

```
Admin User:
- Email: admin@votingapp.com
- Password: admin123

Test Voters:
- Email: voter1@example.com, voter2@example.com
- Password: voter123
```

#### Stop Development Environment

```bash
npm run dev:down
```

### 3. Production Environment Setup

#### Configure Production Environment

1. Copy the production environment template:

```bash
cp .env.production .env.production.local
```

2. Edit `.env.production.local` and replace placeholders:

```bash
# Replace these with your actual MongoDB Cloud credentials
DATABASE_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/voting_db?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key
```

#### Start Production Environment

```bash
# Build and start production environment
npm run prod:build
npm run prod:up

# Or manually
docker-compose -f docker-compose.prod.yml --env-file .env.production.local up -d
```

## 📁 Project Structure

```
voiting_app/
├── src/                          # Application source code
│   ├── config/
│   │   └── dbConnection.js       # Database configuration
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Custom middleware
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── utils/                    # Utility functions
│   └── server.js                 # Application entry point
├── scripts/
│   └── init-mongo.js             # MongoDB initialization script
├── docker-compose.dev.yml        # Development Docker Compose
├── docker-compose.prod.yml       # Production Docker Compose
├── Dockerfile                    # Multi-stage Docker build
├── .env.development              # Development environment variables
├── .env.production               # Production environment template
└── package.json                  # Node.js dependencies and scripts
```

## 🔧 Available Scripts

### Development Scripts

```bash
npm run dev:up          # Start development environment
npm run dev:down        # Stop development environment
npm run dev:build       # Rebuild development containers
npm run dev:logs        # View development logs
npm run dev:clean       # Clean up development volumes and containers
```

### Production Scripts

```bash
npm run prod:up         # Start production environment
npm run prod:down       # Stop production environment
npm run prod:build      # Rebuild production containers
npm run prod:logs       # View production logs
npm run prod:clean      # Clean up production volumes and containers
npm run prod:nginx      # Start with NGINX reverse proxy
```

### Utility Scripts

```bash
npm run env:copy-dev    # Copy dev environment to .env
npm run env:copy-prod   # Copy prod environment to .env
npm run health-check    # Check application health
```

## 🌍 Environment Variables

### Development (.env.development)

```bash
NODE_ENV=development
DATABASE_URL=mongodb://admin:password123@mongodb:27017/voting_db?authSource=admin
JWT_SECRET=dev-jwt-secret-key-not-for-production
JWT_EXPIRY=30000
MONGO_DB_NAME=voting_db
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
```

### Production (.env.production)

```bash
NODE_ENV=production
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/voting_db?retryWrites=true&w=majority
JWT_SECRET={{PRODUCTION_JWT_SECRET}}
JWT_EXPIRY=3600
```

## 🔒 Security Considerations

### Development

- Uses weak credentials for convenience
- Debug logging enabled
- MongoDB admin interface exposed

### Production

- **CRITICAL**: Generate secure JWT secret: `openssl rand -base64 32`
- Use strong MongoDB credentials
- Disable debug logging
- Enable HTTPS (via NGINX proxy)
- Regular security updates

## 🗄️ Database Setup

### Development Database

- Automatically initialized with sample data
- Local MongoDB container with persistent volume
- Admin interface available via Mongo Express

### Production Database

1. Set up MongoDB Atlas or cloud provider
2. Configure network access (whitelist IPs)
3. Create database user with appropriate permissions
4. Update `DATABASE_URL` in production environment

## 📊 Monitoring and Health Checks

### Health Check Endpoints

- `GET /health` - Application health status
- `GET /ready` - Readiness probe
- `GET /metrics` - Basic application metrics

### Docker Health Checks

Both development and production containers include built-in health checks that monitor:

- Application responsiveness
- Database connectivity
- Memory usage

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs voting-mongodb-dev

# Verify connection string
echo $DATABASE_URL
```

#### Port Already in Use

```bash
# Find process using port 5000
netstat -tlnp | grep :5000

# Stop existing containers
npm run dev:clean
npm run prod:clean
```

#### Application Won't Start

```bash
# Check application logs
npm run dev:logs

# Rebuild containers
npm run dev:build
```

### Development Debugging

```bash
# Connect to running container
docker exec -it voting-app-dev sh

# View environment variables
docker exec -it voting-app-dev env

# Check MongoDB directly
docker exec -it voting-mongodb-dev mongosh -u admin -p password123 --authenticationDatabase admin
```

## 🚀 API Endpoints

### Authentication

- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login

### Candidates

- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Add candidate (Admin only)
- `PUT /api/candidates/:id` - Update candidate (Admin only)
- `DELETE /api/candidates/:id` - Delete candidate (Admin only)
- `GET /api/candidates/vote/count` - Get vote counts
- `POST /api/candidates/vote/:id` - Vote for candidate

### User Profile

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile/password` - Change password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in development environment
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🚀 CI/CD Pipeline

This project includes automated CI/CD pipelines for seamless deployment:

### Quick Deploy

```bash
# Build, push to Docker Hub, and deploy to Kubernetes
npm run deploy

# Or use the deployment script directly
./deploy.sh
```

### Pipeline Features

- **Automatic Docker builds** on push to main branch
- **Multi-platform images** (linux/amd64, linux/arm64)
- **Docker Hub integration** with automated pushing
- **Kubernetes deployment** with health checks
- **Security scanning** and testing

### Docker Hub

- **Repository**: [rafiq9323/voting-app](https://hub.docker.com/r/rafiq9323/voting-app)
- **Tags**: `latest`, `develop`, date-based tags
- **Pull command**: `docker pull rafiq9323/voting-app:latest`

### Setup CI/CD

1. Set `DOCKER_PASSWORD` secret in GitHub repository settings
2. Push to main branch to trigger pipeline
3. Check GitHub Actions for build status
4. Access your app via Kubernetes NodePort

For detailed CI/CD setup instructions, see [CI-CD-SETUP.md](CI-CD-SETUP.md).

---

**Note**: Always use strong credentials and proper security measures in production environments. The development configuration is designed for convenience and should never be used in production.
