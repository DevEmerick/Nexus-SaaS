import { useDispatch, useSelector } from 'react-redux';
import { updateTask } from '../../store/slices/taskSlice';
import { generateId } from '../../utils/helpers';

export const useReduxComment = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector(state => state.task);
  const { currentUser } = useSelector(state => state.auth);
  const { activeWorkspaceId } = useSelector(state => state.workspace);

  const handleAddComment = (taskId, text, file = null) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment = {
      id: generateId(),
      userId: currentUser?.id,
      userName: currentUser?.name || 'Anonymous',
      text,
      file: file ? { name: file.name, size: file.size } : null,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const updated = {
      ...task,
      comments: [...(task.comments || []), newComment]
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleEditComment = (taskId, commentId, newText) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = {
      ...task,
      comments: task.comments.map(c => c.id === commentId ? { ...c, text: newText, edited: true } : c)
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteComment = (taskId, commentId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = {
      ...task,
      comments: task.comments.filter(c => c.id !== commentId)
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleAddReply = (taskId, commentId, replyText) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newReply = {
      id: generateId(),
      userId: currentUser?.id,
      userName: currentUser?.name || 'Anonymous',
      text: replyText,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...task,
      comments: task.comments.map(c => 
        c.id === commentId 
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      )
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteReply = (taskId, commentId, replyId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = {
      ...task,
      comments: task.comments.map(c =>
        c.id === commentId
          ? { ...c, replies: c.replies.filter(r => r.id !== replyId) }
          : c
      )
    };
    dispatch(updateTask(updated));

    const updatedTasks = tasks.map(t => t.id === taskId ? updated : t);
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(updatedTasks));
  };

  const getTaskComments = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.comments || [];
  };

  const getCommentCount = (taskId) => {
    return getTaskComments(taskId).length;
  };

  return {
    currentUser,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    handleAddReply,
    handleDeleteReply,
    getTaskComments,
    getCommentCount,
  };
};
