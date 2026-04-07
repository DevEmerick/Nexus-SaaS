import { generateId } from '../utils/helpers';

export const useAuthActions = (
  users, setUsers,
  currentUser, setCurrentUser,
  authForm, setAuthForm,
  authError, setAuthError,
  authView, setAuthView
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

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authView === 'login') {
      const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (!user) {
        setAuthError('E-mail ou senha incorretos');
        return;
      }
      setCurrentUser(user);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
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
