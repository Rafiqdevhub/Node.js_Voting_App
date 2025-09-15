#!/bin/bash

# Kubernetes Deployment Script for Voting Application
# Usage: ./deploy.sh [environment] [namespace]
# Example: ./deploy.sh production voting-app

set -e

# Default values
ENVIRONMENT=${1:-staging}
NAMESPACE=${2:-voting-app}
IMAGE_TAG=${3:-latest}
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

# Color codes for output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate prerequisites
validate_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command_exists kubectl; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! command_exists docker; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_error "Cannot connect to Kubernetes cluster. Check your kubeconfig."
        exit 1
    fi
    
    log_success "Prerequisites validated"
}

# Function to create namespace if it doesn't exist
create_namespace() {
    log_info "Checking namespace: $NAMESPACE"
    
    if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        log_info "Namespace '$NAMESPACE' already exists"
    else
        log_info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
        log_success "Namespace '$NAMESPACE' created"
    fi
}

# Function to apply Kubernetes manifests
apply_manifests() {
    log_info "Applying Kubernetes manifests..."
    
    # Update image tag in deployment manifest
    if [[ "$IMAGE_TAG" != "latest" ]]; then
        log_info "Updating image tag to: $IMAGE_TAG"
        sed -i.bak "s|your-registry/voting-app:latest|$IMAGE_TAG|g" "$PROJECT_ROOT/k8s/05-voting-app.yaml"
    fi
    
    # Apply manifests in order
    local manifests=(
        "01-namespace.yaml"
        "02-configmap.yaml"
        "03-secrets.yaml"
        "04-mongodb.yaml"
        "05-voting-app.yaml"
        "06-ingress.yaml"
    )
    
    for manifest in "${manifests[@]}"; do
        local manifest_path="$PROJECT_ROOT/k8s/$manifest"
        if [[ -f "$manifest_path" ]]; then
            log_info "Applying $manifest..."
            kubectl apply -f "$manifest_path" -n "$NAMESPACE"
        else
            log_warning "Manifest not found: $manifest_path"
        fi
    done
    
    log_success "Manifests applied successfully"
}

# Function to wait for deployments to be ready
wait_for_deployments() {
    log_info "Waiting for deployments to be ready..."
    
    # Wait for MongoDB StatefulSet
    log_info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=mongodb -n "$NAMESPACE" --timeout=300s
    
    # Wait for Voting App Deployment
    log_info "Waiting for Voting App to be ready..."
    kubectl wait --for=condition=available deployment/voting-app -n "$NAMESPACE" --timeout=300s
    
    log_success "All deployments are ready"
}

# Function to perform health checks
health_check() {
    log_info "Performing health checks..."
    
    # Get service information
    local service_ip=$(kubectl get service voting-app-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    local service_hostname=$(kubectl get service voting-app-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [[ -n "$service_ip" ]]; then
        local health_url="http://$service_ip/health"
    elif [[ -n "$service_hostname" ]]; then
        local health_url="http://$service_hostname/health"
    else
        log_warning "LoadBalancer service not available, using port-forward for health check"
        kubectl port-forward service/voting-app-service 8080:80 -n "$NAMESPACE" &
        local port_forward_pid=$!
        sleep 5
        local health_url="http://localhost:8080/health"
    fi
    
    log_info "Health check URL: $health_url"
    
    # Perform health check with retries
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        if curl -f -s "$health_url" >/dev/null 2>&1; then
            log_success "Health check passed!"
            if [[ -n "${port_forward_pid:-}" ]]; then
                kill $port_forward_pid 2>/dev/null || true
            fi
            return 0
        else
            log_warning "Health check failed, retrying in 10 seconds..."
            sleep 10
            ((attempt++))
        fi
    done
    
    log_error "Health check failed after $max_attempts attempts"
    if [[ -n "${port_forward_pid:-}" ]]; then
        kill $port_forward_pid 2>/dev/null || true
    fi
    return 1
}

# Function to display deployment status
show_status() {
    log_info "Deployment Status:"
    echo
    
    log_info "Pods:"
    kubectl get pods -n "$NAMESPACE"
    echo
    
    log_info "Services:"
    kubectl get services -n "$NAMESPACE"
    echo
    
    log_info "Ingress:"
    kubectl get ingress -n "$NAMESPACE" 2>/dev/null || log_warning "No ingress resources found"
    echo
}

# Function to cleanup (restore original files)
cleanup() {
    if [[ -f "$PROJECT_ROOT/k8s/05-voting-app.yaml.bak" ]]; then
        mv "$PROJECT_ROOT/k8s/05-voting-app.yaml.bak" "$PROJECT_ROOT/k8s/05-voting-app.yaml"
        log_info "Restored original deployment manifest"
    fi
}

# Trap to ensure cleanup runs on exit
trap cleanup EXIT

# Main execution
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"
    log_info "Namespace: $NAMESPACE"
    log_info "Image Tag: $IMAGE_TAG"
    echo
    
    validate_prerequisites
    create_namespace
    apply_manifests
    wait_for_deployments
    
    if health_check; then
        log_success "Deployment completed successfully!"
        show_status
        
        echo
        log_info "Access your application:"
        log_info "- Health Check: http://your-domain.com/health"
        log_info "- API Endpoints: http://your-domain.com/api/*"
        log_info "- MongoDB (if port-forwarded): kubectl port-forward service/mongodb-service 27017:27017 -n $NAMESPACE"
        
    else
        log_error "Deployment completed but health checks failed"
        show_status
        exit 1
    fi
}

# Run main function
main "$@"