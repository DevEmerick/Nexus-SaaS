import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  draggedTaskId: null,
  draggedColumnId: null,
  columnMenuOpenId: null,
  renamingColumnId: null,
  renameColumnTitle: '',
  editingColumnId: null,
  selectedTags: [],
  selectedAssignees: [],
  showCompleted: true,
  searchQuery: '',
  currentView: 'board',
  appAlert: null,
  newColumnTitle: '',
  viewMode: 'light',
  notifications: [],
  isPasswordModalOpen: false,
  isEditTaskModalOpen: false,
  isDeleteWorkspaceModalOpen: false,
  isAddMemberModalOpen: false,
  isDeleteAccountModalOpen: false,
  isMemberListModalOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDraggedTaskId: (state, action) => {
      state.draggedTaskId = action.payload;
    },
    setDraggedColumnId: (state, action) => {
      state.draggedColumnId = action.payload;
    },
    setColumnMenuOpenId: (state, action) => {
      state.columnMenuOpenId = action.payload;
    },
    setRenamingColumnId: (state, action) => {
      state.renamingColumnId = action.payload;
    },
    setRenameColumnTitle: (state, action) => {
      state.renameColumnTitle = action.payload;
    },
    setEditingColumnId: (state, action) => {
      state.editingColumnId = action.payload;
    },
    toggleSelectedTag: (state, action) => {
      const tag = action.payload;
      if (state.selectedTags.includes(tag)) {
        state.selectedTags = state.selectedTags.filter(t => t !== tag);
      } else {
        state.selectedTags.push(tag);
      }
    },
    toggleSelectedAssignee: (state, action) => {
      const assignee = action.payload;
      if (state.selectedAssignees.includes(assignee)) {
        state.selectedAssignees = state.selectedAssignees.filter(a => a !== assignee);
      } else {
        state.selectedAssignees.push(assignee);
      }
    },
    setShowCompleted: (state, action) => {
      state.showCompleted = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    setAppAlert: (state, action) => {
      state.appAlert = action.payload;
    },
    setNewColumnTitle: (state, action) => {
      state.newColumnTitle = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setIsPasswordModalOpen: (state, action) => {
      state.isPasswordModalOpen = action.payload;
    },
    setIsEditTaskModalOpen: (state, action) => {
      state.isEditTaskModalOpen = action.payload;
    },
    setIsDeleteWorkspaceModalOpen: (state, action) => {
      state.isDeleteWorkspaceModalOpen = action.payload;
    },
    setIsAddMemberModalOpen: (state, action) => {
      state.isAddMemberModalOpen = action.payload;
    },
    setIsDeleteAccountModalOpen: (state, action) => {
      state.isDeleteAccountModalOpen = action.payload;
    },
    setIsMemberListModalOpen: (state, action) => {
      state.isMemberListModalOpen = action.payload;
    }
  }
});

export const {
  setDraggedTaskId,
  setDraggedColumnId,
  setColumnMenuOpenId,
  setRenamingColumnId,
  setRenameColumnTitle,
  setEditingColumnId,
  toggleSelectedTag,
  toggleSelectedAssignee,
  setShowCompleted,
  setSearchQuery,
  setCurrentView,
  setAppAlert,
  setNewColumnTitle,
  setViewMode,
  addNotification,
  removeNotification,
  setIsPasswordModalOpen,
  setIsEditTaskModalOpen,
  setIsDeleteWorkspaceModalOpen,
  setIsAddMemberModalOpen,
  setIsDeleteAccountModalOpen,
  setIsMemberListModalOpen
} = uiSlice.actions;

export default uiSlice.reducer;
