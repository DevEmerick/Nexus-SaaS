import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  authView: 'login',
  authError: '',
  authForm: {
    name: '',
    email: '',
    phone: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    password: ''
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setAuthView: (state, action) => {
      state.authView = action.payload;
    },
    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
    updateAuthForm: (state, action) => {
      state.authForm = { ...state.authForm, ...action.payload };
    },
    resetAuthForm: (state) => {
      state.authForm = initialState.authForm;
      state.authError = '';
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    }
  }
});

export const {
  addUser,
  updateUser,
  setCurrentUser,
  setAuthView,
  setAuthError,
  updateAuthForm,
  resetAuthForm,
  setUsers
} = authSlice.actions;

export default authSlice.reducer;
