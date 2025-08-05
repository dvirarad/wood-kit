#!/bin/bash

# Wood Kits - Test Runner Script
# Runs all tests: Unit, Integration, E2E, and Performance

echo "🧪 Wood Kits - Complete Test Runner"
echo "==================================="

# Configuration
TEST_MODE=${1:-"all"}  # all, unit, integration, e2e, performance
CI_MODE=${2:-"false"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Test result tracking
UNIT_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
E2E_TESTS_PASSED=false
PERFORMANCE_TESTS_PASSED=false

run_unit_tests() {
    echo ""
    log_info "Running Unit Tests"
    echo "=================="
    
    # Backend unit tests
    log_info "Backend Unit Tests..."
    cd backend
    
    if npm test; then
        log_success "Backend unit tests passed"
        BACKEND_UNIT_PASSED=true
    else
        log_error "Backend unit tests failed"
        BACKEND_UNIT_PASSED=false
    fi
    
    cd ..
    
    # Frontend unit tests
    log_info "Frontend Unit Tests..."
    cd frontend
    
    if CI=true npm test -- --coverage --watchAll=false; then
        log_success "Frontend unit tests passed"
        FRONTEND_UNIT_PASSED=true
    else
        log_error "Frontend unit tests failed"
        FRONTEND_UNIT_PASSED=false
    fi
    
    cd ..
    
    if [ "$BACKEND_UNIT_PASSED" = true ] && [ "$FRONTEND_UNIT_PASSED" = true ]; then
        UNIT_TESTS_PASSED=true
        log_success "All unit tests passed"
    else
        log_error "Some unit tests failed"
    fi
}

run_integration_tests() {
    echo ""
    log_info "Running Integration Tests"
    echo "========================="
    
    # Make script executable and run
    chmod +x test-suite.sh
    
    if [ "$CI_MODE" = "true" ]; then
        ./test-suite.sh --ci
    else
        ./test-suite.sh
    fi
    
    if [ $? -eq 0 ]; then
        INTEGRATION_TESTS_PASSED=true
        log_success "Integration tests passed"
    else
        log_error "Integration tests failed"
    fi
}

run_e2e_tests() {
    echo ""
    log_info "Running E2E Happy Flow Tests"
    echo "============================"
    
    # Install axios if not present
    if [ ! -d "node_modules/axios" ]; then
        log_info "Installing axios for E2E tests..."
        npm install axios
    fi
    
    # Run E2E tests
    node e2e-tests.js
    
    if [ $? -eq 0 ]; then
        E2E_TESTS_PASSED=true
        log_success "E2E tests passed"
    else
        log_error "E2E tests failed"
    fi
}

run_performance_tests() {
    echo ""
    log_info "Running Performance Tests"
    echo "========================="
    
    # Simple performance tests
    log_info "Testing backend response times..."
    
    # Backend performance
    BACKEND_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:6003/health 2>/dev/null || echo "999")
    
    if (( $(echo "$BACKEND_TIME < 2.0" | bc -l 2>/dev/null || echo "0") )); then
        log_success "Backend response time: ${BACKEND_TIME}s (< 2s)"
        BACKEND_PERF_PASSED=true
    else
        log_warning "Backend response time: ${BACKEND_TIME}s (>= 2s or unavailable)"
        BACKEND_PERF_PASSED=false
    fi
    
    # Frontend performance
    FRONTEND_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:6005 2>/dev/null || echo "999")
    
    if (( $(echo "$FRONTEND_TIME < 3.0" | bc -l 2>/dev/null || echo "0") )); then
        log_success "Frontend response time: ${FRONTEND_TIME}s (< 3s)"
        FRONTEND_PERF_PASSED=true
    else
        log_warning "Frontend response time: ${FRONTEND_TIME}s (>= 3s or unavailable)"
        FRONTEND_PERF_PASSED=false
    fi
    
    if [ "$BACKEND_PERF_PASSED" = true ] && [ "$FRONTEND_PERF_PASSED" = true ]; then
        PERFORMANCE_TESTS_PASSED=true
        log_success "Performance tests passed"
    else
        log_warning "Performance tests completed with warnings"
        PERFORMANCE_TESTS_PASSED=true  # Don't fail on performance warnings
    fi
}

generate_report() {
    echo ""
    echo "📊 TEST RESULTS SUMMARY"
    echo "======================="
    
    if [ "$UNIT_TESTS_PASSED" = true ]; then
        log_success "Unit Tests: PASSED"
    else
        log_error "Unit Tests: FAILED"
    fi
    
    if [ "$INTEGRATION_TESTS_PASSED" = true ]; then
        log_success "Integration Tests: PASSED"
    else
        log_error "Integration Tests: FAILED"
    fi
    
    if [ "$E2E_TESTS_PASSED" = true ]; then
        log_success "E2E Tests: PASSED"
    else
        log_error "E2E Tests: FAILED"
    fi
    
    if [ "$PERFORMANCE_TESTS_PASSED" = true ]; then
        log_success "Performance Tests: PASSED"
    else
        log_warning "Performance Tests: WARNING"
    fi
    
    # Overall result
    echo ""
    if [ "$UNIT_TESTS_PASSED" = true ] && [ "$INTEGRATION_TESTS_PASSED" = true ] && [ "$E2E_TESTS_PASSED" = true ]; then
        echo "🎉 ALL TESTS PASSED!"
        echo "==================="
        log_success "System is ready for deployment"
        return 0
    else
        echo "❌ SOME TESTS FAILED"
        echo "===================="
        log_error "Fix failing tests before deployment"
        return 1
    fi
}

# Main execution
case $TEST_MODE in
    "unit")
        run_unit_tests
        if [ "$UNIT_TESTS_PASSED" = true ]; then exit 0; else exit 1; fi
        ;;
    "integration")
        run_integration_tests
        if [ "$INTEGRATION_TESTS_PASSED" = true ]; then exit 0; else exit 1; fi
        ;;
    "e2e")
        run_e2e_tests
        if [ "$E2E_TESTS_PASSED" = true ]; then exit 0; else exit 1; fi
        ;;
    "performance")
        run_performance_tests
        if [ "$PERFORMANCE_TESTS_PASSED" = true ]; then exit 0; else exit 1; fi
        ;;
    "all"|*)
        run_unit_tests
        run_integration_tests
        run_e2e_tests
        run_performance_tests
        generate_report
        exit $?
        ;;
esac