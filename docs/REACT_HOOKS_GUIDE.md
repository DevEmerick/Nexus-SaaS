# React Hooks API - Usage Guide

## Overview

All hooks automatically handle JWT authentication by reading from `localStorage.authToken`.

## Available Hooks

### useAuth()
Manage user authentication (register, login, profile)

### useWorkspaces()
Manage workspaces with full CRUD support

### useColumns()
Manage columns within workspaces

### useTasks()
Manage tasks with full feature support

### useUsers()
Manage users (list, get, update)

---

## Examples

### Authentication Workflow

```jsx
import { useAuth } from '@/hooks/api';

function LoginForm() {
  const { isAuthenticated, loading, error, login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      const user = await login(email, password);
      console.log('Logged in as:', user.name);
    } catch (err) {
      console.error('Login failed:', err.message);
    }
  };

  return (
    <div>
      {isAuthenticated && <p>Welcome!</p>}
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {/* form fields and handleLogin call */}
    </div>
  );
}
```

### Workspace Management

```jsx
import { useWorkspaces } from '@/hooks/api';
import { useEffect } from 'react';

function WorkspacesList() {
  const { 
    workspaces, 
    loading, 
    error,
    fetchMyWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  } = useWorkspaces();

  // Load workspaces on component mount
  useEffect(() => {
    fetchMyWorkspaces();
  }, [fetchMyWorkspaces]);

  const handleCreate = async () => {
    const newWorkspace = await createWorkspace(
      'My New Project',
      '#3B82F6'
    );
    console.log('Created:', newWorkspace);
  };

  const handleUpdate = async (workspaceId) => {
    await updateWorkspace(workspaceId, {
      title: 'Updated Title',
      color: '#EC4899'
    });
  };

  const handleDelete = async (workspaceId) => {
    await deleteWorkspace(workspaceId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Workspace</button>
      {workspaces.map(workspace => (
        <div key={workspace.id}>
          <h3>{workspace.title}</h3>
          <button onClick={() => handleUpdate(workspace.id)}>Edit</button>
          <button onClick={() => handleDelete(workspace.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Loading Workspace Details

```jsx
import { useWorkspaces, useColumns } from '@/hooks/api';
import { useEffect } from 'react';

