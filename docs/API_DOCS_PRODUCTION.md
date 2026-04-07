# API Documentation - Production Ready

**Last Updated:** April 7, 2026  
**Status:** ✅ Production Ready - All endpoints tested and validated

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require a Bearer token in the `Authorization` header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Endpoints Summary

### 1. Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate and get JWT token
- `GET /auth/me` - Get current user profile
- `PATCH /auth/me` - Update current user profile

### 2. Workspaces
- `GET /workspaces/my` - List all workspaces for authenticated user
- `POST /workspaces` - Create new workspace (userId auto-filled from JWT)
- `GET /workspaces/:id` - Get workspace with all columns and tasks
- `PATCH /workspaces/:id` - Update workspace (title, color)
- `DELETE /workspaces/:id` - Delete workspace (cascade delete to columns/tasks)

### 3. Columns
- `GET /columns/workspace/:workspaceId` - List all columns in a workspace
- `POST /columns` - Create new column (requires workspaceId, auto-assigns position)
- `GET /columns/:id` - Get specific column details
- `PATCH /columns/:id` - Update column (title, color, position)
- `DELETE /columns/:id` - Delete column (soft deletes associated tasks)

### 4. Tasks
- `GET /tasks/workspace/:workspaceId` - List all tasks in a workspace (excludes soft deleted)
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task (see supported fields below)
- `DELETE /tasks/:id` - Soft delete task (sets deletedAt timestamp)

### 5. Users
- `GET /users` - List all users
- `GET /users/:id` - Get specific user
- `PATCH /users/:id` - Update user

---

## 🔐 Authentication Endpoints

### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "User Name"
}

Response (201):
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": "cmnoyf71b00019q5nfaqsejv0",
    "email": "user@example.com",
    "name": "User Name",
    "themePreference": "dark"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "message": "Login realizado com sucesso",
  "user": { id, email, name, themePreference },
  "token": "JWT_TOKEN"
}
```

### Get Current User
```bash
GET /auth/me
Authorization: Bearer JWT_TOKEN

Response (200):
{
  "user": {
    "id": "cmnoyf71b00019q5nfaqsejv0",
    "email": "user@example.com",
    "name": "User Name",
    "themePreference": "dark",
    "createdAt": "2026-04-07T18:29:30.479Z"
  }
}
```

---

## 📁 Workspace Endpoints

### List My Workspaces
```bash
GET /workspaces/my
Authorization: Bearer JWT_TOKEN

Response (200):
[
  {
    "id": "cmnoyhfc10001obtdwd4xg19x",
    "title": "Production MVP",
    "color": "#10B981",
    "userId": "cmnoyf71b00019q5nfaqsejv0",
    "createdAt": "2026-04-07T18:31:52.033Z",
    "updatedAt": "2026-04-07T18:31:52.033Z",
    "columns": [],
    "tasks": []
  }
]
```

### Create Workspace
```bash
POST /workspaces
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Project Name",
  "color": "#3B82F6"  // Optional, defaults to #6366f1
}

Response (201):
{
  "id": "cmnoyhfc10001obtdwd4xg19x",
  "title": "Project Name",
  "color": "#3B82F6",
  "userId": "cmnoyf71b00019q5nfaqsejv0",  // Auto-filled from JWT
  "createdAt": "2026-04-07T18:31:52.033Z",
  "updatedAt": "2026-04-07T18:31:52.033Z",
  "columns": []
}
```

### Get Workspace
```bash
GET /workspaces/:id
Authorization: Bearer JWT_TOKEN

Response (200): Full workspace with columns and tasks
{
  "id": "cmnoyhfc10001obtdwd4xg19x",
  "title": "Production MVP",
  "columns": [
    {
      "id": "cmnoyjdyf0003obtdhn4g6wd1",
      "title": "To Do",
      "color": "#3B82F6",
      "position": 1,
      "tasks": [...]
    }
  ]
}

Response (403): If user doesn't own the workspace
{
  "error": "Sem permissão para acessar este workspace"
}
```

### Update Workspace
```bash
PATCH /workspaces/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Project Name",
  "color": "#EC4899"
}

Response (200): Updated workspace
```

### Delete Workspace
```bash
DELETE /workspaces/:id
Authorization: Bearer JWT_TOKEN

Response (200):
{
  "message": "Workspace deletado com sucesso"
}
```

---

## 📊 Column Endpoints

### List Columns
```bash
GET /columns/workspace/:workspaceId
Authorization: Bearer JWT_TOKEN

Response (200):
[
  {
    "id": "cmnoyjdyf0003obtdhn4g6wd1",
    "title": "To Do",
    "color": "#3B82F6",
    "workspaceId": "cmnoyhfc10001obtdwd4xg19x",
    "position": 1,
    "createdAt": "2026-04-07T18:33:23.559Z",
    "updatedAt": "2026-04-07T18:33:23.559Z",
    "tasks": [...]
  }
]
```

### Create Column
```bash
POST /columns
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "To Do",
  "color": "#3B82F6",              // Optional, defaults to #6366f1
  "workspaceId": "workspace-id",   // Required
  "position": 1                     // Optional, auto-assigned if not provided
}

Response (201): Created column
{
  "id": "cmnoyjdyf0003obtdhn4g6wd1",
  "title": "To Do",
  "color": "#3B82F6",
  "workspaceId": "cmnoyhfc10001obtdwd4xg19x",
  "position": 1,
  "createdAt": "2026-04-07T18:33:23.559Z"
}
```

### Get Column
```bash
GET /columns/:id
Authorization: Bearer JWT_TOKEN

