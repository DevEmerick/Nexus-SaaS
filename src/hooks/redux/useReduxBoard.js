import { useDispatch, useSelector } from 'react-redux';
import {
  setDraggedTaskId,
  setDraggedColumnId,
  updateColumnOrder,
  setSelectedFilter,
  setTasksFilteredByTag,
} from '../../store/slices/uiSlice';
import { DEFAULT_COLUMNS } from '../../utils/constants';
import { useMemo, useState } from 'react';

export const useReduxBoard = () => {
  const dispatch = useDispatch();
  const {
    draggedTaskId,
    draggedColumnId,
    selectedFilter,
    filteredByTag,
  } = useSelector(state => state.ui);
  const { tasks } = useSelector(state => state.task);
  const { activeWorkspaceId } = useSelector(state => state.workspace);
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('nexus_kanban_columns');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });

  const handleDragStart = (taskId, columnId) => {
    dispatch(setDraggedTaskId(taskId));
    dispatch(setDraggedColumnId(columnId));
  };

  const handleDragEnd = () => {
    dispatch(setDraggedTaskId(null));
    dispatch(setDraggedColumnId(null));
  };

  const handleDropOnColumn = (targetColumnId, targetIndex) => {
    // Column reordering logic would go here
    dispatch(setDraggedTaskId(null));
    dispatch(setDraggedColumnId(null));
  };

  const handleAddColumn = (columnTitle) => {
    const newColumn = {
      id: `col_${Date.now()}`,
      title: columnTitle,
      order: columns.length,
    };
    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    localStorage.setItem('nexus_kanban_columns', JSON.stringify(updatedColumns));
  };

  const handleDeleteColumn = (columnId) => {
    const updatedColumns = columns.filter(c => c.id !== columnId);
    setColumns(updatedColumns);
    localStorage.setItem('nexus_kanban_columns', JSON.stringify(updatedColumns));
  };

  const handleUpdateColumn = (columnId, updates) => {
    const updatedColumns = columns.map(c => c.id === columnId ? { ...c, ...updates } : c);
    setColumns(updatedColumns);
    localStorage.setItem('nexus_kanban_columns', JSON.stringify(updatedColumns));
  };

  const organizeTasksByColumn = useMemo(() => {
    const organized = {};
    columns.forEach(col => {
      organized[col.id] = tasks.filter(t => t.status === col.id && t.workspaceId === activeWorkspaceId && !t.deletedAt);
    });
    return organized;
  }, [tasks, columns, activeWorkspaceId]);

  const handleFilterByTag = (tagId) => {
    dispatch(setTasksFilteredByTag(tagId));
  };

  const handleClearFilter = () => {
    dispatch(setTasksFilteredByTag(null));
  };

  const filteredTasksByColumn = useMemo(() => {
    const organized = {};
    columns.forEach(col => {
      let colTasks = tasks.filter(t => t.status === col.id && t.workspaceId === activeWorkspaceId && !t.deletedAt);
      
      if (filteredByTag) {
        colTasks = colTasks.filter(t => t.tags && t.tags.includes(filteredByTag));
      }
      
      organized[col.id] = colTasks;
    });
    return organized;
  }, [tasks, columns, activeWorkspaceId, filteredByTag]);

  return {
    columns,
    draggedTaskId,
    draggedColumnId,
    selectedFilter,
    filteredByTag,
    organizeTasksByColumn,
    filteredTasksByColumn,
    handleDragStart,
    handleDragEnd,
    handleDropOnColumn,
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumn,
    handleFilterByTag,
    handleClearFilter,
  };
};