function WorkspaceDetail({ workspaceId }) {
  const { getWorkspaceById, loading: wsLoading } = useWorkspaces();
  const { columns, fetchColumnsByWorkspace } = useColumns();

  useEffect(() => {
    // Load workspace with columns
    getWorkspaceById(workspaceId).then(workspace => {
      console.log('Workspace:', workspace);
    });

    // Alternatively, load columns separately
    fetchColumnsByWorkspace(workspaceId);
  }, [workspaceId, getWorkspaceById, fetchColumnsByWorkspace]);

  if (wsLoading) return <div>Loading...</div>;

  return (
    <div>
      <div>Columns: {columns.length}</div>
      {columns.map(col => (
        <div key={col.id}>
          <h4>{col.title}</h4>
          <p>Position: {col.position}</p>
          <p>Tasks: {col.tasks?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}
```

### Column Management

```jsx
import { useColumns } from '@/hooks/api';

function ColumnManager({ workspaceId }) {
  const { 
    columns, 
    createColumn, 
    updateColumn, 
    deleteColumn 
  } = useColumns();

  const handleCreateColumn = async () => {
    const column = await createColumn(
      'New Column',
      '#8B5CF6',
      workspaceId
      // position auto-assigned if not provided
    );
    console.log('Created column:', column);
  };

  const handleMoveColumn = async (columnId, newPosition) => {
    await updateColumn(columnId, { position: newPosition });
  };

  const handleRenameColumn = async (columnId, newTitle) => {
    await updateColumn(columnId, { title: newTitle });
  };

  return (
    <div>
      <button onClick={handleCreateColumn}>Add Column</button>
      {columns.map((col, idx) => (
        <div key={col.id}>
          <input 
            type="text" 
            defaultValue={col.title}
            onChange={(e) => handleRenameColumn(col.id, e.target.value)}
          />
          <button onClick={() => handleMoveColumn(col.id, idx - 1)}>Up</button>
          <button onClick={() => handleMoveColumn(col.id, idx + 1)}>Down</button>
          <button onClick={() => deleteColumn(col.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Task Management

```jsx
import { useTasks } from '@/hooks/api';
import { useEffect } from 'react';

function TaskBoard({ workspaceId }) {
  const { 
    tasks, 
    loading,
    fetchTasksByWorkspace,
    createTask,
    updateTask,
    deleteTask
  } = useTasks();

  useEffect(() => {
    fetchTasksByWorkspace(workspaceId);
  }, [workspaceId, fetchTasksByWorkspace]);

  const handleCreateTask = async (columnId) => {
    const task = await createTask({
      title: 'New Task',
      description: 'Task description',
      workspaceId,
      columnId,
      priority: 'Média'
    });
    console.log('Created task:', task);
  };

  const handleUpdateTask = async (taskId) => {
    // Update with new values (any subset of fields)
    await updateTask(taskId, {
      title: 'Updated Title',
      priority: 'Alta',
      completionComment: 'In progress',
      assignedTo: 'John Doe',
      deadline: '2026-05-15T00:00:00Z'
    });
  };

  const handleMoveTask = async (taskId, newColumnId) => {
    await updateTask(taskId, { columnId: newColumnId });
  };

  const handleArchiveTask = async (taskId) => {
    await deleteTask(taskId); // Soft delete
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h2>Tasks ({tasks.length})</h2>
      {tasks.map(task => (
        <div key={task.id} className="task-card">
          <h4>{task.title}</h4>
          <p>Priority: {task.priority}</p>
          <p>Assigned to: {task.assignedTo || 'Unassigned'}</p>
          <p>Tags: {task.tags}</p>
          {task.deadline && <p>Due: {new Date(task.deadline).toLocaleDateString()}</p>}
          {task.completionComment && <p>Comment: {task.completionComment}</p>}
          
          <button onClick={() => handleUpdateTask(task.id)}>Edit</button>
          <button onClick={() => handleArchiveTask(task.id)}>Archive</button>
        </div>
      ))}
    </div>
  );
}
```

### User Management

```jsx
import { useUsers, useAuth } from '@/hooks/api';
import { useEffect } from 'react';

function UserProfile() {
  const { user: currentUser } = useAuth();
  const { users, fetchUsers, getUserById, updateUser } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateProfile = async (name, phone) => {
    const updated = await updateUser(currentUser.id, {
      name,
      phone
    });
    console.log('Profile updated:', updated);
  };

  return (
    <div>
      <h2>Team Members ({users.length})</h2>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.name} ({user.email})</p>
          {user.phone && <p>Phone: {user.phone}</p>}
        </div>
      ))}
      
      <h3>My Profile</h3>
      {currentUser && (
        <div>
          <input 
            type="text" 
            defaultValue={currentUser.name}
            onChange={(e) => handleUpdateProfile(e.target.value, currentUser.phone)}
          />
        </div>
      )}
    </div>
  );
}
```

### Error Handling Patterns

```jsx
import { useWorkspaces } from '@/hooks/api';

function SafeWorkspaceList() {
  const { 
    workspaces, 
    loading, 
    error,
    fetchMyWorkspaces
  } = useWorkspaces();

  const handleRetry = () => {
    fetchMyWorkspaces();
  };

  if (loading) {
    return <div className="spinner">Loading workspaces...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Failed to load workspaces: {error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="empty-state">
        <p>No workspaces yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <ul>
      {workspaces.map(ws => (
        <li key={ws.id}>{ws.title}</li>
      ))}
    </ul>
  );
}
```

### Advanced: Batch Operations

```jsx
import { useTasks } from '@/hooks/api';

function BulkUpdateTasks({ taskIds, updates }) {
  const { updateTask, loading } = useTasks();

  const handleBulkUpdate = async () => {
    try {
      const promises = taskIds.map(id => updateTask(id, updates));
      await Promise.all(promises);
      console.log('All tasks updated');
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  return (
    <button onClick={handleBulkUpdate} disabled={loading}>
      {loading ? 'Updating...' : 'Update All'}
    </button>
  );
}
```

---

## Notes

- **Token Management:** All hooks automatically read JWT from `localStorage.authToken`
- **Error Handling:** Each hook returns `error` state for error handling
- **Loading State:** Use `loading` state to show spinners/disabled buttons
- **Auto-refresh:** Call `fetch*()` functions to refresh data
- **State Updates:** Hooks automatically update local state on successful operations
- **Error Boundaries:** Wrap components in error boundaries for production safety

