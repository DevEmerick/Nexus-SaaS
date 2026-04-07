import { generateId } from '../utils/helpers';

export const useBoardActions = (
  workspaces, setWorkspaces,
  tasks, setTasks,
  activeWorkspace,
  isCurrentUserAdmin,
  draggedTaskId, setDraggedTaskId,
  draggedColumnId, setDraggedColumnId,
  columnMenuOpenId, setColumnMenuOpenId,
  renamingColumnId, setRenamingColumnId,
  renameColumnTitle, setRenameColumnTitle,
  editingColumnId, setEditingColumnId,
  selectedTags, setSelectedTags,
  selectedAssignees, setSelectedAssignees,
  setAppAlert,
  createLog,
  hasPendingSubtasks
) => {

  // --- Drag & Drop: Task Movement ---
  const handleDragStart = (e, id) => {
    e.stopPropagation();
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget;
    target.classList.add('is-dragging');
    setTimeout(() => { if(target) target.style.opacity = '0.3'; }, 0);
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);
    const target = e.currentTarget;
    if(target) { target.classList.remove('is-dragging'); target.style.opacity = '1'; }
  };

  const handleDrop = async (columnId) => {
    if (!draggedTaskId) return;
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (!draggedTask || draggedTask.columnId === columnId) { 
      setDraggedTaskId(null); 
      return; 
    } 

    if (columnId === 'done' && hasPendingSubtasks(draggedTask)) {
      setAppAlert("Conclua todas as subtarefas dentro do card antes de movê-lo para 'Finalizado'!");
      setDraggedTaskId(null); 
      return;
    }

    try {
      // Atualizar no banco via API
      const response = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          id: draggedTaskId,
          columnId: columnId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAppAlert(`Erro ao mover card: ${errorData.error || 'Erro desconhecido'}`);
        setDraggedTaskId(null);
        return;
      }

      // Atualizar estado local após sucesso na API
      setTasks(prev => prev.map(t => {
        if (t.id === draggedTaskId) {
          return { ...t, columnId: columnId, status: columnId };
        }
        return t;
      }));
    } catch (error) {
      console.error('Erro ao mover card:', error);
      setAppAlert('Erro ao mover card');
    }
    
    setDraggedTaskId(null);
  };

  const handleMoveTaskStatus = (e, taskId, newStatus) => {
    e.stopPropagation();
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove || taskToMove.status === newStatus) return;

    if (newStatus === 'done' && hasPendingSubtasks(taskToMove)) {
      setAppAlert("Conclua todas as subtarefas dentro do card antes de movê-lo para 'Finalizado'!");
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowDone = newStatus === 'done';
        const wasDone = t.status === 'done';
        let newCompletedAt = t.completedAt;
        let logs = [...(t.history || [])];
        
        const colName = activeWorkspace.columns.find(c => c.id === newStatus)?.title;
        logs.push(createLog('STATUS', `Moveu para "${colName}" (via atalho)`));

        if (isNowDone && !wasDone) {
          newCompletedAt = new Date().toISOString();
          logs.push(createLog('COMPLETE', 'Finalizou o card'));
        } else if (!isNowDone && wasDone) {
          newCompletedAt = null;
          logs.push(createLog('REOPEN', 'Reabriu o card'));
        }
        return { ...t, status: newStatus, completedAt: newCompletedAt, history: logs };
      }
      return t;
    }));
  };

  // --- Drag & Drop: Column Movement ---
  const handleColumnDragStart = (e, colId) => {
    if (!isCurrentUserAdmin || draggedTaskId) {
      e.preventDefault();
      return;
    }
    setDraggedColumnId(colId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget;
    setTimeout(() => { if(target) target.style.opacity = '0.4'; }, 0);
  };

  const handleColumnDragEnd = (e) => {
    setDraggedColumnId(null);
    const target = e.currentTarget;
    if(target) { target.style.opacity = '1'; }
  };

  const handleColumnDrop = (e, targetColId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedTaskId) {
      handleDrop(targetColId);
    } else if (draggedColumnId && draggedColumnId !== targetColId) {
      setWorkspaces(prev => prev.map(ws => {
        if (ws.id !== activeWorkspace.id) return ws;
        const cols = [...ws.columns];
        const draggedIdx = cols.findIndex(c => c.id === draggedColumnId);
        const targetIdx = cols.findIndex(c => c.id === targetColId);
        if (draggedIdx < 0 || targetIdx < 0) return ws;
        
        const [draggedCol] = cols.splice(draggedIdx, 1);
        cols.splice(targetIdx, 0, draggedCol);
        return { ...ws, columns: cols };
      }));
    }
    setDraggedColumnId(null);
  };

  // --- Column Management ---
  const changeColumnColor = (colId, colorKey) => {
    setWorkspaces(prevWorkspaces => prevWorkspaces.map(ws => ws.id === activeWorkspace.id ? { ...ws, columns: ws.columns.map(c => c.id === colId ? { ...c, color: colorKey } : c) } : ws));
    setEditingColumnId(null);
  };

  const handleAddColumn = () => {
    const newCol = { id: generateId(), title: 'Nova Coluna', color: 'slate' };
    setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspace.id ? { ...ws, columns: [...ws.columns, newCol] } : ws));
  };

  const handleDeleteColumn = (colId) => {
    const hasTasks = tasks.some(t => t.workspaceId === activeWorkspace.id && t.status === colId && !t.deletedAt);
    if (hasTasks) return setAppAlert("Não é possível excluir uma coluna que contém cards. Mova ou exclua os cards primeiro.");
    setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspace.id ? { ...ws, columns: ws.columns.filter(c => c.id !== colId) } : ws));
    setColumnMenuOpenId(null);
  };

  const handleMoveColumn = (colId, direction) => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id !== activeWorkspace.id) return ws;
      const cols = [...ws.columns];
      const idx = cols.findIndex(c => c.id === colId);
      if (idx < 0) return ws;
      if (direction === 'left' && idx > 0) [cols[idx - 1], cols[idx]] = [cols[idx], cols[idx - 1]];
      else if (direction === 'right' && idx < cols.length - 1) [cols[idx], cols[idx + 1]] = [cols[idx + 1], cols[idx]];
      return { ...ws, columns: cols };
    }));
    setColumnMenuOpenId(null);
  };

  const startRenameColumn = (col) => {
    if (!isCurrentUserAdmin) return;
    setRenamingColumnId(col.id);
    setRenameColumnTitle(col.title);
    setColumnMenuOpenId(null);
  };

  const saveColumnRename = (colId) => {
    if (!renameColumnTitle.trim()) { setRenamingColumnId(null); return; }
    setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspace.id ? { ...ws, columns: ws.columns.map(c => c.id === colId ? { ...c, title: renameColumnTitle } : c) } : ws));
    setRenamingColumnId(null);
  };

  // --- Filtros ---
  const toggleTagFilter = (tagId) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };
  
  const toggleAssigneeFilter = (userId) => {
    setSelectedAssignees(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleMoveTaskStatus,
    handleColumnDragStart,
    handleColumnDragEnd,
    handleColumnDrop,
    changeColumnColor,
    handleAddColumn,
    handleDeleteColumn,
    handleMoveColumn,
    startRenameColumn,
    saveColumnRename,
    toggleTagFilter,
    toggleAssigneeFilter
  };
};
