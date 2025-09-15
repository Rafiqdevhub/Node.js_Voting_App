# 🚀 Production Deployment Guide

## ✅ Deployment Checklist

### Pre-Deployment Requirements

#### Infrastructure
- [ ] Kubernetes cluster is ready and accessible
- [ ] kubectl is configured with proper credentials
- [ ] Docker registry access is configured
- [ ] Domain names and SSL certificates are ready
- [ ] Persistent storage classes are available

#### Security
- [ ] All secrets are properly configured in Kubernetes
- [ ] Database credentials are secure and unique
- [ ] JWT secrets are randomly generated and secure
- [ ] Network policies are reviewed and applied
- [ ] RBAC permissions are configured

#### Configuration
- [ ] Environment variables are set for production
- [ ] Resource limits and requests are properly configured
- [ ] Ingress configuration matches your domain
- [ ] MongoDB initialization script is customized
- [ ] Backup strategy is defined

### Quick Deployment Commands

```bash
# 1. Build and push Docker image
docker build -t your-registry/voting-app:v1.0.0 .
docker push your-registry/voting-app:v1.0.0

# 2. Update Kubernetes manifests with your image
sed -i 's|your-registry/voting-app:latest|your-registry/voting-app:v1.0.0|g' k8s/05-voting-app.yaml

# 3. Deploy to Kubernetes
./deploy/deploy.sh production voting-app your-registry/voting-app:v1.0.0

# 4. Verify deployment
kubectl get all -n voting-app
curl https://your-domain.com/health
```

## 🔧 Configuration Updates Required

### 1. Docker Registry Configuration

Update in `k8s/05-voting-app.yaml`:
```yaml
spec:
  template:
    spec:
      containers:
      - name: voting-app
        image: YOUR_REGISTRY/voting-app:latest  # <-- Update this
```

Update in `.github/workflows/ci-cd.yaml`:
```yaml
env:
  REGISTRY: docker.io  # or your registry
  IMAGE_NAME: voting-app
```

### 2. Domain Configuration

Update in `k8s/06-ingress.yaml`:
```yaml
spec:
  tls:
  - hosts:
    - your-actual-domain.com  # <-- Update this
  rules:
  - host: your-actual-domain.com  # <-- Update this
```

### 3. Secrets Configuration

Generate and update secrets in `k8s/03-secrets.yaml`:

```bash
# Generate JWT secret
echo -n "$(openssl rand -base64 32)" | base64

# Generate MongoDB password
echo -n "$(openssl rand -base64 24)" | base64
```

### 4. Environment-Specific Namespaces

For multiple environments, create separate manifests:
- `k8s/staging/` - Staging environment
- `k8s/production/` - Production environment

## 🔄 CI/CD Setup

### GitHub Secrets Required

```bash
# Docker Hub
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password-or-token

# Kubernetes Access
KUBE_CONFIG_STAGING=<base64-encoded-kubeconfig>
KUBE_CONFIG_PRODUCTION=<base64-encoded-kubeconfig>

# Optional Security Scanning
SNYK_TOKEN=your-snyk-token
```

### Branch Strategy

- `main` branch → Production deployment
- `develop` branch → Staging deployment
- Feature branches → PR testing only

## 📊 Monitoring Setup

### Health Check URLs

After deployment, these endpoints will be available:
- `https://your-domain.com/health` - Application health
- `https://your-domain.com/ready` - Readiness probe
- `https://your-domain.com/metrics` - Basic metrics

### Kubernetes Monitoring

```bash
# Monitor deployment
kubectl get pods -n voting-app -w

# Check logs
kubectl logs -f deployment/voting-app -n voting-app

# Resource usage
kubectl top pods -n voting-app

# Horizontal Pod Autoscaler status
kubectl get hpa -n voting-app
```

## 🛡️ Security Hardening

### Network Security

- Network policies are configured to restrict inter-pod communication
- Ingress is configured with proper CORS and security headers
- Services use ClusterIP by default for internal communication

### Container Security

- Containers run as non-root user
- Read-only root filesystem where possible
- Security contexts prevent privilege escalation
- Resource limits prevent resource exhaustion

### Data Security

- MongoDB authentication is enabled
- Secrets are stored in Kubernetes secrets, not in code
- Database connections use authentication
- JWT secrets are properly configured

## 📈 Scaling Configuration

### Horizontal Pod Autoscaler (HPA)

The application is configured to auto-scale based on:
- CPU utilization (70% threshold)
- Memory utilization (80% threshold)
- Min replicas: 3
- Max replicas: 10

### Vertical Scaling

If you need more resources per pod, update:
```yaml
resources:
  requests:
    memory: "512Mi"  # Increase as needed
    cpu: "200m"      # Increase as needed
  limits:
    memory: "1Gi"    # Increase as needed
    cpu: "1000m"     # Increase as needed
```

## 💾 Backup Strategy

### MongoDB Backup

```bash
# Create backup job
kubectl create job mongodb-backup-$(date +%Y%m%d) \
  --from=cronjob/mongodb-backup -n voting-app

# Manual backup
kubectl exec -it mongodb-0 -n voting-app -- \
  mongodump --out /tmp/backup-$(date +%Y%m%d)
```

### Configuration Backup

```bash
# Backup all Kubernetes resources
kubectl get all,configmap,secret,pv,pvc -n voting-app -o yaml > voting-app-backup.yaml
```

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### Pods Not Starting
```bash
# Check pod status and events
kubectl describe pod <pod-name> -n voting-app
kubectl get events -n voting-app --sort-by=.metadata.creationTimestamp
```

#### Database Connection Issues
```bash
# Test MongoDB connectivity
kubectl exec -it voting-app-<pod-id> -n voting-app -- \
  node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URL_LOCAL)"
```

#### Image Pull Issues
```bash
# Check image pull secrets
kubectl get secrets -n voting-app
kubectl describe pod <pod-name> -n voting-app
```

#### Resource Issues
```bash
# Check resource usage
kubectl top pods -n voting-app
kubectl describe node
```

## 🔄 Rollback Procedure

### Quick Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/voting-app -n voting-app

# Rollback to specific revision
kubectl rollout undo deployment/voting-app --to-revision=2 -n voting-app

# Check rollout status
kubectl rollout status deployment/voting-app -n voting-app
```

### Manual Rollback
```bash
# Update image tag to previous version
kubectl set image deployment/voting-app voting-app=your-registry/voting-app:previous-tag -n voting-app
```

## ✅ Post-Deployment Validation

### Automated Tests
```bash
# Health check
curl -f https://your-domain.com/health

# API functionality test
curl -X POST https://your-domain.com/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Manual Verification
- [ ] Application loads correctly
- [ ] Database connectivity works
- [ ] User registration works
- [ ] User login works
- [ ] Voting functionality works
- [ ] Admin functions work
- [ ] Health checks return 200
- [ ] Logs show no errors
- [ ] Monitoring shows healthy status

## 📞 Support Contacts

- **DevOps Team**: devops@yourcompany.com
- **Application Team**: dev@yourcompany.com
- **Infrastructure Team**: infra@yourcompany.com

---

**Deployment Status**: ✅ Ready for Production

Last Updated: $(date)
Environment: Production
Version: 1.0.0