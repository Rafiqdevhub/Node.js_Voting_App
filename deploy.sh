set -e

NAME="voting-app"
USERNAME="rafiq9323"
IMAGE="$USERNAME/$NAME:latest"

echo "Building Docker image..."
docker build -t $IMAGE .

echo "Pushing Docker image to Docker Hub..."
docker push $IMAGE

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml

echo "Getting pods"
kubectl get pods

echo "Getting services"
kubectl get services

echo "Fetching the main service details..."
kubectl get services $NAME-service