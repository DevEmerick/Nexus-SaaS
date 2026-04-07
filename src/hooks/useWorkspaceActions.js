import { generateId } from '../utils/helpers';
import { DEFAULT_COLUMNS } from '../utils/constants';

export const useWorkspaceActions = (
  workspaces, setWorkspaces, 
  newWorkspaceTitle, setNewWorkspaceTitle,
  newWorkspaceColor, setNewWorkspaceColor,
  editingWorkspaceForm, setEditingWorkspaceForm,
  activeWorkspaceId, setActiveWorkspaceId,
  setIsNewWorkspaceModalOpen,
  setIsEditWorkspaceModalOpen,
  setDeleteConfirmation,
  currentUser
) => {
  
  const createWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceTitle.trim() || !currentUser) return;

    const newWs = {
      id: generateId(),
      userId: currentUser.id,
      title: newWorkspaceTitle,
      color: newWorkspaceColor,
      columns: DEFAULT_COLUMNS,
      members: [{ userId: currentUser.id, role: 'admin' }],
      tags: []
    };

    setWorkspaces(prev => [...prev, newWs]);
    setNewWorkspaceTitle('');
    setNewWorkspaceColor('indigo');
    setIsNewWorkspaceModalOpen(false);
    setActiveWorkspaceId(newWs.id);
  };

  const updateWorkspace = (e) => {
    e.preventDefault();
    if (!editingWorkspaceForm.id) return;

    setWorkspaces(prev => prev.map(ws => 
      ws.id === editingWorkspaceForm.id 
        ? {
            ...ws,
            title: editingWorkspaceForm.title,
            color: editingWorkspaceForm.color,
            members: editingWorkspaceForm.members,
            tags: editingWorkspaceForm.tags
          }
        : ws
    ));

    setIsEditWorkspaceModalOpen(false);
    setEditingWorkspaceForm({ id: '', title: '', color: 'indigo', members: [], tags: [] });
  };

  const openEditWorkspaceModal = (workspace) => {
    setEditingWorkspaceForm({
      id: workspace.id,
      title: workspace.title,
      color: workspace.color,
      members: workspace.members || [],
      tags: workspace.tags || []
    });
    setIsEditWorkspaceModalOpen(true);
  };

  const requestDeleteWorkspace = () => {
    if (!editingWorkspaceForm.id) return;
    const ws = workspaces.find(w => w.id === editingWorkspaceForm.id);
    if (!ws) return;

    setDeleteConfirmation({
      type: 'workspace',
      id: ws.id,
      title: ws.title,
      action: 'permanent'
    });
    setIsEditWorkspaceModalOpen(false);
  };

  return {
    createWorkspace,
    updateWorkspace,
    openEditWorkspaceModal,
    requestDeleteWorkspace
  };
};
