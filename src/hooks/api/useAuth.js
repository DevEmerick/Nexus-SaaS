import { useState, useCallback, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar token do localStorage ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      // Tentar buscar usuário autenticado
      getCurrentUser(savedToken);
    }
  }, []);

  // GET - Obter usuário autenticado
  const getCurrentUser = useCallback(async (authToken) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken || token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar usuário');
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      // Se token inválido, limpar
      localStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // POST - Registrar novo usuário
  const handleRegister = useCallback(async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar');
      }

      const data = await response.json();
      
      // Salvar token e usuário
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // POST - Login
  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const data = await response.json();

      // Salvar token e usuário
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // POST - Logout
  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Limpar token e usuário
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [token]);

  // PATCH - Atualizar perfil do usuário
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const data = await response.json();
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    // Estado
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Métodos
    handleRegister,
    handleLogin,
    handleLogout,
    getCurrentUser,
    updateProfile
  };
};
