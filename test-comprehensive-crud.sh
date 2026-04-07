#!/bin/bash

# Script de testes CRUD completo - Users, Workspaces, Columns, Tasks, Comments
# Popula dados e testa todas operações CRUD

BASE_URL="https://nexus-saas-git-preview-devemericks-projects.vercel.app"
PASS=0
FAIL=0

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "   COMPREHENSIVE CRUD TESTS - NEXUS SAAS"
echo "=========================================="
echo ""

# ============================================================
# 1. USERS CRUD TESTS
# ============================================================
echo -e "${BLUE}=== USER CRUD TESTS ===${NC}"
echo ""

# CREATE USER
echo -e "${YELLOW}[TEST 1] POST - Create User${NC}"
CREATE_USER=$(curl -s -X POST "$BASE_URL/api/createuser" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser$(date +%s)@example.com\",\"name\":\"Test User $(date +%s)\",\"password\":\"password123\"}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/createuser" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser$(date +%s)@example.com\",\"name\":\"Test User\",\"password\":\"password123\"}")

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
  USER_ID=$(echo "$CREATE_USER" | jq -r '.user.id // empty' 2>/dev/null)
  if [ -n "$USER_ID" ]; then
    echo "  User ID: $USER_ID"
  fi
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# READ USERS
echo -e "${YELLOW}[TEST 2] GET - List Users${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/listusers")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/listusers")

if [ "$HTTP_CODE" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.count // 0' 2>/dev/null)
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "  Total users: $COUNT"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# UPDATE USER
echo -e "${YELLOW}[TEST 3] PUT - Update User${NC}"
if [ -n "$USER_ID" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/update" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"user\",\"id\":\"$USER_ID\",\"name\":\"Updated User\",\"phone\":\"123456789\"}")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No user ID available"
fi
echo ""

# ============================================================
# 2. WORKSPACE CRUD TESTS
# ============================================================
echo -e "${BLUE}=== WORKSPACE CRUD TESTS ===${NC}"
echo ""

# CREATE WORKSPACE
echo -e "${YELLOW}[TEST 4] POST - Create Workspace${NC}"
if [ -n "$USER_ID" ]; then
  CREATE_WS=$(curl -s -X POST "$BASE_URL/api/createworkspace" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Workspace\",\"color\":\"#FF5733\",\"userId\":\"$USER_ID\"}")
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/createworkspace" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Workspace 2\",\"color\":\"#FF5733\",\"userId\":\"$USER_ID\"}")
  
  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
    WORKSPACE_ID=$(echo "$CREATE_WS" | jq -r '.workspace.id // empty' 2>/dev/null)
    if [ -n "$WORKSPACE_ID" ]; then
      echo "  Workspace ID: $WORKSPACE_ID"
    fi
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No user ID"
fi
echo ""

# READ WORKSPACES
echo -e "${YELLOW}[TEST 5] GET - List Workspaces${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/listworkspaces")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/listworkspaces")

if [ "$HTTP_CODE" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.count // 0' 2>/dev/null)
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "  Total workspaces: $COUNT"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# UPDATE WORKSPACE
echo -e "${YELLOW}[TEST 6] PUT - Update Workspace${NC}"
if [ -n "$WORKSPACE_ID" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/update" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"workspace\",\"id\":\"$WORKSPACE_ID\",\"title\":\"Updated Workspace\",\"color\":\"#00FF00\"}")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No workspace ID"
fi
echo ""

# ============================================================
# 3. COLUMN CRUD TESTS
# ============================================================
echo -e "${BLUE}=== COLUMN CRUD TESTS ===${NC}"
echo ""

# CREATE COLUMN
echo -e "${YELLOW}[TEST 7] POST - Create Column${NC}"
if [ -n "$WORKSPACE_ID" ]; then
  CREATE_COL=$(curl -s -X POST "$BASE_URL/api/createcolumn" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Column\",\"color\":\"#3B82F6\",\"workspaceId\":\"$WORKSPACE_ID\",\"position\":1}")
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/createcolumn" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Column 2\",\"color\":\"#3B82F6\",\"workspaceId\":\"$WORKSPACE_ID\",\"position\":2}")
  
  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
    COLUMN_ID=$(echo "$CREATE_COL" | jq -r '.column.id // empty' 2>/dev/null)
    if [ -n "$COLUMN_ID" ]; then
      echo "  Column ID: $COLUMN_ID"
    fi
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No workspace ID"
fi
echo ""

# READ COLUMNS
echo -e "${YELLOW}[TEST 8] GET - List Columns${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/listcolumns")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/listcolumns")

