# 🚀 CI/CD Pipeline Setup Guide

## Overview

This repository includes automated CI/CD pipelines to build, test, and deploy your Node.js Voting Application to Docker Hub and Kubernetes.

## 📋 Pipeline Files

### 1. Complete CI/CD Pipeline (`.github/workflows/ci-cd.yaml`)

- **Triggers**: Push to `main`/`develop`, Pull Requests, Manual dispatch
- **Features**: Testing, Security scanning, Multi-platform builds, Deployment notifications
- **Use Case**: Production-ready pipeline with full testing suite

### 2. Simple Docker Build (`.github/workflows/docker-build.yaml`)

- **Triggers**: Push to `main`, Manual dispatch
- **Features**: Quick Docker build and push to Docker Hub
- **Use Case**: Simple deployments without extensive testing

## 🔧 Setup Instructions

### Step 1: Configure Docker Hub Access

1. **Create Docker Hub Personal Access Token**:

   - Go to [Docker Hub Account Settings](https://hub.docker.com/settings/security)
   - Click "New Access Token"
   - Name: `github-actions-voting-app`
   - Copy the generated token

2. **Add GitHub Secrets**:

   - Go to your GitHub repository
   - Navigate to `Settings` → `Secrets and variables` → `Actions`
   - Click "New repository secret"
   - Add the following secrets:

   ```
   Name: DOCKER_PASSWORD
   Value: [Your Docker Hub Personal Access Token]
   ```

### Step 2: Verify Configuration

1. **Check Docker Hub Username**:

   - Current username in pipeline: `rafiq9323`
   - Update in pipeline files if different:
     ```yaml
     env:
       DOCKER_USERNAME: your-dockerhub-username # Change this
     ```

2. **Verify Image Name**:
   - Current image name: `voting-app`
   - Update if you want a different name:
     ```yaml
     env:
       IMAGE_NAME: your-preferred-name # Change this
     ```

## 🎯 How It Works

### Automatic Deployment (Push to main)

```bash
git add .
git commit -m "Your changes"
git push origin main
```

**What happens**:

1. 🧪 Code is tested
2. 🔐 Security scan runs
3. 🐳 Docker image is built
4. 📤 Image is pushed to Docker Hub
5. 📊 Deployment summary is generated

### Manual Deployment

```bash
# Using GitHub UI:
# Go to Actions → Select workflow → Run workflow

# Using local script:
./deploy.sh [optional-tag]
```

### Pull Request Builds

- Creates test builds with PR-specific tags
- Adds comment to PR with test instructions
- No deployment to production

## 📦 Docker Hub Integration

### Image Tags Created

- `latest` - Latest stable version (from main branch)
- `develop` - Development version (from develop branch)
- `YYYYMMDD-<sha>` - Date and commit-based tags
- `pr-<number>` - Pull request builds

### Docker Hub Repository

Your images will be available at:

```
https://hub.docker.com/r/rafiq9323/voting-app
```

## 🚀 Manual Deployment Commands

### Quick Deploy

```bash
# Build and deploy everything
npm run deploy

# Or using the script directly
./deploy.sh

# Deploy with specific tag
./deploy.sh v1.2.0
```

### Docker Commands

```bash
# Build locally
npm run docker:build

# Run locally
npm run docker:run

# Push to Docker Hub (after building)
docker push rafiq9323/voting-app:latest
```

### Kubernetes Commands

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n voting-app
kubectl get services -n voting-app

# Access the application (if using minikube)
minikube service voting-app-service -n voting-app
```

## 🔍 Monitoring & Troubleshooting

### Check Pipeline Status

- Go to GitHub repository → Actions tab
- Click on the latest workflow run
- Review logs for any errors

### Common Issues

1. **Docker push fails**:

   - Verify `DOCKER_PASSWORD` secret is set correctly
   - Check Docker Hub username in pipeline

2. **Kubernetes deployment fails**:

   - Ensure cluster is accessible
   - Check if namespaces exist
   - Verify image name matches in K8s manifests

3. **Build fails**:
   - Check Node.js dependencies
   - Verify Dockerfile syntax
   - Review build logs in Actions tab

### Debug Commands

```bash
# Check if image exists on Docker Hub
docker pull rafiq9323/voting-app:latest

# Test image locally
docker run -p 5000:5000 rafiq9323/voting-app:latest

# Check Kubernetes status
kubectl describe deployment voting-app-service -n voting-app
kubectl logs -f deployment/voting-app-service -n voting-app
```

## 🎉 Success Indicators

### Pipeline Success

- ✅ All workflow steps complete without errors
- 🐳 New image appears on Docker Hub
- 📊 GitHub Actions summary shows build details

### Kubernetes Success

- ✅ Pods are in "Running" state
- 🌐 Service is accessible via NodePort
- 🏥 Health check endpoint responds: `/health`

### Access Points

```bash
# Health check
curl http://[minikube-ip]:[node-port]/health

# Application endpoints
curl http://[minikube-ip]:[node-port]/api/users/
```

## 📚 Next Steps

1. **Add Tests**: Implement actual tests in `package.json`
2. **Add Linting**: Configure ESLint for code quality
3. **Security**: Set up Snyk or similar for vulnerability scanning
4. **Monitoring**: Add application monitoring and alerting
5. **Staging**: Create staging environment for pre-production testing

---

**🔗 Useful Links**:

- [Docker Hub Repository](https://hub.docker.com/r/rafiq9323/voting-app)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
