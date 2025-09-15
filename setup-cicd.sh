#!/bin/bash

# Quick setup script for CI/CD pipeline
echo "🚀 Setting up CI/CD Pipeline for Voting App"
echo "=========================================="
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "⚠️  kubectl is not installed. You'll need it for Kubernetes deployment."
    echo "   Visit: https://kubernetes.io/docs/tasks/tools/"
fi

echo "✅ Prerequisites check passed"
echo

# Check Docker Hub login
echo "🔍 Checking Docker Hub access..."
if docker info | grep -q "Username"; then
    CURRENT_USER=$(docker info | grep "Username" | awk '{print $2}')
    echo "✅ Logged in to Docker Hub as: $CURRENT_USER"
    
    if [ "$CURRENT_USER" != "rafiq9323" ]; then
        echo "⚠️  Current Docker user ($CURRENT_USER) doesn't match pipeline user (rafiq9323)"
        echo "   You may need to update the username in the pipeline files"
    fi
else
    echo "⚠️  Not logged in to Docker Hub"
    echo "   Run: docker login"
fi

echo

# Test build
echo "🔨 Testing Docker build..."
if docker build -t voting-app-test . > /dev/null 2>&1; then
    echo "✅ Docker build test passed"
    docker rmi voting-app-test > /dev/null 2>&1
else
    echo "❌ Docker build test failed"
    echo "   Check your Dockerfile and try: docker build -t voting-app-test ."
fi

echo

# Check GitHub secrets setup
echo "📋 GitHub Secrets Setup Required:"
echo "================================="
echo "Go to your GitHub repository settings and add these secrets:"
echo
echo "1. DOCKER_PASSWORD"
echo "   - Go to https://hub.docker.com/settings/security"
echo "   - Create a new Personal Access Token"
echo "   - Copy the token and add it as DOCKER_PASSWORD secret"
echo

# Check pipeline files
echo "📁 Pipeline Files Status:"
echo "========================"

if [ -f ".github/workflows/ci-cd.yaml" ]; then
    echo "✅ Complete CI/CD pipeline: .github/workflows/ci-cd.yaml"
else
    echo "❌ Complete CI/CD pipeline: .github/workflows/ci-cd.yaml (missing)"
fi

if [ -f ".github/workflows/docker-build.yaml" ]; then
    echo "✅ Simple Docker pipeline: .github/workflows/docker-build.yaml"
else
    echo "❌ Simple Docker pipeline: .github/workflows/docker-build.yaml (missing)"
fi

if [ -f "deploy.sh" ]; then
    echo "✅ Local deployment script: deploy.sh"
    chmod +x deploy.sh
else
    echo "❌ Local deployment script: deploy.sh (missing)"
fi

echo

# Summary
echo "🎯 Next Steps:"
echo "============="
echo "1. Set up DOCKER_PASSWORD secret in GitHub repository settings"
echo "2. Push your code to trigger the pipeline:"
echo "   git add ."
echo "   git commit -m 'Add CI/CD pipeline'"
echo "   git push origin main"
echo "3. Check GitHub Actions tab for pipeline execution"
echo "4. Your image will be available at: https://hub.docker.com/r/rafiq9323/voting-app"
echo

echo "🚀 Setup complete! Your CI/CD pipeline is ready to use."