#!/bin/bash

# ZarishHealthcare System Blue-Green Deployment Script
# Zero-downtime deployment for humanitarian healthcare services

set -euo pipefail

# Configuration
NAMESPACE="zarish-healthcare"
CHART_PATH="deployment/helm/zarish-healthcare"
HEALTH_CHECK_TIMEOUT=600
ROLLBACK_TIMEOUT=300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to check if kubectl is available and cluster is accessible
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed or not in PATH"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to determine current active deployment (blue or green)
get_current_deployment() {
    local current_service=$(kubectl get service zarish-healthcare-active -n $NAMESPACE -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo "")
    
    if [[ "$current_service" == "blue" ]]; then
        echo "blue"
    elif [[ "$current_service" == "green" ]]; then
        echo "green"
    else
        # If no active service exists, default to blue
        echo "none"
    fi
}

# Function to get target deployment (opposite of current)
get_target_deployment() {
    local current=$1
    
    if [[ "$current" == "blue" ]]; then
        echo "green"
    elif [[ "$current" == "green" ]]; then
        echo "blue"
    else
        echo "blue"  # Default to blue if no current deployment
    fi
}

# Function to deploy to target environment
deploy_target() {
    local target=$1
    local image_tag=$2
    
    log_info "Deploying $target environment with image tag: $image_tag"
    
    # Create values file for target deployment
    cat > /tmp/values-${target}.yaml << EOF
global:
  environment: production
  imageTag: ${image_tag}
  
# Blue-green specific configuration
deployment:
  version: ${target}
  
# Service configuration
service:
  version: ${target}

# All service configurations with blue-green versioning
zarishCare:
  service:
    name: zarish-care-${target}
  deployment:
    version: ${target}

zarishLabs:
  service:
    name: zarish-labs-${target}
  deployment:
    version: ${target}

zarishOps:
  service:
    name: zarish-ops-${target}
  deployment:
    version: ${target}

zarishAnalytics:
  service:
    name: zarish-analytics-${target}
  deployment:
    version: ${target}

zarishAccess:
  service:
    name: zarish-access-${target}
  deployment:
    version: ${target}

zarishSync:
  service:
    name: zarish-sync-${target}
  deployment:
    version: ${target}

clinicalDashboard:
  service:
    name: clinical-dashboard-${target}
  deployment:
    version: ${target}

mobileAppBackend:
  service:
    name: mobile-app-backend-${target}
  deployment:
    version: ${target}
EOF
    
    # Deploy using Helm
    helm upgrade --install zarish-healthcare-${target} $CHART_PATH \
        --namespace $NAMESPACE \
        --create-namespace \
        --values $CHART_PATH/values-production.yaml \
        --values /tmp/values-${target}.yaml \
        --timeout 15m \
        --wait
    
    if [[ $? -eq 0 ]]; then
        log_success "Successfully deployed $target environment"
    else
        log_error "Failed to deploy $target environment"
        exit 1
    fi
}

# Function to run health checks on target deployment
health_check_target() {
    local target=$1
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    log_info "Running health checks for $target environment..."
    
    # List of services to check
    local services=(
        "zarish-care-${target}"
        "zarish-labs-${target}"
        "zarish-ops-${target}"
        "zarish-analytics-${target}"
        "zarish-access-${target}"
        "zarish-sync-${target}"
        "clinical-dashboard-${target}"
        "mobile-app-backend-${target}"
    )
    
    for service in "${services[@]}"; do
        log_info "Checking health of $service..."
        
        local endpoint="http://${service}.${NAMESPACE}.svc.cluster.local"
        local health_endpoint="${endpoint}/health"
        
        # Wait for service to be ready
        local ready=false
        local elapsed=0
        
        while [[ $ready == false && $elapsed -lt $timeout ]]; do
            if kubectl exec -n $NAMESPACE deployment/health-checker -- curl -f -s "$health_endpoint" >/dev/null 2>&1; then
                ready=true
                log_success "$service is healthy"
            else
                log_info "Waiting for $service to become healthy... (${elapsed}s elapsed)"
                sleep 10
                elapsed=$(($(date +%s) - start_time))
            fi
        done
        
        if [[ $ready == false ]]; then
            log_error "$service failed health check after ${elapsed}s"
            return 1
        fi
    done
    
    log_success "All health checks passed for $target environment"
    return 0
}

