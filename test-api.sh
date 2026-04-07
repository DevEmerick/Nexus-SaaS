#!/bin/bash

set -e

BASE_URL="https://nexus-saas-git-preview-devemericks-projects.vercel.app"
RESULTS_FILE="test-results.log"

echo "Iniciando testes automatizados dos endpoints..." > $RESULTS_FILE
echo "Base URL: $BASE_URL" >> $RESULTS_FILE
echo "Timestamp: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

passed=0
failed=0

# Função para testar endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  
  echo "Testing: $method $endpoint" | tee -a $RESULTS_FILE
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo "✓ PASS (HTTP $http_code)" | tee -a $RESULTS_FILE
    ((passed++))
  else
    echo "✗ FAIL (Expected $expected_status, got $http_code)" | tee -a $RESULTS_FILE
    echo "Response: $body" >> $RESULTS_FILE
    ((failed++))
  fi
  
  echo "Response: $body" | tee -a $RESULTS_FILE
  echo "" | tee -a $RESULTS_FILE
}

echo "=== HEALTH CHECK ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/api/health" "" "200"

echo "=== TESTING USERS ENDPOINT ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/api/users" "" "200"

USER_PAYLOAD='{"email":"test-'$(date +%s)'@test.com","name":"Test User","password":"pass123"}'
test_endpoint "POST" "/api/users" "$USER_PAYLOAD" "201"

echo "=== TESTING WORKSPACES ENDPOINT ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/api/workspaces" "" "200"

WORKSPACE_PAYLOAD='{"name":"Test Workspace","ownerId":1}'
test_endpoint "POST" "/api/workspaces" "$WORKSPACE_PAYLOAD" "201"

echo "=== TESTING COLUMNS ENDPOINT ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/api/columns" "" "200"

COLUMN_PAYLOAD='{"name":"Todo","workspaceId":1}'
test_endpoint "POST" "/api/columns" "$COLUMN_PAYLOAD" "201"

echo "=== TESTING TASKS ENDPOINT ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/api/tasks" "" "200"

TASK_PAYLOAD='{"title":"Sample Task","columnId":1}'
test_endpoint "POST" "/api/tasks" "$TASK_PAYLOAD" "201"

echo "" | tee -a $RESULTS_FILE
echo "=== SUMMARY ===" | tee -a $RESULTS_FILE
echo "Passed: $passed" | tee -a $RESULTS_FILE
echo "Failed: $failed" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

if [ $failed -eq 0 ]; then
  echo "✓ All tests passed!" | tee -a $RESULTS_FILE
  exit 0
else
  echo "✗ Some tests failed" | tee -a $RESULTS_FILE
  exit 1
fi
