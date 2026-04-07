import { useDispatch, useSelector } from 'react-redux';
import {
  addTask,
  updateTask,
  deleteTask,
  setEditingTaskId,
  setTaskForm,
  resetTaskForm,
} from '../../store/slices/taskSlice';
import { generateId } from '../../utils/helpers';

export const useReduxTask = () => {
  const dispatch = useDispatch();
  const {
    tasks,
    editingTaskId,
    taskForm,
  } = useSelector(state => state.task);
  const { activeWorkspaceId } = useSelector(state => state.workspace);

  const handleAddTask = (task) => {
    const newTask = {
      id: generateId(),
      ...task,
      workspaceId: activeWorkspaceId,
      createdAt: new Date().toISOString(),
      comments: [],
      subtasks: [],
      deletedAt: null,
    };
    dispatch(addTask(newTask));
    dispatch(resetTaskForm());

    const updatedTasks = [...tasks, newTask];
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleUpdateTask = (taskId, updates) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = { ...task, ...updates };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const deleted = { ...task, deletedAt: new Date().toISOString() };
    dispatch(updateTask(deleted));

    const updatedTasks = tasks.map(t => t.id === taskId ? deleted : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleRestoreTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const restored = { ...task, deletedAt: null };
    dispatch(updateTask(restored));

    const updatedTasks = tasks.map(t => t.id === taskId ? restored : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handlePermanentlyDeleteTask = (taskId) => {
    dispatch(deleteTask(taskId));

    const updatedTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      dispatch(setEditingTaskId(taskId));
      dispatch(setTaskForm(task));
    }
  };

  const handleCancelEditTask = () => {
    dispatch(setEditingTaskId(null));
    dispatch(resetTaskForm());
  };

  const handleAddSubtask = (taskId, subtaskText) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: generateId(),
      text: subtaskText,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask]
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = {
      ...task,
      subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = {
      ...task,
      subtasks: task.subtasks.filter(s => s.id !== subtaskId)
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const tasksByWorkspace = tasks.filter(t => t.workspaceId === activeWorkspaceId && !t.deletedAt);
  const trashedTasks = tasks.filter(t => t.deletedAt);

  return {
    tasks: tasksByWorkspace,
    trashedTasks,
    editingTaskId,
    taskForm,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleRestoreTask,
    handlePermanentlyDeleteTask,
    handleEditTask,
    handleCancelEditTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
  };
};
