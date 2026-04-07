// Hook para chamar endpoints da API e sincronizar com a aplicação

// Use a URL dinâmica baseada na origem atual
const getAPIBaseURL = () => {
  // Em desenvolvimento local, pode ser http://localhost:3000
  // Em produção, será o domínio Vercel atual
  return typeof window !== 'undefined' ? window.location.origin : (process.env.REACT_APP_API_URL || '');
};

export const useAPIIntegration = () => {
  const login = async (email, password) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login',
          email, 
          password 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, name, password) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'register',
          email, 
          name, 
          password 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/api/listworkspaces`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Fetch workspaces error:', error);
      return [];
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/api/listtasks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Fetch tasks error:', error);
      return [];
    }
  };

  const fetchColumns = async () => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/api/listcolumns`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch columns');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Fetch columns error:', error);
      return [];
    }
  };

  return {
    login,
    register,
    fetchWorkspaces,
    fetchTasks,
    fetchColumns
  };
};