if [ "$HTTP_CODE" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.count // 0' 2>/dev/null)
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "  Total columns: $COUNT"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# UPDATE COLUMN
echo -e "${YELLOW}[TEST 9] PUT - Update Column${NC}"
if [ -n "$COLUMN_ID" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/update" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"column\",\"id\":\"$COLUMN_ID\",\"title\":\"Updated Column\",\"position\":2}")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No column ID"
fi
echo ""

# ============================================================
# 4. TASK CRUD TESTS (Cards)
# ============================================================
echo -e "${BLUE}=== TASK CRUD TESTS (Cards) ===${NC}"
echo ""

# CREATE TASK
echo -e "${YELLOW}[TEST 10] POST - Create Task (Card)${NC}"
if [ -n "$COLUMN_ID" ] && [ -n "$WORKSPACE_ID" ]; then
  CREATE_TASK=$(curl -s -X POST "$BASE_URL/api/createtask" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Card\",\"description\":\"This is a test card\",\"columnId\":\"$COLUMN_ID\",\"workspaceId\":\"$WORKSPACE_ID\",\"priority\":\"Alta\",\"cardColor\":\"slate\"}")
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/createtask" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Another Card\",\"columnId\":\"$COLUMN_ID\",\"workspaceId\":\"$WORKSPACE_ID\",\"priority\":\"Média\"}")
  
  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
    TASK_ID=$(echo "$CREATE_TASK" | jq -r '.task.id // empty' 2>/dev/null)
    if [ -n "$TASK_ID" ]; then
      echo "  Task ID: $TASK_ID"
    fi
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - Missing column or workspace ID"
fi
echo ""

# READ TASKS
echo -e "${YELLOW}[TEST 11] GET - List Tasks${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/listtasks")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/listtasks")

if [ "$HTTP_CODE" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.count // 0' 2>/dev/null)
  echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
  echo "  Total tasks: $COUNT"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
  ((FAIL++))
fi
echo ""

# UPDATE TASK (with comment)
echo -e "${YELLOW}[TEST 12] PUT - Update Task (with comment)${NC}"
if [ -n "$TASK_ID" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/update" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"task\",\"id\":\"$TASK_ID\",\"title\":\"Updated Card\",\"priority\":\"Crítica\",\"completionComment\":\"Task completed successfully!\",\"assignedTo\":\"DevTeam\"}")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
    echo "  Comment added: 'Task completed successfully!'"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No task ID"
fi
echo ""

# ============================================================
# 5. SOFT DELETE TEST
# ============================================================
echo -e "${BLUE}=== DELETE TESTS ===${NC}"
echo ""

# SOFT DELETE TASK
echo -e "${YELLOW}[TEST 13] DELETE - Soft Delete Task (to trash)${NC}"
if [ -n "$TASK_ID" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/delete" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"task\",\"id\":\"$TASK_ID\",\"permanent\":false}")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
    echo "  Task moved to trash"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}~ SKIP${NC} - No task ID"
fi
echo ""

# ============================================================
# 6. COMPLETE WORKFLOW TEST
# ============================================================
echo -e "${BLUE}=== COMPLETE WORKFLOW TEST ===${NC}"
echo ""

# Criar novo task após soft delete anterior
if [ -n "$COLUMN_ID" ] && [ -n "$WORKSPACE_ID" ]; then
  echo -e "${YELLOW}[TEST 14] POST - Create Card for permanent deletion test${NC}"
  CREATE_TASK=$(curl -s -X POST "$BASE_URL/api/createtask" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Card to Delete\",\"description\":\"This will be permanently deleted\",\"columnId\":\"$COLUMN_ID\",\"workspaceId\":\"$WORKSPACE_ID\",\"priority\":\"Baixa\",\"cardColor\":\"red\"}")
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/createtask" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Temp Card\",\"columnId\":\"$COLUMN_ID\",\"workspaceId\":\"$WORKSPACE_ID\"}")
  
  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $HTTP_CODE"
    TASK_ID_2=$(echo "$CREATE_TASK" | jq -r '.task.id // empty' 2>/dev/null)
    if [ -n "$TASK_ID_2" ]; then
      echo "  Task ID: $TASK_ID_2"
      echo ""
      
      # Permanent delete
      echo -e "${YELLOW}[TEST 15] DELETE - Permanently Delete Task${NC}"
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/delete" \
        -H "Content-Type: application/json" \
        -d "{\"type\":\"task\",\"id\":\"$TASK_ID_2\",\"permanent\":true}")
      
      if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} - HTTP 200"
        echo "  Task permanently deleted"
        ((PASS++))
      else
        echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
        ((FAIL++))
      fi
    fi
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $HTTP_CODE"
    ((FAIL++))
  fi
fi
echo ""

# ============================================================
# SUMMARY
# ============================================================
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
