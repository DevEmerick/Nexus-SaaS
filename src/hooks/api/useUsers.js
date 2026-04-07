import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET - Listar todos os usuários
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST - Criar novo usuário
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Erro ao criar usuário');
      const data = await response.json();
      setUsers([...users, data]);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [users]);

  // GET - Obter usuário por ID
  const getUserById = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) throw new Error('Usuário não encontrado');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // PATCH - Atualizar usuário
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Erro ao atualizar usuário');
      const data = await response.json();
      setUsers(users.map(u => u.id === userId ? data : u));
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [users]);

  return { users, loading, error, fetchUsers, createUser, getUserById, updateUser };
};
