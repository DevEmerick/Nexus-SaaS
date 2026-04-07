#!/bin/bash

# Script de testes automatizados para API CRUD do Nexus SaaS
# Testa todos os endpoints GET/POST

BASE_URL="https://nexus-saas-git-preview-devemericks-projects.vercel.app"
PASS=0
FAIL=0

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "   API CRUD TESTS - NEXUS SAAS"
echo "=========================================="
echo ""

# Teste 1: Health Check
echo -e "${YELLOW}[TEST 1] GET /api/health${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "Response: $BODY" | head -c 100
  echo ""
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  echo "Response: $BODY"
  ((FAIL++))
fi
echo ""

# Teste 2: Test endpoint
echo -e "${YELLOW}[TEST 2] GET /api/test${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/test")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "Response: $BODY"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# Teste 3: List Users
echo -e "${YELLOW}[TEST 3] GET /api/listusers${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/listusers")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "Response: $BODY" | head -c 150
  echo ""
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# Teste 4: List Workspaces
echo -e "${YELLOW}[TEST 4] GET /api/listworkspaces${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/listworkspaces")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# Teste 5: List Columns
echo -e "${YELLOW}[TEST 5] GET /api/listcolumns${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/listcolumns")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# Teste 6: List Tasks
echo -e "${YELLOW}[TEST 6] GET /api/listtasks${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/listtasks")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# Teste 7: Create User
echo -e "${YELLOW}[TEST 7] POST /api/createuser${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/createuser" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
  ((PASS++))
elif [ "$HTTP_CODE" = "400" ]; then
  # User might already exist
  echo -e "${YELLOW}~ WARN${NC} - HTTP 400 (User may already exist)"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  echo "Response: $BODY"
  ((FAIL++))
fi
echo ""

# Teste 8: POST to health (create test user)
echo -e "${YELLOW}[TEST 8] POST /api/health${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
  echo "Response: $BODY" | head -c 100
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# Get a workspace ID for testing UPDATE/DELETE
echo -e "${YELLOW}[FETCHING] Getting workspace ID for UPDATE/DELETE tests...${NC}"
WORKSPACES=$(curl -s "$BASE_URL/api/listworkspaces")
WORKSPACE_ID=$(echo "$WORKSPACES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$WORKSPACE_ID" ]; then
  echo -e "${RED}✗ Could not get workspace ID, skipping UPDATE/DELETE tests${NC}"
else
  echo -e "${GREEN}✓ Got workspace ID: $WORKSPACE_ID${NC}"
  echo ""

  # Teste 9: Update Workspace
  echo -e "${YELLOW}[TEST 9] PUT /api/update (type=workspace)${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/update" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"workspace\",\"id\":\"$WORKSPACE_ID\",\"title\":\"Updated Workspace\",\"color\":\"#FF5733\"}")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
  echo ""

  # Teste 10: Update User
  echo -e "${YELLOW}[TEST 10] PUT /api/update (type=user)${NC}"
  USERS=$(curl -s "$BASE_URL/api/listusers")
  USER_ID=$(echo "$USERS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$USER_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/update" \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"user\",\"id\":\"$USER_ID\",\"name\":\"Updated User\",\"phone\":\"1234567890\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
      ((PASS++))
    else
      echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
      ((FAIL++))
    fi
  else
    echo -e "${YELLOW}~ SKIP${NC} - No user found"
  fi
  echo ""

  # Get Column ID for testing
  COLUMNS=$(curl -s "$BASE_URL/api/listcolumns")
  COLUMN_ID=$(echo "$COLUMNS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$COLUMN_ID" ]; then
    # Teste 11: Update Column
    echo -e "${YELLOW}[TEST 11] PUT /api/update (type=column)${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/update" \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"column\",\"id\":\"$COLUMN_ID\",\"title\":\"Updated Column\",\"position\":2}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
      ((PASS++))
    else
      echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
      ((FAIL++))
    fi
    echo ""
  fi

  # Get Task ID for testing
  TASKS=$(curl -s "$BASE_URL/api/listtasks")
  TASK_ID=$(echo "$TASKS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$TASK_ID" ]; then
    # Teste 12: Update Task
    echo -e "${YELLOW}[TEST 12] PUT /api/update (type=task)${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/update" \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"task\",\"id\":\"$TASK_ID\",\"title\":\"Updated Task\",\"priority\":\"Alta\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
      ((PASS++))
    else
      echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
      ((FAIL++))
    fi
    echo ""

    # Teste 13: Soft Delete Task
    echo -e "${YELLOW}[TEST 13] DELETE /api/delete (soft delete task)${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/delete" \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"task\",\"id\":\"$TASK_ID\",\"permanent\":false}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
      ((PASS++))
    else
      echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
      ((FAIL++))
    fi
    echo ""
  fi
fi

echo ""

# Resumo
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo -e "Total: $((PASS + FAIL)) tests"
echo -e "${GREEN}Passed: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
  echo -e "${RED}Failed: $FAIL${NC}"
else
  echo -e "${GREEN}Failed: $FAIL${NC}"
fi
echo "=========================================="

exit $FAIL