# Function to run integration tests
run_integration_tests() {
    local target=$1
    
    log_info "Running integration tests against $target environment..."
    
    # Create test configuration
    cat > /tmp/test-config.json << EOF
{
  "baseUrl": "http://zarish-care-${target}.${NAMESPACE}.svc.cluster.local:3001",
  "services": {
    "care": "http://zarish-care-${target}.${NAMESPACE}.svc.cluster.local:3001",
    "labs": "http://zarish-labs-${target}.${NAMESPACE}.svc.cluster.local:3002",
    "ops": "http://zarish-ops-${target}.${NAMESPACE}.svc.cluster.local:3003",
    "analytics": "http://zarish-analytics-${target}.${NAMESPACE}.svc.cluster.local:3004",
    "access": "http://zarish-access-${target}.${NAMESPACE}.svc.cluster.local:3005",
    "sync": "http://zarish-sync-${target}.${NAMESPACE}.svc.cluster.local:3006"
  },
  "timeout": 30000,
  "retries": 3
}
EOF
    
    # Run integration test pod
    kubectl run integration-test-${target} -n $NAMESPACE \
        --image=zarish-healthcare/integration-tests:latest \
        --restart=Never \
        --rm -i --tty \
        --env="CONFIG_FILE=/tmp/test-config.json" \
        --command -- npm run test:integration
    
    local test_result=$?
    
    if [[ $test_result -eq 0 ]]; then
        log_success "Integration tests passed for $target environment"
        return 0
    else
        log_error "Integration tests failed for $target environment"
        return 1
    fi
}

# Function to switch traffic to target deployment
switch_traffic() {
    local target=$1
    
    log_info "Switching traffic to $target environment..."
    
    # Update active service selector to point to target
    kubectl patch service zarish-healthcare-active -n $NAMESPACE -p '{"spec":{"selector":{"version":"'$target'"}}}'
    
    # Update ingress to point to target services
    kubectl patch ingress zarish-healthcare-ingress -n $NAMESPACE \
        --type='json' \
        -p='[{"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value":"zarish-care-'$target'"}]'
    
    # Verify traffic switch
    sleep 30
    
    local switched_service=$(kubectl get service zarish-healthcare-active -n $NAMESPACE -o jsonpath='{.spec.selector.version}')
    
    if [[ "$switched_service" == "$target" ]]; then
        log_success "Traffic successfully switched to $target environment"
        return 0
    else
        log_error "Failed to switch traffic to $target environment"
        return 1
    fi
}

# Function to monitor deployment for issues
monitor_deployment() {
    local target=$1
    local monitor_duration=300  # 5 minutes
    local start_time=$(date +%s)
    
    log_info "Monitoring $target environment for $monitor_duration seconds..."
    
    while [[ $(($(date +%s) - start_time)) -lt $monitor_duration ]]; do
        # Check for any failed pods
        local failed_pods=$(kubectl get pods -n $NAMESPACE -l version=$target --field-selector=status.phase!=Running --no-headers | wc -l)
        
        if [[ $failed_pods -gt 0 ]]; then
            log_warning "Found $failed_pods failed pods in $target environment"
            kubectl get pods -n $NAMESPACE -l version=$target --field-selector=status.phase!=Running
        fi
        
        # Check service endpoints
        local unhealthy_endpoints=0
        local services=(
            "zarish-care-${target}"
            "zarish-labs-${target}"
            "zarish-ops-${target}"
            "zarish-analytics-${target}"
            "zarish-access-${target}"
            "zarish-sync-${target}"
        )
        
        for service in "${services[@]}"; do
            if ! kubectl exec -n $NAMESPACE deployment/health-checker -- curl -f -s "http://${service}/health" >/dev/null 2>&1; then
                ((unhealthy_endpoints++))
            fi
        done
        
        if [[ $unhealthy_endpoints -gt 0 ]]; then
            log_warning "Found $unhealthy_endpoints unhealthy endpoints in $target environment"
        fi
        
        # Check error rates from metrics
        local error_rate=$(kubectl exec -n zarish-monitoring deployment/prometheus -- \
            wget -qO- 'http://localhost:9090/api/v1/query?query=rate(http_requests_total{status=~"5.."}[5m])' | \
            jq -r '.data.result[0].value[1] // "0"')
        
        if [[ $(echo "$error_rate > 0.01" | bc -l) -eq 1 ]]; then
            log_warning "High error rate detected: $error_rate"
        fi
        
        sleep 30
    done
    
    log_success "Monitoring completed for $target environment"
}

