import React, { useState, useEffect, useMemo } from 'react';

import { DEFAULT_COLUMNS } from './utils/constants';
import { generateId } from './utils/helpers';
import { checkIsOverdue } from './utils/validation';
import CalendarView from './components/Calendar/CalendarView';
import DashboardView from './components/Dashboard/DashboardView';
import TrashView from './components/Trash/TrashView';
import AuthForm from './components/Auth/AuthForm';
import AppHeader from './components/Header/AppHeader';
import BoardView from './components/Board/BoardView';
import ModalsContainer from './components/Modals/ModalsContainer';
import { useWorkspaceActions, useTaskActions, useAuthActions, useBoardActions, useCommentActions, useUtilityFunctions, useAPIIntegration } from './hooks';

const App = () => {
  // --- Estados de Autenticação & Usuários ---
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('nexus_users')) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('nexus_current_user')) || null);
  const [authView, setAuthView] = useState('login'); 
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', avatar: '', currentPassword: '', newPassword: '' });

  const [messagingUser, setMessagingUser] = useState(null); 
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('nexus_notifications')) || []);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  // --- Nous Estats: Cerca Global ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Estados Principais ---
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('nexus_workspaces');
    if (saved) {
      let parsed = JSON.parse(saved);
      // Migração para incluir members e tags
      return parsed.map(w => ({
        ...w,
        members: w.members || [{ userId: w.userId, role: 'admin' }],
        tags: w.tags || [
          { id: generateId(), label: 'Urgente', color: 'rose' },
          { id: generateId(), label: 'Pesquisa', color: 'cyan' }
        ]
      }));
    }
    return [];
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => localStorage.getItem('nexus_active_workspace') || null);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('nexus_kanban_tasks')) || []);
  
  const [view, setView] = useState('board');
  const [theme, setTheme] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem('nexus_current_user'));
    if (currentUser?.themePreference) return currentUser.themePreference;
    const savedTheme = localStorage.getItem('nexus_theme');
    if (savedTheme) return savedTheme;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modais e Menus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskModalTab, setTaskModalTab] = useState('details'); 
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
  const [newWorkspaceColor, setNewWorkspaceColor] = useState('indigo');
  
  const [isEditWorkspaceModalOpen, setIsEditWorkspaceModalOpen] = useState(false);
  const [editingWorkspaceForm, setEditingWorkspaceForm] = useState({ id: '', title: '', color: 'indigo', members: [], tags: [] });
  const [wsModalTab, setWsModalTab] = useState('general'); // general, team, tags
  const [newTagForm, setNewTagForm] = useState({ label: '', color: 'indigo' });

  const [editingColumnId, setEditingColumnId] = useState(null); 
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const [holidays, setHolidays] = useState([]);
  const [holidayDetail, setHolidayDetail] = useState(null);
  const [appAlert, setAppAlert] = useState(null);
  const [viewingCommentTask, setViewingCommentTask] = useState(null);
  
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingTaskColorId, setEditingTaskColorId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  const [taskForm, setTaskForm] = useState({ 
    title: '', description: '', priority: 'Média', status: 'todo', 
    cardColor: 'slate', deadline: new Date().toISOString().split('T')[0], 
    subtasks: [], completionComment: '', assignees: [], history: [], comments: [], tagIds: [], attachments: [] 
  });

  const [filter, setFilter] = useState('all');
  const [sortByDeadline, setSortByDeadline] = useState(false);
  const [trashSearchDate, setTrashSearchDate] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);

  // --- Novos Estados: Gestão de Colunas ---
  const [columnMenuOpenId, setColumnMenuOpenId] = useState(null);
  const [renamingColumnId, setRenamingColumnId] = useState(null);
  const [renameColumnTitle, setRenameColumnTitle] = useState('');

  // --- Efeitos de Autenticação e Persistência ---
  useEffect(() => { localStorage.setItem('nexus_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('nexus_current_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('nexus_notifications', JSON.stringify(notifications)); }, [notifications]);

  const userWorkspaces = useMemo(() => {
    if (!currentUser) return [];
    // O usuário vê os quadros que ele criou ou onde ele é membro
    const userWs = workspaces.filter(w => w.userId === currentUser.id || w.members?.some(m => m.userId === currentUser.id));
    if (userWs.length === 0) {
      const defaultWs = { 
        id: generateId(), userId: currentUser.id, title: 'Meu Quadro Principal', color: 'indigo', columns: DEFAULT_COLUMNS, 
        members: [{ userId: currentUser.id, role: 'admin' }], 
        tags: [{ id: generateId(), label: 'Importante', color: 'rose' }, { id: generateId(), label: 'Estudos', color: 'indigo' }] 
      };
      setWorkspaces(prev => [...prev, defaultWs]);
      return [defaultWs];
    }
    return userWs;
  }, [workspaces, currentUser]);

  const activeWorkspace = useMemo(() => {
    return userWorkspaces.find(w => w.id === activeWorkspaceId) || userWorkspaces[0] || null;
  }, [userWorkspaces, activeWorkspaceId]);

  // Permissões do Usuário Logado
  const isCurrentUserAdmin = useMemo(() => {
    if (!activeWorkspace || !currentUser) return false;
    if (activeWorkspace.userId === currentUser.id) return true; // Dono é sempre admin
    const memberInfo = activeWorkspace.members?.find(m => m.userId === currentUser.id);
    return memberInfo?.role === 'admin';
  }, [activeWorkspace, currentUser]);

  useEffect(() => {
    if (activeWorkspace && activeWorkspace.id !== activeWorkspaceId) {
      localStorage.setItem('nexus_active_workspace', activeWorkspace.id);
      setActiveWorkspaceId(activeWorkspace.id);
    }
  }, [activeWorkspace, activeWorkspaceId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus_theme');
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // --- Sincronizar com API quando usuário faz login ---
  const apiIntegration = useAPIIntegration();
  
  useEffect(() => {
    if (currentUser) {
      // Carregar workspaces da API
      const loadAPIData = async () => {
        try {
          const apiWorkspaces = await apiIntegration.fetchWorkspaces();
          if (apiWorkspaces && apiWorkspaces.length > 0) {
            // Sincronizar workspaces da API com o estado local
            setWorkspaces(apiWorkspaces);
            
            // Carregar tasks
            const apiTasks = await apiIntegration.fetchTasks();
            if (apiTasks && apiTasks.length > 0) {
              setTasks(apiTasks);
            }
          }
        } catch (error) {
          console.warn('Failed to sync with API, using local data:', error);
        }
      };
      
      loadAPIData();
    }
  }, [currentUser, apiIntegration]);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_kanban_tasks');
    if (saved) {
      try { 
        let parsedTasks = JSON.parse(saved);
        parsedTasks = parsedTasks.map(t => ({ 
          ...t, workspaceId: t.workspaceId || 'default', cardColor: t.cardColor || 'slate',
          history: t.history || [], assignees: t.assignees || [], tagIds: t.tagIds || []
        }));
        const now = new Date().getTime();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const validTasks = parsedTasks.filter(t => !t.deletedAt || (now - new Date(t.deletedAt).getTime()) < thirtyDaysMs);
        setTasks(validTasks); 
      } catch (e) {}
    }
  }, []);

  useEffect(() => { localStorage.setItem('nexus_kanban_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('nexus_workspaces', JSON.stringify(workspaces)); }, [workspaces]);

  // Efecte per l'accés directe de la Cerca Global (Ctrl+K o Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      const year = currentDate.getFullYear();
      try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
        if (response.ok) {
          const data = await response.json();
          setHolidays(Array.isArray(data) ? data : []);
          return;
        }
        const fallbackResponse = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BR`);
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setHolidays(data.map(h => ({ date: h.date, name: h.localName })));
        }
      } catch (e) {}
    };
    fetchHolidays();
  }, [currentDate]);

  // --- Lógica Derivada de Tarefas ---
  const hasPendingSubtasks = (taskObj) => taskObj.subtasks && taskObj.subtasks.length > 0 && taskObj.subtasks.some(st => !st.completed);

  const workspaceTasks = useMemo(() => {
    if (!activeWorkspace) return [];
    return tasks.filter(t => t.workspaceId === activeWorkspace.id);
  }, [tasks, activeWorkspace]);

  const processedTasks = useMemo(() => {
    let result = workspaceTasks.filter(t => !t.deletedAt);
    if (filter === 'overdue') result = result.filter(t => t.status !== 'done' && checkIsOverdue(t.deadline));
    else if (filter === 'urgent') result = result.filter(t => t.priority === 'Alta' && t.status !== 'done');
    
    if (selectedTags.length > 0) {
      result = result.filter(t => t.tagIds && t.tagIds.some(tagId => selectedTags.includes(tagId)));
    }

    if (selectedAssignees.length > 0) {
      result = result.filter(t => t.assignees && t.assignees.some(userId => selectedAssignees.includes(userId)));
    }
    
    if (sortByDeadline) result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return result;
  }, [workspaceTasks, filter, sortByDeadline, selectedTags, selectedAssignees]);

  const deletedTasks = useMemo(() => {
    if (!currentUser) return [];
    const userWorkspaceIds = userWorkspaces.map(w => w.id);
    let result = tasks.filter(t => t.deletedAt && userWorkspaceIds.includes(t.workspaceId));
    if (trashSearchDate) result = result.filter(t => t.deletedAt.startsWith(trashSearchDate));
    return result.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
  }, [tasks, trashSearchDate, userWorkspaces, currentUser]);

  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  // Resultats de la Cerca Global
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQ = searchQuery.toLowerCase();
    return tasks.filter(t => 
      !t.deletedAt && 
      (t.title.toLowerCase().includes(lowerQ) || (t.description && t.description.toLowerCase().includes(lowerQ)))
    ).slice(0, 10);
  }, [searchQuery, tasks]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) days.push({ day: null, type: 'padding' });
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, date: dateString, type: 'current' });
    }
    return days;
  }, [currentDate]);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [notifications, currentUser]);

  const unreadNotifsCount = userNotifications.filter(n => !n.read).length;

  const addNotification = (userId, title, message) => {
    setNotifications(prev => [...prev, { id: generateId(), userId, title, message, read: false, timestamp: new Date().toISOString() }]);
  };

  const markAllNotifsAsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
  };

  // --- Initialize Auth Hook ---
  const handleLoginSuccess = (user) => {
    // Callback executado após login bem-sucedido
    // O useEffect que observa currentUser vai disparar automaticamente
  };

  const { handleAuthSubmit, handleLogout, saveProfile } = useAuthActions(
    users, setUsers,
    currentUser, setCurrentUser,
    authForm, setAuthForm,
    authError, setAuthError,
    authView, setAuthView,
    handleLoginSuccess
  );

  // Carregar tema do perfil quando usuario faz login
  useEffect(() => {
    if (currentUser?.themePreference) {
      setTheme(currentUser.themePreference);
    }
  }, [currentUser?.themePreference]);

  const openProfileModal = () => {
    setProfileForm({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '', avatar: currentUser.avatar || '', currentPassword: '', newPassword: '' });
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  // --- Handlers de Tarefas & Histórico ---
  const { createLog, handleSaveTask, handleOpenModal, handleAddSubtask, handleToggleSubtask, toggleAssignee, toggleTaskTag } = useTaskActions(
    tasks, setTasks,
    taskForm, setTaskForm,
    editingTaskId, setEditingTaskId,
    activeWorkspace?.id,
    setIsModalOpen,
    currentUser,
    subtaskInput, setSubtaskInput
  );

  // --- Initialize Workspace Hook ---
  const { createWorkspace, updateWorkspace, openEditWorkspaceModal: openEditWorkspace, requestDeleteWorkspace } = useWorkspaceActions(
    workspaces, setWorkspaces,
    newWorkspaceTitle, setNewWorkspaceTitle,
    newWorkspaceColor, setNewWorkspaceColor,
    editingWorkspaceForm, setEditingWorkspaceForm,
    activeWorkspaceId, setActiveWorkspaceId,
    setIsNewWorkspaceModalOpen,
    setIsEditWorkspaceModalOpen,
    setDeleteConfirmation,
    currentUser
  );

  // --- Initialize Board Actions Hook (Columns, Drag & Drop, Filters) ---
  const {
    handleDragStart, handleDragEnd, handleMoveTaskStatus,
    handleColumnDragStart, handleColumnDragEnd, handleColumnDrop,
    changeColumnColor, handleAddColumn, handleDeleteColumn, handleMoveColumn,
    startRenameColumn, saveColumnRename,
    toggleTagFilter, toggleAssigneeFilter
  } = useBoardActions(
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
  );

  // --- Initialize Comment Actions Hook ---
  const { handleAddComment, handleDeleteComment, handleSaveEditComment, handleAddReply, handleDeleteReply, handleFileUpload } = useCommentActions(
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
  );



;





  const { reverseHistory, getUserDetails, calculateDashboardMetrics } = useUtilityFunctions(
    taskForm,
    users
  );











  // ==========================================
  // RENDERIZAÇÃO DAS TELAS DE AUTENTICAÇÃO
  // ==========================================
  if (!currentUser) {
    return <AuthForm theme={theme} authView={authView} authForm={authForm} authError={authError} setAuthView={setAuthView} setAuthForm={setAuthForm} setAuthError={setAuthError} setTheme={setTheme} handleAuthSubmit={handleAuthSubmit} />;
  }

  // ==========================================
  // RENDERIZAÇÃO DA APLICAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-indigo-100 overflow-x-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#F1F5F9] text-slate-900'}`}>
      <style>{`
        @keyframes floatLift { 0% { transform: rotate(0deg) translateY(0px) scale(1); } 100% { transform: rotate(2deg) translateY(-10px) scale(1.05); } }
        .is-dragging { animation: floatLift 0.2s forwards ease-out; cursor: grabbing !important; box-shadow: 0 30px 60px -12px rgba(99, 102, 241, 0.4) !important; border-color: #6366f1 !important; z-index: 100; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
      `}</style>

      {/* OVERLAY GERAL PARA MENUS */}
      {(isWorkspaceMenuOpen || editingColumnId || isProfileMenuOpen || columnMenuOpenId || isNotifMenuOpen || editingTaskColorId) && (
        <div className="fixed inset-0 z-30" onClick={() => { setIsWorkspaceMenuOpen(false); setEditingColumnId(null); setIsProfileMenuOpen(false); setColumnMenuOpenId(null); setIsNotifMenuOpen(false); setEditingTaskColorId(null); }} />
      )}

      {/* Header Principal */}
      <AppHeader theme={theme} setTheme={setTheme} activeWorkspace={activeWorkspace} userWorkspaces={userWorkspaces} currentUser={currentUser} view={view} setView={setView} setIsWorkspaceMenuOpen={setIsWorkspaceMenuOpen} isWorkspaceMenuOpen={isWorkspaceMenuOpen} setActiveWorkspaceId={setActiveWorkspaceId} setIsNewWorkspaceModalOpen={setIsNewWorkspaceModalOpen} openEditWorkspace={openEditWorkspace} handleOpenModal={handleOpenModal} setIsSearchOpen={setIsSearchOpen} isNotifMenuOpen={isNotifMenuOpen} setIsNotifMenuOpen={setIsNotifMenuOpen} unreadNotifsCount={unreadNotifsCount} markAllNotifsAsRead={markAllNotifsAsRead} userNotifications={userNotifications} setNotifications={setNotifications} isProfileMenuOpen={isProfileMenuOpen} setIsProfileMenuOpen={setIsProfileMenuOpen} openProfileModal={openProfileModal} handleLogout={handleLogout} setCurrentUser={setCurrentUser} />

      <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-100px)] animate-in fade-in duration-500 flex flex-col">
        
        {view === 'board' && activeWorkspace && (
          <BoardView theme={theme} activeWorkspace={activeWorkspace} processedTasks={processedTasks} filter={filter} setFilter={setFilter} sortByDeadline={sortByDeadline} setSortByDeadline={setSortByDeadline} selectedTags={selectedTags} toggleTagFilter={toggleTagFilter} selectedAssignees={selectedAssignees} toggleAssigneeFilter={toggleAssigneeFilter} isCurrentUserAdmin={isCurrentUserAdmin} draggedTaskId={draggedTaskId} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} draggedColumnId={draggedColumnId} handleColumnDragStart={handleColumnDragStart} handleColumnDragEnd={handleColumnDragEnd} handleColumnDrop={handleColumnDrop} columnMenuOpenId={columnMenuOpenId} setColumnMenuOpenId={setColumnMenuOpenId} editingColumnId={editingColumnId} setEditingColumnId={setEditingColumnId} changeColumnColor={changeColumnColor} renamingColumnId={renamingColumnId} renameColumnTitle={renameColumnTitle} startRenameColumn={startRenameColumn} saveColumnRename={saveColumnRename} setRenameColumnTitle={setRenameColumnTitle} handleOpenModal={handleOpenModal} handleDeleteColumn={handleDeleteColumn} handleMoveColumn={handleMoveColumn} editingTaskColorId={editingTaskColorId} setEditingTaskColorId={setEditingTaskColorId} setTasks={setTasks} createLog={createLog} handleMoveTaskStatus={handleMoveTaskStatus} setDeleteConfirmation={setDeleteConfirmation} getUserDetails={getUserDetails} setViewingCommentTask={setViewingCommentTask} handleAddColumn={handleAddColumn} />
        )}

        {view === 'calendar' && <CalendarView theme={theme} currentDate={currentDate} setCurrentDate={setCurrentDate} isCurrentMonth={isCurrentMonth} calendarDays={calendarDays} processedTasks={processedTasks} holidays={holidays} setHolidayDetail={setHolidayDetail} handleOpenModal={handleOpenModal} checkIsOverdue={checkIsOverdue} />}

        {view === 'dashboard' && activeWorkspace && <DashboardView theme={theme} activeWorkspace={activeWorkspace} workspaceTasks={workspaceTasks} calculateDashboardMetrics={calculateDashboardMetrics} />}

        {view === 'trash' && <TrashView theme={theme} deletedTasks={deletedTasks} userWorkspaces={userWorkspaces} activeWorkspace={activeWorkspace} trashSearchDate={trashSearchDate} setTrashSearchDate={setTrashSearchDate} isCurrentUserAdmin={isCurrentUserAdmin} setDeleteConfirmation={setDeleteConfirmation} setTasks={setTasks} tasks={tasks} />}
      </main>

      {/* --- Modais Consolidados --- */}
      <ModalsContainer 
        theme={theme}
        isProfileModalOpen={isProfileModalOpen} setIsProfileModalOpen={setIsProfileModalOpen} profileForm={profileForm} setProfileForm={setProfileForm} saveProfile={saveProfile}
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} editingTaskId={editingTaskId} taskForm={taskForm} setTaskForm={setTaskForm} taskModalTab={taskModalTab} setTaskModalTab={setTaskModalTab} users={users} activeWorkspace={activeWorkspace} toggleAssignee={toggleAssignee} toggleTaskTag={toggleTaskTag} subtaskInput={subtaskInput} setSubtaskInput={setSubtaskInput} handleAddSubtask={handleAddSubtask} handleToggleSubtask={handleToggleSubtask} reverseHistory={reverseHistory} handleSaveTask={handleSaveTask} handleAddComment={handleAddComment} commentInput={commentInput} setCommentInput={setCommentInput} editingCommentId={editingCommentId} setEditingCommentId={setEditingCommentId} editingCommentText={editingCommentText} setEditingCommentText={setEditingCommentText} handleSaveEditComment={handleSaveEditComment} setReplyingToId={setReplyingToId} replyingToId={replyingToId} replyText={replyText} setReplyText={setReplyText} handleAddReply={handleAddReply} handleDeleteComment={handleDeleteComment} handleDeleteReply={handleDeleteReply}
        isNewWorkspaceModalOpen={isNewWorkspaceModalOpen} setIsNewWorkspaceModalOpen={setIsNewWorkspaceModalOpen} newWorkspaceTitle={newWorkspaceTitle} setNewWorkspaceTitle={setNewWorkspaceTitle} newWorkspaceColor={newWorkspaceColor} setNewWorkspaceColor={setNewWorkspaceColor} createWorkspace={createWorkspace}
        isEditWorkspaceModalOpen={isEditWorkspaceModalOpen} setIsEditWorkspaceModalOpen={setIsEditWorkspaceModalOpen} wsModalTab={wsModalTab} setWsModalTab={setWsModalTab} editingWorkspaceForm={editingWorkspaceForm} setEditingWorkspaceForm={setEditingWorkspaceForm} newTagForm={newTagForm} setNewTagForm={setNewTagForm} updateWorkspace={updateWorkspace} requestDeleteWorkspace={requestDeleteWorkspace}
        messagingUser={messagingUser} setMessagingUser={setMessagingUser} appAlert={appAlert} setAppAlert={setAppAlert}
        viewingCommentTask={viewingCommentTask} setViewingCommentTask={setViewingCommentTask}
        deleteConfirmation={deleteConfirmation} setDeleteConfirmation={setDeleteConfirmation} workspaces={workspaces} setWorkspaces={setWorkspaces} activeWorkspaceId={activeWorkspaceId} setActiveWorkspaceId={setActiveWorkspaceId} setTasks={setTasks} handleFileUpload={handleFileUpload}
        holidayDetail={holidayDetail} setHolidayDetail={setHolidayDetail}
        isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} handleOpenModal={handleOpenModal}
      />
    </div>
  );
};

export default App;