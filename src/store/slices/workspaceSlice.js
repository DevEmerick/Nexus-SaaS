import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workspaces: [],
  activeWorkspaceId: null,
  newWorkspaceTitle: '',
  newWorkspaceColor: 'indigo',
  editingWorkspaceForm: {
    id: '',
    title: '',
    color: 'indigo',
    members: [],
    tags: []
  },
  isNewWorkspaceModalOpen: false,
  isEditWorkspaceModalOpen: false,
  deleteConfirmation: null,
  deleteTrashConfirmation: null
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);
    },
    updateWorkspace: (state, action) => {
      const index = state.workspaces.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = action.payload;
      }
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
    },
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    setActiveWorkspaceId: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    setNewWorkspaceTitle: (state, action) => {
      state.newWorkspaceTitle = action.payload;
    },
    setNewWorkspaceColor: (state, action) => {
      state.newWorkspaceColor = action.payload;
    },
    setEditingWorkspaceForm: (state, action) => {
      state.editingWorkspaceForm = action.payload;
    },
    setIsNewWorkspaceModalOpen: (state, action) => {
      state.isNewWorkspaceModalOpen = action.payload;
    },
    setIsEditWorkspaceModalOpen: (state, action) => {
      state.isEditWorkspaceModalOpen = action.payload;
    },
    setDeleteConfirmation: (state, action) => {
      state.deleteConfirmation = action.payload;
    },
    setDeleteTrashConfirmation: (state, action) => {
      state.deleteTrashConfirmation = action.payload;
    }
  }
});

export const {
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  setWorkspaces,
  setActiveWorkspaceId,
  setNewWorkspaceTitle,
  setNewWorkspaceColor,
  setEditingWorkspaceForm,
  setIsNewWorkspaceModalOpen,
  setIsEditWorkspaceModalOpen,
  setDeleteConfirmation,
  setDeleteTrashConfirmation
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