Response (200): Column with tasks
{
  "id": "cmnoyjdyf0003obtdhn4g6wd1",
  "title": "To Do",
  "tasks": [...]
}
```

### Update Column
```bash
PATCH /columns/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "color": "#8B5CF6",
  "position": 2
}

Response (200): Updated column
```

### Delete Column
```bash
DELETE /columns/:id
Authorization: Bearer JWT_TOKEN

Response (200):
{
  "message": "Coluna deletada com sucesso"
}
```

---

## ✓ Task Endpoints

### List Tasks
```bash
GET /tasks/workspace/:workspaceId
Authorization: Bearer JWT_TOKEN

Response (200):
[
  {
    "id": "cmnoyjyrk0005obtdli2ftqlb",
    "title": "Deploy Vercel Production",
    "description": "Deploy para produção",
    "workspaceId": "cmnoyhfc10001obtdwd4xg19x",
    "columnId": "cmnoyjdyf0003obtdhn4g6wd1",
    "priority": "Crítica",
    "deadline": "2026-05-15T00:00:00.000Z",
    "completionComment": "Pronto para produção",
    "assignedTo": "DevOps Team",
    "tags": "devops,production",
    "cardColor": "slate",
    "deletedAt": null,
    "createdAt": "2026-04-07T18:33:50.330Z",
    "updatedAt": "2026-04-07T18:34:05.590Z"
  }
]
```

### Create Task
```bash
POST /tasks
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Task Title",                    // Required
  "description": "Task description",       // Optional
  "workspaceId": "workspace-id",           // Required
  "columnId": "column-id",                 // Required
  "priority": "Alta"                       // Optional, defaults to 'Média'
}

Response (201): Created task
{
  "id": "cmnoyjyrk0005obtdli2ftqlb",
  "title": "Task Title",
  "workspaceId": "cmnoyhfc10001obtdwd4xg19x",
  "columnId": "cmnoyjdyf0003obtdhn4g6wd1",
  "priority": "Média",
  "deadline": null,
  "completionComment": null,
  "assignedTo": null,
  "tags": "",
  "cardColor": "slate",
  "deletedAt": null,
  "createdAt": "2026-04-07T18:33:50.330Z"
}
```

### Update Task (All Fields Supported)
```bash
PATCH /tasks/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "columnId": "new-column-id",
  "priority": "Alta",
  "cardColor": "blue",
  "completionComment": "Completada com sucesso",
  "deadline": "2026-05-15T00:00:00Z",
  "tags": "tag1,tag2",
  "assignedTo": "User Name"
}

Response (200): Updated task with all new values
{
  "id": "cmnoyjyrk0005obtdli2ftqlb",
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "Alta",
  "completionComment": "Completada com sucesso",
  "deadline": "2026-05-15T00:00:00.000Z",
  "tags": "tag1,tag2",
  "assignedTo": "User Name",
  ...
}
```

### Delete Task (Soft Delete)
```bash
DELETE /tasks/:id
Authorization: Bearer JWT_TOKEN

Response (200):
{
  "message": "Task deletada",
  "task": {
    "id": "cmnoyjyrk0005obtdli2ftqlb",
    "deletedAt": "2026-04-07T18:34:27.171Z",
    ...
  }
}
```

---

## 👥 User Endpoints

### List Users
```bash
GET /users
Authorization: Bearer JWT_TOKEN

Response (200): Array of users
```

### Get User
```bash
GET /users/:id
Authorization: Bearer JWT_TOKEN

Response (200): User object
```

### Update User
```bash
PATCH /users/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "New Name",
  "phone": "+55 11 99999-9999"
}

Response (200): Updated user
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "error": "título é obrigatório"
}
```

### Authentication Errors (401)
```json
{
  "error": "Token não fornecido. Use Bearer token no header Authorization"
}
```

### Authorization Errors (403)
```json
{
  "error": "Sem permissão para acessar este workspace"
}
```

### Not Found (404)
```json
{
  "error": "Workspace não encontrado"
}
```

### Server Errors (500)
```json
{
  "error": "Error message from database or server"
}
```

---

## ✅ Test Results

**Date:** April 7, 2026  
**Status:** All endpoints tested and working

### Tested Endpoints
- ✅ Authentication (register, login, get me)
- ✅ Workspaces (CRUD, authorization checks)
- ✅ Columns (CRUD, position management)
- ✅ Tasks (CRUD with all fields, soft delete)
- ✅ Authorization (403 for unauthorized access)
- ✅ Validation (400 for missing required fields)
- ✅ JWT token extraction and verification

### Key Features Validated
- ✅ JWT authentication with 7-day expiration
- ✅ Password hashing with bcryptjs
- ✅ Authorization checks (users can only access own workspaces)
- ✅ Soft deletes for tasks (deletedAt field)
- ✅ Cascade operations (delete workspace deletes columns/tasks)
- ✅ Auto-assignment of IDs and positions
- ✅ Comprehensive error handling

---

## 🚀 Production Deployment Checklist

- [ ] Change JWT_SECRET in environment variables (use strong random string)
- [ ] Set FRONTEND_URL environment variable for CORS
- [ ] Database connection pooling configured
- [ ] Rate limiting implemented (if needed)
- [ ] Logging and monitoring setup
- [ ] SSL/TLS certificates configured
- [ ] Backup strategy for database
- [ ] Horizontal scaling plan ready

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Soft deletes: Tasks have `deletedAt` field, queries automatically exclude deleted tasks
- Cascade deletes: Deleting a workspace deletes associated columns, deleting a column soft-deletes associated tasks
- Position management: Columns auto-assign position based on creation order
- Authorization: All endpoints verify user ownership before allowing modifications

