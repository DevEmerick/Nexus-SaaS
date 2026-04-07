import { useDispatch, useSelector } from 'react-redux';
import { addUser, updateUser, setCurrentUser, setAuthView, setAuthError, updateAuthForm, resetAuthForm, setUsers } from '../../store/slices/authSlice';
import { generateId } from '../../utils/helpers';

export const useReduxAuth = () => {
  const dispatch = useDispatch();
  const {
    users,
    currentUser,
    authView,
    authError,
    authForm,
  } = useSelector(state => state.auth);

  const handleAuthSubmit = (e) => {
    e?.preventDefault?.();
    
    if (authView === 'login') {
      const userExists = users.find(u => u.email === authForm.email);
      
      if (!userExists) {
        dispatch(setAuthError('Usuário não encontrado'));
        return;
      }

      if (userExists.password !== authForm.password) {
        dispatch(setAuthError('Senha incorreta'));
        return;
      }

      dispatch(setCurrentUser(userExists));
      dispatch(setAuthError(''));
      localStorage.setItem('nexus_current_user', JSON.stringify(userExists));
    } else if (authView === 'register') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        dispatch(setAuthError('Preencha todos os campos'));
        return;
      }

      const emailExists = users.find(u => u.email === authForm.email);
      if (emailExists) {
        dispatch(setAuthError('Email já cadastrado'));
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        dispatch(setAuthError('Senhas não coincidem'));
        return;
      }

      const newUser = {
        id: generateId(),
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
        avatar: '',
        phone: '',
        createdAt: new Date().toISOString(),
        themePreference: 'light',
      };

      dispatch(addUser(newUser));
      dispatch(setCurrentUser(newUser));
      dispatch(setAuthError(''));
      dispatch(resetAuthForm());
      localStorage.setItem('nexus_users', JSON.stringify([...users, newUser]));
      localStorage.setItem('nexus_current_user', JSON.stringify(newUser));
    } else if (authView === 'forgot') {
      const user = users.find(u => u.email === authForm.email);
      if (!user) {
        dispatch(setAuthError('Email não encontrado'));
        return;
      }
      dispatch(setAuthError(''));
      dispatch(setAuthView('reset'));
    } else if (authView === 'reset') {
      if (authForm.password !== authForm.confirmPassword) {
        dispatch(setAuthError('Senhas não coincidem'));
        return;
      }

      const user = users.find(u => u.email === authForm.email);
      const updatedUser = { ...user, password: authForm.password };
      dispatch(updateUser(updatedUser));
      dispatch(setAuthError(''));
      dispatch(resetAuthForm());
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      localStorage.setItem('nexus_users', JSON.stringify(updatedUsers));
      dispatch(setAuthView('login'));
    }
  };

  const handleLogout = () => {
    dispatch(setCurrentUser(null));
    localStorage.removeItem('nexus_current_user');
  };

  const saveProfile = (updates) => {
    const updated = { ...currentUser, ...updates };
    dispatch(updateUser(updated));
    dispatch(setCurrentUser(updated));
    localStorage.setItem('nexus_current_user', JSON.stringify(updated));
    
    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    dispatch(setUsers(updatedUsers));
    localStorage.setItem('nexus_users', JSON.stringify(updatedUsers));
  };

  return {
    handleAuthSubmit,
    handleLogout,
    saveProfile,
    users,
    currentUser,
    authView,
    authError,
    authForm,
  };
};
