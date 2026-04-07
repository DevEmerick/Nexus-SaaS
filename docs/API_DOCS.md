# 📚 API Documentation - Nexus SaaS Backend

## 🚀 Getting Started

### 1. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill with your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - Prisma Postgres connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - API port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Migrations

```bash
npx prisma migrate dev
```

### 4. Start the API Server

```bash
node src/api/server.js
```

API will be running at `http://localhost:3001`

---

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication.

### Get a Token

1. **Register** (POST `/api/auth/register`)
2. **Login** (POST `/api/auth/login`)
3. Receive `token` in response
4. Store in `localStorage` as `authToken`

### Use Token in Requests

All protected endpoints require the token in the `Authorization` header:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('http://localhost:3001/api/workspaces/user/123', { headers });
```

---

## 📡 API Endpoints

### Authentication (No token required)

#### Register User
```
POST /api/auth/register
Body: { email, password, name }
Response: { user, token }
```

Example:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John"}'
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

Example:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user }
```

#### Update Profile
```
PATCH /api/auth/me
Headers: Authorization: Bearer {token}
Body: { name?, themePreference? }
Response: { user }
```

#### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
```

---

### Users (Token required)

#### List All Users
```
GET /api/users
Headers: Authorization: Bearer {token}
Response: [ { id, name, email, createdAt }, ... ]
```

#### Get User by ID
```
GET /api/users/:id
Headers: Authorization: Bearer {token}
Response: { id, name, email, themePreference }
```

#### Update User
```
PATCH /api/users/:id
Headers: Authorization: Bearer {token}
Body: { name?, themePreference? }
Response: { user }
```

---

### Workspaces (Token required)

#### List User's Workspaces
```
GET /api/workspaces/user/:userId
Headers: Authorization: Bearer {token}
Response: [ { id, title, color, columns, tasks }, ... ]
```

#### Create Workspace
```
POST /api/workspaces
Headers: Authorization: Bearer {token}
Body: { title, color?, userId }
Response: { id, title, color, userId, ... }
```

#### Get Workspace Details
```
GET /api/workspaces/:id
Headers: Authorization: Bearer {token}
Response: { id, title, color, columns: [ { ...tasks } ], ... }
```

#### Update Workspace
```
PATCH /api/workspaces/:id
Headers: Authorization: Bearer {token}
Body: { title?, color? }
Response: { workspace }
```

#### Delete Workspace
```
DELETE /api/workspaces/:id
Headers: Authorization: Bearer {token}
Response: { message }
```

---

### Tasks (Token required)

#### List Workspace Tasks
```
GET /api/tasks/workspace/:workspaceId
Headers: Authorization: Bearer {token}
Response: [ { id, title, description, columnId, priority, ... }, ... ]
```

#### Create Task
```
POST /api/tasks
Headers: Authorization: Bearer {token}
Body: { title, description?, workspaceId, columnId, priority? }
Response: { id, title, ... }
```

#### Get Task by ID
```
GET /api/tasks/:id
Headers: Authorization: Bearer {token}
Response: { id, title, description, columnId, ... }
```

#### Update Task
```
PATCH /api/tasks/:id
Headers: Authorization: Bearer {token}
Body: { title?, description?, columnId?, priority?, cardColor? }
Response: { task }
```

#### Delete Task (Soft Delete)
```
DELETE /api/tasks/:id
Headers: Authorization: Bearer {token}
Response: { message, task }
```

---

## 🎣 React Hooks Usage

### useAuth

```javascript
import { useAuth } from './hooks/api';

export function LoginComponent() {
  const { handleLogin, handleRegister, user, loading, error } = useAuth();

  const onLogin = async () => {
    const result = await handleLogin('user@example.com', 'password123');
    if (result.success) {
      console.log('Logged in:', result.user);
    }
  };

  return (
    <div>
      {user && <p>Welcome, {user.name}</p>}
      <button onClick={onLogin} disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### useWorkspaces

```javascript
import { useWorkspaces } from './hooks/api';

export function WorkspacesComponent() {
  const { workspaces, fetchWorkspaces, createWorkspace, loading } = useWorkspaces();

  useEffect(() => {
    fetchWorkspaces('user-id-here');
  }, []);

  const createNew = async () => {
    const result = await createWorkspace({
      title: 'New Workspace',
      color: 'indigo',
      userId: 'user-id-here'
    });
    if (result) console.log('Created:', result);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {workspaces.map(ws => (
        <div key={ws.id}>{ws.title}</div>
      ))}
      <button onClick={createNew}>Create Workspace</button>
    </div>
  );
}
```

### useTasks

```javascript
import { useTasks } from './hooks/api';

export function TasksComponent({ workspaceId }) {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

  useEffect(() => {
    fetchTasks(workspaceId);
  }, [workspaceId]);

  const addTask = async () => {
    await createTask({
      title: 'New Task',
      workspaceId,
      columnId: 'column-id',
      priority: 'Média'
    });
  };

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          {task.title} - {task.priority}
        </div>
      ))}
      <button onClick={addTask}>Add Task</button>
    </div>
  );
}
```

---

## 🧪 Testing with cURL

### Get a token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -s | jq '.token' -r > token.txt

TOKEN=$(cat token.txt)
```

### Use the token
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Database Schema

See `prisma/schema.prisma` for the complete database schema.

Models:
- **User** - Users with email, password, name, preferences
- **Workspace** - Projects/workspaces owned by users
- **Column** - Columns within workspaces (Kanban)
- **Task** - Tasks within columns with priority, deadline, etc.

---

## 🔒 Security Notes

- ✅ Passwords are hashed with bcryptjs
- ✅ All protected endpoints require JWT
- ✅ CORS is configured for frontend URLs
- ✅ Tokens expire after 7 days
- ⚠️ Change `JWT_SECRET` in production!
- ⚠️ Use HTTPS in production
- ⚠️ Store tokens in `httpOnly` cookies in production (not localStorage)

---

## 🐛 Error Handling

All endpoints return proper HTTP status codes:

```
200 OK - Success
201 Created - Resource created
400 Bad Request - Invalid input
401 Unauthorized - Missing/invalid token
404 Not Found - Resource not found
409 Conflict - Email already exists
500 Internal Server Error - Server error
```

Error response format:
```json
{
  "error": "Description of the error"
}
```

---

## 📝 Environment Variables in Production

When deploying to Vercel, set these in the Vercel dashboard:

```
DATABASE_URL = postgresql://...
JWT_SECRET = (generate a strong random string)
PORT = 3001
FRONTEND_URL = https://your-domain.com
NODE_ENV = production
```

---

For more information, check `src/api/` directory.
