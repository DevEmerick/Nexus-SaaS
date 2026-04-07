import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET - Listar workspaces de um usuário
  const fetchWorkspaces = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/user/${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar workspaces');
      const data = await response.json();
      setWorkspaces(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST - Criar novo workspace
  const createWorkspace = useCallback(async (workspaceData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspaceData)
      });
      if (!response.ok) throw new Error('Erro ao criar workspace');
      const data = await response.json();
      setWorkspaces([...workspaces, data]);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaces]);

  // GET - Obter workspace por ID
  const getWorkspaceById = useCallback(async (workspaceId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/${workspaceId}`);
      if (!response.ok) throw new Error('Workspace não encontrado');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // PATCH - Atualizar workspace
  const updateWorkspace = useCallback(async (workspaceId, workspaceData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspaceData)
      });
      if (!response.ok) throw new Error('Erro ao atualizar workspace');
      const data = await response.json();
      setWorkspaces(workspaces.map(w => w.id === workspaceId ? data : w));
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaces]);

  // DELETE - Deletar workspace
  const deleteWorkspace = useCallback(async (workspaceId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar workspace');
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
      return { message: 'Workspace deletado' };
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaces]);

  return { 
    workspaces, 
    loading, 
    error, 
    fetchWorkspaces, 
    createWorkspace, 
    getWorkspaceById, 
    updateWorkspace, 
    deleteWorkspace 
  };
};
