# 📊 Database Management Scripts

Scripts para gerenciar o banco de dados Nexus SaaS - limpar, popular e resetar com dados de exemplo.

## 🚀 Uso Rápido

```bash
# Limpar todo o banco de dados
npm run db:clean

# Popular banco com dados de exemplo
npm run db:seed

# Limpar e popular (reset completo)
npm run db:reset
```

## 📝 Scripts Disponíveis

### 1. `npm run db:clean` 
**Deleta TODOS os dados do banco**

- Deleta todas as tasks
- Deleta todas as colunas
- Deleta todos os workspaces
- Deleta todos os usuários

⚠️ **Irreversível!** Use com cuidado.

### 2. `npm run db:seed`
**Popula banco com dados de exemplo**

Cria um fluxo completo:
- **Usuário**: emerick / emerick@gmail.com (senha: emerick)
- **Workspace**: "Projeto Nexus" (cor: indigo)
- **Colunas**: 
  - To Do (vermelha)
  - In Progress (laranja)
  - Done (verde)
- **Tasks** (7 total):
  - **To Do** (2 tasks):
    - "Implementar autenticação JWT" - Alta prioridade, prazo em 7 dias
    - "Criar documentação da API" - Média prioridade, prazo em 10 dias
  - **In Progress** (2 tasks):
    - "Refatorar componentes React" - Média prioridade, 70% completo
    - "Otimizar queries do banco" - Alta prioridade, prazo em 3 dias
  - **Done** (3 tasks):
    - "Setup do projeto inicial" ✅
    - "Implementar Sistema CRUD de APIs" ✅ (com comment sobre 15 testes)
    - "Testes abrangentes da API" ✅

### 3. `npm run db:reset`
**Executa clean + seed**

```bash
# Equivalente a:
npm run db:clean && npm run db:seed
```

## 🛠️ Scripts de Linha de Comando

### Usando Bash Script

```bash
# Modo interativo com confirmação
./manage-db.sh              # clean-seed (padrão)
./manage-db.sh clean        # Limpar apenas
./manage-db.sh seed         # Popular apenas
./manage-db.sh clean-seed   # Limpar e popular
```

### Usando Node.js Direto

```bash
# Limpar
node scripts/clean-db.mjs

# Popular
node scripts/seed-db.mjs
```

## 📊 Dados de Exemplo

### Usuário de Teste
- **Nome**: Emerick
- **Email**: emerick@gmail.com
- **Senha**: emerick
- **Tema**: Dark

### Estrutura de Teste
```
Projeto Nexus (Workspace)
├── To Do (Coluna - Vermelho)
│   ├── Implementar autenticação JWT
│   └── Criar documentação da API
├── In Progress (Coluna - Laranja)
│   ├── Refatorar componentes React (70% done)
│   └── Otimizar queries do banco
└── Done (Coluna - Verde)
    ├── Setup do projeto inicial ✓
    ├── Implementar Sistema CRUD de APIs ✓
    └── Testes abrangentes da API ✓
```

## 🎯 Use Cases

### Para Testes de UI
```bash
npm run db:reset  # Pegar estado limpo e populado
```

### Para Desenvolvimento
```bash
npm run db:seed   # Manter dados atuais, adicionar dados de teste
```

### Para Resetar Após Testes
```bash
npm run db:clean  # Voltar a estado vazio
```

## ⚙️ Detalhes Técnicos

- **Linguagem**: Node.js com ES Modules (.mjs)
- **ORM**: Prisma v5
- **Banco**: PostgreSQL (Vercel Postgres)
- **Segurança**: Senhas hasheadas com bcryptjs (salt 10 rounds)

## 🚨 Avisos

1. Scripts usam Prisma direto - conexão com banco real
2. `db:clean` é **permanente** - sem undo possível
3. Confirme sempre ao rodar clean/reset
4. Use em banco de desenvolvimento apenas

## 📚 Relacionados

- [Prisma Docs](https://www.prisma.io/docs/)
- [CRUD API](../api/) - Endpoints da API
- [Test Suite](../test-comprehensive-crud.sh) - Testes da API
