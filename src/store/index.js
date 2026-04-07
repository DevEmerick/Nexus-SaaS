import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import taskReducer from './slices/taskSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    task: taskReducer,
    ui: uiReducer
  }
});

export default store;
