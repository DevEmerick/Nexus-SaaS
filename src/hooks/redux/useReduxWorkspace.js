import { useDispatch, useSelector } from 'react-redux';
import {
  setWorkspaces,
  setActiveWorkspaceId,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  setEditingWorkspaceForm,
  setEditingWorkspaceModal,
} from '../../store/slices/workspaceSlice';
import { generateId } from '../../utils/helpers';

export const useReduxWorkspace = () => {
  const dispatch = useDispatch();
  const {
    workspaces,
    activeWorkspaceId,
    editingWorkspaceForm,
    isEditingWorkspaceOpen,
  } = useSelector(state => state.workspace);
  const { currentUser } = useSelector(state => state.auth);

  const handleCreateWorkspace = (title, color) => {
    if (!title.trim()) return;

    const newWorkspace = {
      id: generateId(),
      title,
      color,
      userId: currentUser?.id,
      members: currentUser ? [{ userId: currentUser.id, role: 'admin' }] : [],
      tags: [
        { id: generateId(), label: 'Urgente', color: 'rose' },
        { id: generateId(), label: 'Pesquisa', color: 'cyan' }
      ],
      createdAt: new Date().toISOString(),
    };

    dispatch(addWorkspace(newWorkspace));
    const updatedWorkspaces = [...workspaces, newWorkspace];
    localStorage.setItem('nexus_workspaces', JSON.stringify(updatedWorkspaces));
  };

  const handleSelectWorkspace = (workspaceId) => {
    dispatch(setActiveWorkspaceId(workspaceId));
    localStorage.setItem('nexus_active_workspace', workspaceId);
  };

  const handleDeleteWorkspace = (workspaceId) => {
    dispatch(deleteWorkspace(workspaceId));
    const updated = workspaces.filter(w => w.id !== workspaceId);
    localStorage.setItem('nexus_workspaces', JSON.stringify(updated));
    
    if (activeWorkspaceId === workspaceId) {
      const nextWorkspace = updated[0];
      if (nextWorkspace) {
        dispatch(setActiveWorkspaceId(nextWorkspace.id));
        localStorage.setItem('nexus_active_workspace', nextWorkspace.id);
      } else {
        dispatch(setActiveWorkspaceId(null));
        localStorage.removeItem('nexus_active_workspace');
      }
    }
  };

  const handleUpdateWorkspace = (updates) => {
    const updated = { ...editingWorkspaceForm, ...updates };
    dispatch(updateWorkspace(updated));
    
    const updatedWorkspaces = workspaces.map(w => w.id === updated.id ? updated : w);
    localStorage.setItem('nexus_workspaces', JSON.stringify(updatedWorkspaces));
  };

  const handleOpenEditWorkspace = (workspace) => {
    dispatch(setEditingWorkspaceForm(workspace));
    dispatch(setEditingWorkspaceModal(true));
  };

  const handleCloseEditWorkspace = () => {
    dispatch(setEditingWorkspaceModal(false));
    dispatch(setEditingWorkspaceForm({ id: '', title: '', color: 'indigo', members: [], tags: [] }));
  };

  const addTagToWorkspace = (tagLabel, tagColor) => {
    const newTag = { id: generateId(), label: tagLabel, color: tagColor };
    const updated = { ...editingWorkspaceForm, tags: [...(editingWorkspaceForm.tags || []), newTag] };
    dispatch(updateWorkspace(updated));
    
    const updatedWorkspaces = workspaces.map(w => w.id === updated.id ? updated : w);
    localStorage.setItem('nexus_workspaces', JSON.stringify(updatedWorkspaces));
  };

  const removeTagFromWorkspace = (tagId) => {
    const updated = {
      ...editingWorkspaceForm,
      tags: editingWorkspaceForm.tags.filter(t => t.id !== tagId)
    };
    dispatch(updateWorkspace(updated));
    
    const updatedWorkspaces = workspaces.map(w => w.id === updated.id ? updated : w);
    localStorage.setItem('nexus_workspaces', JSON.stringify(updatedWorkspaces));
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    editingWorkspaceForm,
    isEditingWorkspaceOpen,
    handleCreateWorkspace,
    handleSelectWorkspace,
    handleDeleteWorkspace,
    handleUpdateWorkspace,
    handleOpenEditWorkspace,
    handleCloseEditWorkspace,
    addTagToWorkspace,
    removeTagFromWorkspace,
  };
};
