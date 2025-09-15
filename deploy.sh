#!/bin/bash
set -e

# Configuration
NAME="voting-app"
USERNAME="rafiq9323"
IMAGE_TAG="${1:-latest}"
IMAGE="$USERNAME/$NAME:$IMAGE_TAG"
NAMESPACE="voting-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info "Starting deployment for $IMAGE"
echo

# Step 1: Build Docker image
log_info "Building Docker image..."
if docker build -t $IMAGE .; then
    log_success "Docker image built successfully"
else
    log_error "Failed to build Docker image"
    exit 1
fi

# Step 2: Push to Docker Hub
log_info "Pushing Docker image to Docker Hub..."
if docker push $IMAGE; then
    log_success "Image pushed to Docker Hub: $IMAGE"
else
    log_error "Failed to push image to Docker Hub"
    exit 1
fi

# Step 3: Create namespace if it doesn't exist
log_info "Checking namespace: $NAMESPACE"
if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
    log_info "Namespace '$NAMESPACE' already exists"
else
    log_info "Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
    log_success "Namespace '$NAMESPACE' created"
fi

# Step 4: Apply Kubernetes manifests
log_info "Applying Kubernetes manifests..."
if kubectl apply -f k8s/deployment.yml && kubectl apply -f k8s/service.yml; then
    log_success "Kubernetes manifests applied successfully"
else
    log_error "Failed to apply Kubernetes manifests"
    exit 1
fi

# Step 5: Wait for deployment to be ready
log_info "Waiting for deployment to be ready..."
if kubectl wait --for=condition=available deployment/voting-app-service -n $NAMESPACE --timeout=300s; then
    log_success "Deployment is ready"
else
    log_warning "Deployment may not be fully ready yet"
fi

echo
log_info "=== Deployment Status ==="

# Get pods
log_info "Pods:"
kubectl get pods -n $NAMESPACE

echo
# Get services
log_info "Services:"
kubectl get services -n $NAMESPACE

echo
# Get main service details
log_info "Main service details:"
if kubectl get services $NAME-service -n $NAMESPACE 2>/dev/null; then
    SERVICE_TYPE=$(kubectl get service $NAME-service -n $NAMESPACE -o jsonpath='{.spec.type}')
    if [ "$SERVICE_TYPE" = "NodePort" ]; then
        NODE_PORT=$(kubectl get service $NAME-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
        MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "localhost")
        echo
        log_success "🎉 Deployment completed successfully!"
        log_info "Access your application at: http://$MINIKUBE_IP:$NODE_PORT"
        log_info "Health check: http://$MINIKUBE_IP:$NODE_PORT/health"
    else
        log_info "Service type: $SERVICE_TYPE"
    fi
else
    log_warning "Service $NAME-service not found"
fi