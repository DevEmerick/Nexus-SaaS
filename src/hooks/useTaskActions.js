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

    const makeRequest = async (isEditing) => {
      const endpoint = isEditing ? '/api/update' : '/api/createtask';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? 
        {
          type: 'task',
          id: editingTaskId,
          title: taskForm.title,
          description: taskForm.description || '',
          columnId: taskForm.status,
          priority: taskForm.priority || 'Média',
          deadline: taskForm.deadline || null,
          cardColor: taskForm.cardColor || 'slate',
          completionComment: taskForm.completionComment || '',
          subtasks: taskForm.subtasks || [],
          comments: taskForm.comments || []
        }
        :
        {
          title: taskForm.title,
          description: taskForm.description || '',
          workspaceId: activeWorkspaceId,
          columnId: taskForm.status,
          priority: taskForm.priority || 'Média',
          deadline: taskForm.deadline || null,
          cardColor: taskForm.cardColor || 'slate',
          subtasks: taskForm.subtasks || []
        };

      return fetch(`${window.location.origin}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    };

    try {
      let response;
      let retries = 0;
      const maxRetries = 2;

      // Retry logic for connection errors
      while (retries <= maxRetries) {
        response = await makeRequest(!!editingTaskId);
        
        if (response.ok) break;
        
        // Check if it's a retryable error
        if (response.status === 503) {
          retries++;
          if (retries <= maxRetries) {
            const delay = 1000 * Math.pow(2, retries - 1); // 1s, 2s
            console.log(`Conexão instável, tentando novamente em ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        break;
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || (editingTaskId ? 'Erro ao atualizar tarefa' : 'Erro ao criar tarefa');
        throw new Error(errorMsg);
      }

      const { task } = await response.json();
      
      if (editingTaskId) {
        setTasks(prev => prev.map(t => t.id === editingTaskId ? task : t));
      } else {
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
      // Converter ISO string de deadline para formato YYYY-MM-DD para o input type="date"
      let formattedDeadline = new Date().toISOString().split('T')[0];
      if (task.deadline) {
        // Se deadline vem como string ISO, pega a parte da data
        if (typeof task.deadline === 'string') {
          formattedDeadline = task.deadline.split('T')[0];
        } else if (task.deadline instanceof Date) {
          formattedDeadline = task.deadline.toISOString().split('T')[0];
        }
      }

      // Sanitizar subtasks para garantir que tem formato correto
      let sanitizedSubtasks = [];
      if (Array.isArray(task.subtasks)) {
        sanitizedSubtasks = task.subtasks.map(st => ({
          id: st.id || '',
          text: st.text || '',
          completed: Boolean(st.completed) // Garante boolean value
        }));
      }

      setEditingTaskId(task.id);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'Média',
        status: task.status || task.columnId || columnId || 'todo',
        cardColor: task.cardColor || 'slate',
        deadline: formattedDeadline,
        subtasks: sanitizedSubtasks,
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

  const handleDeleteSubtask = (id) => {
    setTaskForm(prev => {
      const subtask = (prev.subtasks || []).find(st => st.id === id);
      if (!subtask) return prev;
      const log = createLog('DELETE', `Removeu a subtarefa: "${subtask.text}"`);
      return {
        ...prev,
        subtasks: (prev.subtasks || []).filter(st => st.id !== id),
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
    handleDeleteSubtask,
    toggleAssignee,
    toggleTaskTag
  };
};
