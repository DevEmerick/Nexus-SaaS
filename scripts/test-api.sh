#!/bin/bash

# Script de testes completos da API
# Testa todos os endpoints em ordem lógica

set -e

API_URL="http://localhost:3001/api"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
passed_count=0

function test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=${4:-200}
  
  test_count=$((test_count + 1))
  echo -e "${YELLOW}[Teste $test_count] $method $endpoint${NC}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$API_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ Status $http_code${NC}"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    passed_count=$((passed_count + 1))
    echo
  else
    echo -e "${RED}✗ Status esperado: $expected_status, Recebido: $http_code${NC}"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo
  fi
  
  # Extrai ID da resposta se for um objeto com ID
  if echo "$body" | jq . 2>/dev/null | grep -q '"id"'; then
    result_id=$(echo "$body" | jq -r '.id // empty' 2>/dev/null)
  fi
}

echo -e "${YELLOW}========== TESTES DA API NEXUS SAAS ==========${NC}\n"

# 1. REGISTRO
echo -e "${YELLOW}=== 1. AUTENTICAÇÃO ===${NC}"
test_endpoint "POST" "/auth/register" \
  '{"email":"teste2@example.com","password":"password123","name":"Teste User 2"}'

# 2. LOGIN
echo -e "${YELLOW}=== 2. LOGIN ===${NC}"
response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"teste2@example.com","password":"password123"}' \
  "$API_URL/auth/login")
TOKEN=$(echo "$response" | jq -r '.token')
USER_ID=$(echo "$response" | jq -r '.user.id')
echo -e "${GREEN}✓ Token obtido${NC}\n"

# 3. PERFIL
echo -e "${YELLOW}=== 3. PERFIL ===${NC}"
test_endpoint "GET" "/auth/me"

# 4. WORKSPACES
echo -e "${YELLOW}=== 4. WORKSPACES ===${NC}"

# Listar meus workspaces
test_endpoint "GET" "/workspaces/my"

# Criar workspace
test_endpoint "POST" "/workspaces" \
  '{"title":"Projeto Production","color":"#3B82F6"}'
WORKSPACE_ID=$(echo "$response" | sed '$d' | jq -r '.id // empty' 2>/dev/null)

# Obter workspace
test_endpoint "GET" "/workspaces/$WORKSPACE_ID"

# Atualizar workspace
test_endpoint "PATCH" "/workspaces/$WORKSPACE_ID" \
  '{"title":"Projeto Production v2","color":"#EC4899"}'

# 5. COLUNAS
echo -e "${YELLOW}=== 5. COLUNAS ===${NC}"

# Criar primeira coluna
test_endpoint "POST" "/columns" \
  "{\"title\":\"A Fazer\",\"color\":\"#3B82F6\",\"workspaceId\":\"$WORKSPACE_ID\",\"position\":1}"
COLUMN_1_ID=$(echo "$response" | sed '$d' | jq -r '.id // empty' 2>/dev/null)

# Criar segunda coluna
test_endpoint "POST" "/columns" \
  "{\"title\":\"Em Progresso\",\"color\":\"#F59E0B\",\"workspaceId\":\"$WORKSPACE_ID\",\"position\":2}"
COLUMN_2_ID=$(echo "$response" | sed '$d' | jq -r '.id // empty' 2>/dev/null)

# Listar colunas do workspace
test_endpoint "GET" "/columns/workspace/$WORKSPACE_ID"

# Obter coluna
test_endpoint "GET" "/columns/$COLUMN_1_ID"

# Atualizar coluna
test_endpoint "PATCH" "/columns/$COLUMN_1_ID" \
  '{"title":"Tarefas","color":"#8B5CF6"}'

# 6. TAREFAS
echo -e "${YELLOW}=== 6. TAREFAS ===${NC}"

# Criar tarefa 1
test_endpoint "POST" "/tasks" \
  "{\"title\":\"Implementar autenticação\",\"description\":\"Configurar JWT\",\"workspaceId\":\"$WORKSPACE_ID\",\"columnId\":\"$COLUMN_1_ID\",\"priority\":\"Alta\"}"
TASK_1_ID=$(echo "$response" | sed '$d' | jq -r '.id // empty' 2>/dev/null)

# Criar tarefa 2
test_endpoint "POST" "/tasks" \
  "{\"title\":\"Setup database\",\"description\":\"Configurar PostgreSQL\",\"workspaceId\":\"$WORKSPACE_ID\",\"columnId\":\"$COLUMN_1_ID\",\"priority\":\"Alta\"}"
TASK_2_ID=$(echo "$response" | sed '$d' | jq -r '.id // empty' 2>/dev/null)

# Listar tarefas por workspace
test_endpoint "GET" "/tasks/workspace/$WORKSPACE_ID"

# Obter tarefa
test_endpoint "GET" "/tasks/$TASK_1_ID"

# Atualizar tarefa
test_endpoint "PATCH" "/tasks/$TASK_1_ID" \
  "{\"title\":\"Implementar JWT\",\"columnId\":\"$COLUMN_2_ID\",\"priority\":\"Média\",\"completionComment\":\"Completado com sucesso\",\"deadline\":\"2026-05-01T00:00:00Z\"}"

# Atualizar tarefa com tags
test_endpoint "PATCH" "/tasks/$TASK_2_ID" \
  '{"tags":"backend,database","assignedTo":"dev-team"}'

# Deletar tarefa (soft delete)
test_endpoint "DELETE" "/tasks/$TASK_1_ID"

# Verificar que tarefa deletada não aparece na lista
echo -e "${YELLOW}[Teste $((test_count + 1))] GET /tasks/workspace/$WORKSPACE_ID (sem deletadas)${NC}"
response=$(curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/tasks/workspace/$WORKSPACE_ID")
task_count=$(echo "$response" | jq 'length' 2>/dev/null || echo 0)
echo -e "${GREEN}✓ Tarefas não deletadas: $task_count${NC}\n"

# 7. USUÁRIOS
echo -e "${YELLOW}=== 7. USUÁRIOS ===${NC}"

# Listar usuários
test_endpoint "GET" "/users"

# Obter usuário
test_endpoint "GET" "/users/$USER_ID"

# Atualizar usuário
test_endpoint "PATCH" "/users/$USER_ID" \
  "{\"name\":\"Teste User Updated\",\"phone\":\"+55 11 99999-9999\"}"

# 8. LIMPEZA
echo -e "${YELLOW}=== 8. LIMPEZA ===${NC}"

# Deletar coluna
test_endpoint "DELETE" "/columns/$COLUMN_2_ID"

# Deletar workspace
test_endpoint "DELETE" "/workspaces/$WORKSPACE_ID"

# RESUMO
echo -e "${YELLOW}========== RESULTADO DOS TESTES ==========${NC}"
echo -e "Total de testes: $test_count"
echo -e "${GREEN}Passaram: $passed_count${NC}"
echo -e "${RED}Falharam: $((test_count - passed_count))${NC}\n"

if [ $passed_count -eq $test_count ]; then
  echo -e "${GREEN}✓ TODOS OS TESTES PASSARAM!${NC}"
  exit 0
else
  echo -e "${RED}✗ ALGUNS TESTES FALHARAM${NC}"
  exit 1
fi
