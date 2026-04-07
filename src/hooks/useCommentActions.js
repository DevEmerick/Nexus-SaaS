import { generateId } from '../utils/helpers';

export const useCommentActions = (
  taskForm, setTaskForm,
  editingTaskId, setEditingTaskId,
  tasks, setTasks,
  currentUser,
  commentInput, setCommentInput,
  editingCommentId, setEditingCommentId,
  editingCommentText, setEditingCommentText,
  replyingToId, setReplyingToId,
  replyText, setReplyText,
  setAppAlert,
  addNotification
) => {

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = { id: generateId(), userId: currentUser.id, text: commentInput, timestamp: new Date().toISOString(), replies: [] };
    
    const newComments = [...(taskForm.comments || []), newComment];
    setTaskForm(prev => ({ ...prev, comments: newComments }));
    
    if (editingTaskId) {
        setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, comments: newComments } : t));
    }

    setCommentInput('');
    
    taskForm.assignees.forEach(uid => {
      if (uid !== currentUser.id) {
        addNotification(uid, 'Novo Comentário', `${currentUser.name} comentou em: ${taskForm.title}`);
      }
    });
  };

  const handleDeleteComment = (commentId) => {
    const newComments = taskForm.comments.filter(c => c.id !== commentId);
    setTaskForm(prev => ({ ...prev, comments: newComments }));
    if (editingTaskId) setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, comments: newComments } : t));
  };

  const handleSaveEditComment = (commentId) => {
    if (!editingCommentText.trim()) return;
    const newComments = taskForm.comments.map(c => c.id === commentId ? { ...c, text: editingCommentText } : c);
    setTaskForm(prev => ({ ...prev, comments: newComments }));
    if (editingTaskId) setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, comments: newComments } : t));
    setEditingCommentId(null);
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    const newReply = { id: generateId(), userId: currentUser.id, text: replyText, timestamp: new Date().toISOString() };
    const newComments = taskForm.comments.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c);
    setTaskForm(prev => ({ ...prev, comments: newComments }));
    if (editingTaskId) setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, comments: newComments } : t));
    setReplyingToId(null);
    setReplyText('');
  };

  const handleDeleteReply = (commentId, replyId) => {
    const newComments = taskForm.comments.map(c => c.id === commentId ? { ...c, replies: (c.replies || []).filter(r => r.id !== replyId) } : c);
    setTaskForm(prev => ({ ...prev, comments: newComments }));
    if (editingTaskId) setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, comments: newComments } : t));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limite de 2MB para não estourar o LocalStorage do navegador nesta demo
    if (file.size > 2 * 1024 * 1024) {
      setAppAlert("Para esta demonstração, o limite de tamanho do ficheiro é 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newAttachment = {
        id: generateId(),
        name: file.name,
        url: reader.result,
        type: file.type,
        createdAt: new Date().toISOString()
      };
      setTaskForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
    };
    reader.readAsDataURL(file);
  };

  return {
    handleAddComment,
    handleDeleteComment,
    handleSaveEditComment,
    handleAddReply,
    handleDeleteReply,
    handleFileUpload
  };
};