# Function to cleanup old deployment
cleanup_old_deployment() {
    local old_deployment=$1
    
    if [[ "$old_deployment" != "none" ]]; then
        log_info "Cleaning up old $old_deployment deployment..."
        
        # Scale down old deployment
        kubectl scale deployment -n $NAMESPACE -l version=$old_deployment --replicas=0
        
        # Wait for pods to terminate
        kubectl wait --for=delete pod -n $NAMESPACE -l version=$old_deployment --timeout=300s
        
        # Optionally delete old deployment (commented out for safety)
        # helm uninstall zarish-healthcare-${old_deployment} -n $NAMESPACE
        
        log_success "Old $old_deployment deployment scaled down"
    fi
}

# Function to rollback deployment
rollback_deployment() {
    local current=$1
    local previous=$2
    
    log_warning "Rolling back from $current to $previous..."
    
    if [[ "$previous" != "none" ]]; then
        # Scale up previous deployment
        kubectl scale deployment -n $NAMESPACE -l version=$previous --replicas=3
        
        # Wait for previous deployment to be ready
        kubectl wait --for=condition=available deployment -n $NAMESPACE -l version=$previous --timeout=300s
        
        # Switch traffic back
        switch_traffic $previous
        
        # Scale down current deployment
        kubectl scale deployment -n $NAMESPACE -l version=$current --replicas=0
        
        log_success "Rollback completed"
    else
        log_error "No previous deployment to rollback to"
        exit 1
    fi
}

# Main deployment function
main() {
    local image_tag=${1:-"latest"}
    
    log_info "Starting blue-green deployment for ZarishHealthcare System"
    log_info "Image tag: $image_tag"
    
    # Check prerequisites
    check_prerequisites
    
    # Determine current and target deployments
    local current=$(get_current_deployment)
    local target=$(get_target_deployment $current)
    
    log_info "Current deployment: $current"
    log_info "Target deployment: $target"
    
    # Pre-deployment database backup
    log_info "Creating database backup before deployment..."
    kubectl create job backup-pre-deployment-$(date +%s) -n $NAMESPACE \
        --from=cronjob/zarish-healthcare-backup
    
    # Deploy to target environment
    deploy_target $target $image_tag
    
    # Run health checks
    if ! health_check_target $target; then
        log_error "Health checks failed for $target environment"
        rollback_deployment $target $current
        exit 1
    fi
    
    # Run integration tests
    if ! run_integration_tests $target; then
        log_error "Integration tests failed for $target environment"
        rollback_deployment $target $current
        exit 1
    fi
    
    # Switch traffic to target
    if ! switch_traffic $target; then
        log_error "Failed to switch traffic to $target environment"
        rollback_deployment $target $current
        exit 1
    fi
    
    # Monitor deployment
    monitor_deployment $target
    
    # Cleanup old deployment
    cleanup_old_deployment $current
    
    # Final validation
    log_info "Running final validation..."
    sleep 60  # Wait for metrics to stabilize
    
    local final_health_check=true
    if ! health_check_target $target; then
        final_health_check=false
    fi
    
    if [[ $final_health_check == true ]]; then
        log_success "Blue-green deployment completed successfully!"
        log_success "Active deployment: $target"
        log_success "ZarishHealthcare System is now running with image tag: $image_tag"
        
        # Send notification
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ ZarishHealthcare blue-green deployment completed successfully! Active environment: $target, Image: $image_tag\"}" \
            ${SLACK_WEBHOOK:-""} >/dev/null 2>&1 || true
    else
        log_error "Final validation failed, initiating rollback..."
        rollback_deployment $target $current
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"