import { generateId } from '../utils/helpers';

export const useTaskActions = (
  tasks, setTasks, 
  taskForm, setTaskForm,
  editingTaskId, setEditingTaskId,
  activeWorkspaceId, 
  setIsModalOpen,
  currentUser,
  subtaskInput, setSubtaskInput
) => {

  const createLog = (action, details) => ({
    id: generateId(),
    userId: currentUser?.id || 'anonymous',
    action,
    details,
    timestamp: new Date().toISOString()
  });

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !activeWorkspaceId) return;

    if (editingTaskId) {
      // Atualizar existente
      setTasks(prev => prev.map(t => 
        t.id === editingTaskId
          ? {
              ...t,
              ...taskForm,
              workspaceId: activeWorkspaceId,
              history: [...(t.history || []), createLog('UPDATE', `Atualizou o card: "${taskForm.title}"`)]
            }
          : t
      ));
    } else {
      // Criar novo
      const newTask = {
        id: generateId(),
        ...taskForm,
        workspaceId: activeWorkspaceId,
        createdAt: new Date().toISOString(),
        history: [createLog('CREATE', `Criou o card: "${taskForm.title}"`)]
      };
      setTasks(prev => [...prev, newTask]);
    }

    // Reset form
    setTaskForm({
      title: '', description: '', priority: 'Média', status: 'todo',
      cardColor: 'slate', deadline: new Date().toISOString().split('T')[0],
      subtasks: [], completionComment: '', assignees: [], comments: [], tagIds: [], attachments: []
    });
    setEditingTaskId(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (task = null, columnId = null) => {
    if (task) {
      setEditingTaskId(task.id);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'Média',
        status: task.status || columnId || 'todo',
        cardColor: task.cardColor || 'slate',
        deadline: task.deadline || new Date().toISOString().split('T')[0],
        subtasks: task.subtasks || [],
        completionComment: task.completionComment || '',
        assignees: task.assignees || [],
        comments: task.comments || [],
        tagIds: task.tagIds || [],
        attachments: task.attachments || [],
        history: task.history || []
      });
    } else {
      setEditingTaskId(null);
      setTaskForm({
        title: '', description: '', priority: 'Média', status: columnId || 'todo',
        cardColor: 'slate', deadline: new Date().toISOString().split('T')[0],
        subtasks: [], completionComment: '', assignees: [], comments: [], tagIds: [], attachments: []
      });
    }
    setIsModalOpen(true);
  };

  const handleAddSubtask = (e) => {
    e?.preventDefault?.();
    if (!subtaskInput.trim()) return;
    setTaskForm(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { id: generateId(), text: subtaskInput, completed: false }]
    }));
    setSubtaskInput('');
  };

  const handleToggleSubtask = (id) => {
    setTaskForm(prev => {
      const subtask = (prev.subtasks || []).find(st => st.id === id);
      if (!subtask) return prev;
      const isCompleted = !subtask.completed;
      const log = createLog(isCompleted ? 'COMPLETE' : 'REOPEN', `${isCompleted ? 'Concluiu' : 'Reabriu'} a subtarefa: "${subtask.text}"`);
      return {
        ...prev,
        subtasks: (prev.subtasks || []).map(st => st.id === id ? { ...st, completed: isCompleted } : st),
        history: [...(prev.history || []), log]
      };
    });
  };

  const toggleAssignee = (userId) => {
    setTaskForm(prev => {
      const assignees = prev.assignees || [];
      const isAssigned = assignees.includes(userId);
      return {
        ...prev,
        assignees: isAssigned ? assignees.filter(id => id !== userId) : [...assignees, userId]
      };
    });
  };

  const toggleTaskTag = (tagId) => {
    setTaskForm(prev => {
      const tagIds = prev.tagIds || [];
      const isSelected = tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: isSelected ? tagIds.filter(id => id !== tagId) : [...tagIds, tagId]
      };
    });
  };

  return {
    createLog,
    handleSaveTask,
    handleOpenModal,
    handleAddSubtask,
    handleToggleSubtask,
    toggleAssignee,
    toggleTaskTag
  };
};
