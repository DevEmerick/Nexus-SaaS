#!/bin/bash

# Script para limpar e popular o banco de dados do Nexus SaaS
# Uso: ./manage-db.sh [clean|seed|clean-seed]

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLEAN_SCRIPT="$BASE_DIR/scripts/clean-db.mjs"
SEED_SCRIPT="$BASE_DIR/scripts/seed-db.mjs"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NEXUS SAAS - DATABASE MANAGER    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}\n"

# Verificar se NODE_OPTIONS está configurado corretamente
export NODE_OPTIONS="--loader ./node_modules/.bin/tsx-esm" 2>/dev/null || true

# Função para limpar
clean() {
  echo -e "${YELLOW}⚠️  Você tem certeza que quer LIMPAR TODO O BANCO?${NC}"
  echo -e "${RED}Esta ação é IRREVERSÍVEL!${NC}"
  read -p "Digite 'SIM' para confirmar: " confirm
  
  if [ "$confirm" = "SIM" ]; then
    echo -e "\n${RED}Limpando banco de dados...${NC}"
    node --input-type=module --eval "$(cat $CLEAN_SCRIPT)"
  else
    echo -e "${BLUE}Operação cancelada.${NC}"
  fi
}

# Função para popular
seed() {
  echo -e "\n${GREEN}Populando banco de dados com dados de exemplo...${NC}"
  node --input-type=module --eval "$(cat $SEED_SCRIPT)"
}

# Função para limpar e popular
clean_seed() {
  echo -e "${YELLOW}⚠️  Você tem certeza que quer LIMPAR E REPOVOAR O BANCO?${NC}"
  read -p "Digite 'SIM' para confirmar: " confirm
  
  if [ "$confirm" = "SIM" ]; then
    clean
    seed
  else
    echo -e "${BLUE}Operação cancelada.${NC}"
  fi
}

# Processar argumentos
case ${1:-clean-seed} in
  clean)
    clean
    ;;
  seed)
    seed
    ;;
  clean-seed)
    clean_seed
    ;;
  *)
    echo -e "${YELLOW}Uso: ./manage-db.sh [clean|seed|clean-seed]${NC}"
    echo ""
    echo "Opções:"
    echo "  clean      - Limpar todo o banco de dados"
    echo "  seed       - Popular banco com dados de exemplo"
    echo "  clean-seed - Limpar e popular banco (padrão)"
    exit 1
    ;;
esac
