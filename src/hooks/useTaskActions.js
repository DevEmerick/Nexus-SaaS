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

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !activeWorkspaceId) return;

    try {
      if (editingTaskId) {
        // TODO: Atualizar no servidor via API
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
        // Criar novo na API
        const response = await fetch(`${window.location.origin}/api/createtask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: taskForm.title,
            description: taskForm.description || '',
            workspaceId: activeWorkspaceId,
            columnId: taskForm.status, // status contém o columnId
            priority: taskForm.priority || 'Média',
            deadline: taskForm.deadline || null,
            cardColor: taskForm.cardColor || 'slate',
            assignedTo: taskForm.assignedTo || '',
            tags: taskForm.tags || ''
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.error || 'Erro ao criar tarefa'}`);
        }

        const { task } = await response.json();
        setTasks(prev => [...prev, task]);
      }

      // Reset form
      setTaskForm({
        title: '', description: '', priority: 'Média', status: 'todo',
        cardColor: 'slate', deadline: new Date().toISOString().split('T')[0],
        subtasks: [], completionComment: '', assignees: [], comments: [], tagIds: [], attachments: []
      });
      setEditingTaskId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa: ' + error.message);
    }
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
