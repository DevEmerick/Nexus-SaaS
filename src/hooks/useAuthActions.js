import { generateId } from '../utils/helpers';

// Use a URL dinâmica baseada na origem atual
const getAPIBaseURL = () => {
  // Em desenvolvimento local, pode ser http://localhost:3000
  // Em produção, será o domínio Vercel atual
  return typeof window !== 'undefined' ? window.location.origin : (process.env.REACT_APP_API_URL || '');
};

export const useAuthActions = (
  users, setUsers,
  currentUser, setCurrentUser,
  authForm, setAuthForm,
  authError, setAuthError,
  authView, setAuthView,
  onLoginSuccess = null // Callback quando login é bem-sucedido
) => {

  const saveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (authForm.newPassword && authForm.newPassword !== authForm.confirmPassword) {
      setAuthError('As senhas não coincidem');
      return;
    }

    // Validações básicas
    if (!authForm.name.trim()) {
      setAuthError('Nome é obrigatório');
      return;
    }

    // Atualizar usuário
    const updatedUser = { ...currentUser, ...authForm };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    setAuthForm({ name: '', email: '', phone: '', avatar: '', currentPassword: '', newPassword: '' });
    setAuthError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authView === 'login') {
      try {
        // Tentar login via API
        const response = await fetch(`${getAPIBaseURL()}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'login',
            email: authForm.email, 
            password: authForm.password 
          })
        });

        if (response.ok) {
          const data = await response.json();
          const apiUser = data.user || data.data;
          setCurrentUser(apiUser);
          setUsers(prev => {
            const exists = prev.some(u => u.id === apiUser.id);
            return exists ? prev : [...prev, apiUser];
          });
          setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
          
          // Chamar callback para carregar workspaces
          if (onLoginSuccess) {
            onLoginSuccess(apiUser);
          }
          return;
        }
      } catch (error) {
        console.warn('API login failed, falling back to localStorage:', error);
      }

      // Fallback: verificar no localStorage
      const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (!user) {
        setAuthError('E-mail ou senha incorretos');
        return;
      }
      setCurrentUser(user);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } else {
      // Registro
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('As senhas não coincidem');
        return;
      }

      if (!authForm.email.includes('@')) {
        setAuthError('E-mail inválido');
        return;
      }

      if (authForm.password.length < 4) {
        setAuthError('Senha deve ter pelo menos 4 caracteres');
        return;
      }

      try {
        // Tentar register via API
        const response = await fetch(`${getAPIBaseURL()}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email: authForm.email,
            name: authForm.name || authForm.email.split('@')[0],
            password: authForm.password
          })
        });

        if (response.ok) {
          const data = await response.json();
          const apiUser = data.user || data.data;
          setCurrentUser(apiUser);
          setUsers(prev => [...prev, apiUser]);
          setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
          
          if (onLoginSuccess) {
            onLoginSuccess(apiUser);
          }
          return;
        }
      } catch (error) {
        console.warn('API register failed, falling back to localStorage:', error);
      }

      // Fallback: verificar no localStorage
      if (users.some(u => u.email === authForm.email)) {
        setAuthError('E-mail já registrado');
        return;
      }

      const newUser = {
        id: generateId(),
        name: authForm.name || authForm.email.split('@')[0],
        email: authForm.email,
        password: authForm.password,
        avatar: '',
        phone: '',
        themePreference: 'light'
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
      
      if (onLoginSuccess) {
        onLoginSuccess(newUser);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    setAuthError('');
  };

  return {
    saveProfile,
    handleAuthSubmit,
    handleLogout
  };
};
