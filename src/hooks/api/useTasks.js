import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET - Listar tasks de um workspace
  const fetchTasks = useCallback(async (workspaceId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/workspace/${workspaceId}`);
      if (!response.ok) throw new Error('Erro ao buscar tasks');
      const data = await response.json();
      setTasks(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST - Criar nova task
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Erro ao criar task');
      const data = await response.json();
      setTasks([...tasks, data]);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  // GET - Obter task por ID
  const getTaskById = useCallback(async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`);
      if (!response.ok) throw new Error('Task não encontrada');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // PATCH - Atualizar task
  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Erro ao atualizar task');
      const data = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? data : t));
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  // DELETE - Marcar task como deletada
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar task');
      setTasks(tasks.filter(t => t.id !== taskId));
      return { message: 'Task deletada' };
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  return { 
    tasks, 
    loading, 
    error, 
    fetchTasks, 
    createTask, 
    getTaskById, 
    updateTask, 
    deleteTask 
  };
};
