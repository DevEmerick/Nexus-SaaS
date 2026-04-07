import { useState, useCallback, useEffect } from 'react';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Hook para gerenciar workspaces
 * Usa o token JWT do localStorage automaticamente
 */
export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // GET - Listar meus workspaces (novo endpoint /my)
  const fetchMyWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/workspaces/my`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar workspaces');
      const data = await response.json();
      setWorkspaces(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // POST - Criar novo workspace
  const createWorkspace = useCallback(async (title, color) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, color })
      });
      if (!response.ok) throw new Error('Erro ao criar workspace');
      const data = await response.json();
      setWorkspaces([...workspaces, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaces, getAuthHeaders]);

  // GET - Obter workspace por ID (com colunas e tarefas)
  const getWorkspaceById = useCallback(async (workspaceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar workspace');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // PATCH - Atualizar workspace
  const updateWorkspace = useCallback(async (workspaceId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Erro ao atualizar workspace');
      const data = await response.json();
      setWorkspaces(workspaces.map(w => w.id === workspaceId ? data : w));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaces, getAuthHeaders]);

  // DELETE - Deletar workspace
  const deleteWorkspace = useCallback(async (workspaceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao deletar workspace');
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaces, getAuthHeaders]);

  return {
    workspaces,
    loading,
    error,
    fetchMyWorkspaces,
    createWorkspace,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace
  };
};

/**
 * Hook para gerenciar colunas
 */
export const useColumns = () => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // GET - Listar colunas de um workspace
  const fetchColumnsByWorkspace = useCallback(async (workspaceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/columns/workspace/${workspaceId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar colunas');
      const data = await response.json();
      setColumns(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // POST - Criar nova coluna
  const createColumn = useCallback(async (title, color, workspaceId, position) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/columns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, color, workspaceId, position })
      });
      if (!response.ok) throw new Error('Erro ao criar coluna');
      const data = await response.json();
      setColumns([...columns, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [columns, getAuthHeaders]);

  // PATCH - Atualizar coluna
  const updateColumn = useCallback(async (columnId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/columns/${columnId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Erro ao atualizar coluna');
      const data = await response.json();
      setColumns(columns.map(c => c.id === columnId ? data : c));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [columns, getAuthHeaders]);

  // DELETE - Deletar coluna
  const deleteColumn = useCallback(async (columnId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/columns/${columnId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao deletar coluna');
      setColumns(columns.filter(c => c.id !== columnId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [columns, getAuthHeaders]);

  return {
    columns,
    loading,
    error,
    fetchColumnsByWorkspace,
    createColumn,
    updateColumn,
    deleteColumn
  };
};

/**
 * Hook para gerenciar tarefas
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // GET - Listar tarefas de um workspace
  const fetchTasksByWorkspace = useCallback(async (workspaceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tasks/workspace/${workspaceId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar tarefas');
      const data = await response.json();
      setTasks(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // POST - Criar nova tarefa
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Erro ao criar tarefa');
      const data = await response.json();
      setTasks([...tasks, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, getAuthHeaders]);

  // GET - Obter tarefa por ID
  const getTaskById = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar tarefa');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // PATCH - Atualizar tarefa (suporta todos os campos)
  const updateTask = useCallback(async (taskId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Erro ao atualizar tarefa');
      const data = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? data : t));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, getAuthHeaders]);

  // DELETE - Deletar tarefa (soft delete)
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao deletar tarefa');
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, getAuthHeaders]);

  // Usar setTasks para manipulação manual de estado se necessário
  const setTasksState = useCallback((updater) => {
    if (typeof updater === 'function') {
      setTasks(prevTasks => updater(prevTasks));
    } else {
      setTasks(updater);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasksByWorkspace,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    setTasks: setTasksState
  };
};

/**
 * Hook para gerenciar usuários
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // GET - Listar todos os usuários
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      const data = await response.json();
      setUsers(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // GET - Obter usuário por ID
  const getUserById = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar usuário');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // PATCH - Atualizar usuário
  const updateUser = useCallback(async (userId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Erro ao atualizar usuário');
      const data = await response.json();
      setUsers(users.map(u => u.id === userId ? data : u));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, getAuthHeaders]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    updateUser
  };
};
