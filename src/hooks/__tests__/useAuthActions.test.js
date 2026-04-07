import { renderHook, act } from '@testing-library/react';
import { useAuthActions } from '../useAuthActions';

describe('useAuthActions', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    avatar: ''
  };

  it('should return auth action functions', () => {
    const { result } = renderHook(() =>
      useAuthActions(
        [mockUser],
        jest.fn(),
        mockUser,
        jest.fn(),
        {},
        jest.fn(),
        '',
        jest.fn(),
        'login',
        jest.fn()
      )
    );

    expect(result.current).toHaveProperty('handleAuthSubmit');
    expect(result.current).toHaveProperty('handleLogout');
    expect(result.current).toHaveProperty('saveProfile');
  });

  it('saveProfile should validate form inputs', () => {
    const setAuthError = jest.fn();
    const setCurrentUser = jest.fn();
    const setUsers = jest.fn();

    const { result } = renderHook(() =>
      useAuthActions(
        [mockUser],
        setUsers,
        mockUser,
        setCurrentUser,
        { name: '', email: '', phone: '', avatar: '' },
        jest.fn(),
        '',
        setAuthError,
        'login',
        jest.fn()
      )
    );

    act(() => {
      result.current.saveProfile({ preventDefault: () => {} });
    });

    expect(setAuthError).toHaveBeenCalledWith('Nome é obrigatório');
  });

  it('handleLogout should clear current user', () => {
    const setCurrentUser = jest.fn();

    const { result } = renderHook(() =>
      useAuthActions(
        [mockUser],
        jest.fn(),
        mockUser,
        setCurrentUser,
        {},
        jest.fn(),
        '',
        jest.fn(),
        'login',
        jest.fn()
      )
    );

    act(() => {
      result.current.handleLogout();
    });

    expect(setCurrentUser).toHaveBeenCalledWith(null);
  });

  it('handleAuthSubmit should validate email format', () => {
    const setAuthError = jest.fn();

    const { result } = renderHook(() =>
      useAuthActions(
        [mockUser],
        jest.fn(),
        null,
        jest.fn(),
        { email: 'invalid-email', password: '' },
        jest.fn(),
        '',
        setAuthError,
        'login',
        jest.fn()
      )
    );

    act(() => {
      result.current.handleAuthSubmit({ preventDefault: () => {} });
    });

    expect(setAuthError).toHaveBeenCalled();
  });

  it('password mismatch should show error in saveProfile', () => {
    const setAuthError = jest.fn();

    const { result } = renderHook(() =>
      useAuthActions(
        [mockUser],
        jest.fn(),
        mockUser,
        jest.fn(),
        { 
          name: 'Test User', 
          newPassword: 'pass123', 
          confirmPassword: 'pass456' 
        },
        jest.fn(),
        '',
        setAuthError,
        'login',
        jest.fn()
      )
    );

    act(() => {
      result.current.saveProfile({ preventDefault: () => {} });
    });

    expect(setAuthError).toHaveBeenCalledWith('As senhas não coincidem');
  });
});
