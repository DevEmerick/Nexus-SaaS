import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Layout, X, Calendar as CalendarIcon, Columns, ChevronLeft, ChevronRight, 
  Trash2, Edit2, BookOpen, CheckCircle2, GripVertical, Clock, RotateCcw, Info, 
  PartyPopper, Moon, Sun, AlertCircle, Filter, ArrowDownUp, ListTodo, PlusCircle, 
  AlertTriangle, Trash, Search, ChevronDown, FolderPlus, Palette, MessageSquare, 
  Settings, User, LogOut, Lock, Mail, UserCircle, KeyRound, Camera, Phone,
  Users, History, Send, MoreVertical, ArrowLeft, ArrowRight, Edit3, Tag, ShieldCheck, Shield,
  Activity, Bell, Bold, Italic, Strikethrough, Link, List as ListIcon, Sparkles, Loader2,
  Paperclip, FileText
} from 'lucide-react';

// --- Paleta de Cores do Sistema ---
const PALETTE = {
  slate: { name: 'Cinza', dot: 'bg-slate-500', soft: 'bg-slate-50 dark:bg-slate-800/80', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' },
  indigo: { name: 'Índigo', dot: 'bg-indigo-500', soft: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800/50', text: 'text-indigo-700 dark:text-indigo-400' },
  emerald: { name: 'Esmeralda', dot: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-400' },
  rose: { name: 'Rosa', dot: 'bg-rose-500', soft: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800/50', text: 'text-rose-700 dark:text-rose-400' },
  amber: { name: 'Âmbar', dot: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-700 dark:text-amber-400' },
  cyan: { name: 'Ciano', dot: 'bg-cyan-500', soft: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-200 dark:border-cyan-800/50', text: 'text-cyan-700 dark:text-cyan-400' },
  purple: { name: 'Roxo', dot: 'bg-purple-500', soft: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800/50', text: 'text-purple-700 dark:text-purple-400' }
};
const COLOR_KEYS = Object.keys(PALETTE);

const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'Aguardando', color: 'slate' },
  { id: 'in-progress', title: 'Em Progresso', color: 'indigo' },
  { id: 'done', title: 'Finalizado', color: 'emerald' },
];

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// --- Integração Gemini API ---
const callGeminiAPI = async (prompt, isJson = false) => {
  const apiKey = ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "Você é um assistente de produtividade integrado a um software Kanban focado em organização ágil. Responda de forma direta e eficiente em Português." }] }
  };
  
  if (isJson) {
     payload.generationConfig = {
         responseMimeType: "application/json",
         responseSchema: {
             type: "ARRAY",
             items: {
                 type: "OBJECT",
                 properties: {
                     text: { type: "STRING", description: "Ação prática e curta (máx 10 palavras) para a subtarefa." }
                 }
             }
         }
     };
  }

  let retries = 5;
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API Error");
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return isJson ? JSON.parse(text) : text;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

// --- Componente: Editor Markdown ---
const MarkdownEditor = ({ value, onChange, theme }) => {
  const [view, setView] = useState('write');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = React.useRef(null);

  const insertText = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleAIEnhance = async () => {
    if (!value || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const prompt = `Melhore, expanda e formate o seguinte texto de uma tarefa de Kanban usando marcação Markdown (use negrito para termos chave, organize em listas se aplicável). Torne o texto profissional e claro. Retorne APENAS o markdown final:\n\n"${value}"`;
      const improvedText = await callGeminiAPI(prompt, false);
      if (improvedText) {
        onChange(improvedText);
        setView('preview');
      }
    } catch (e) {
      console.error(e);
    }
    setIsEnhancing(false);
  };

  const renderMarkdown = (text) => {
    if (!text) return <p className="text-slate-400 italic">Nenhuma descrição fornecida.</p>;
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') 
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-500 hover:underline" target="_blank">$1</a>')
      .replace(/\n/g, '<br />');
    
    html = html.replace(/^- (.*)/gm, '<li>$1</li>');
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-5">$1</ul>');
    }

    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />;
  };

  return (
    <div className={`rounded-[1rem] border-2 transition-all shadow-inner overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50/50 border-slate-100 text-slate-800'}`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-100/50'}`}>
        <div className="flex gap-1">
          <button type="button" onClick={() => insertText('**')} className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`} title="Negrito"><Bold size={14}/></button>
          <button type="button" onClick={() => insertText('*')} className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`} title="Itálico"><Italic size={14}/></button>
          <button type="button" onClick={() => insertText('~~')} className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`} title="Riscado"><Strikethrough size={14}/></button>
          <button type="button" onClick={() => insertText('[', '](url)')} className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`} title="Link"><Link size={14}/></button>
          <button type="button" onClick={() => insertText('- ', '')} className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`} title="Lista"><ListIcon size={14}/></button>
        </div>
        <div className={`flex rounded-lg p-0.5 gap-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
           <button type="button" onClick={handleAIEnhance} disabled={isEnhancing} className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}>
             {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
             Melhorar IA
           </button>
           <button type="button" onClick={() => setView('write')} className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${view === 'write' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500'}`}>Editar</button>
           <button type="button" onClick={() => setView('preview')} className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${view === 'preview' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500'}`}>Visualizar</button>
        </div>
      </div>
      {view === 'write' ? (
        <textarea 
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-transparent focus:outline-none min-h-[120px] resize-y text-sm font-medium"
          placeholder="Detalhes, links, anotações (Suporta formatação básica)..."
        />
      ) : (
        <div className={`w-full p-4 min-h-[120px] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50/50'}`}>
          {renderMarkdown(value)}
        </div>
      )}
    </div>
  );
};

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
  const [theme, setTheme] = useState('light');
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
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
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
  }, [currentDate.getFullYear()]);

  // --- Lógica Derivada de Tarefas ---
  const checkIsOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = deadline.split('-');
    return new Date(year, month - 1, day) < today;
  };

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

  // --- Handlers de Autenticação ---
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authView === 'register') {
      if (authForm.password !== authForm.confirmPassword) return setAuthError('As senhas não coincidem.');
      if (users.find(u => u.email === authForm.email)) return setAuthError('Este email já está em uso.');
      
      const newUser = { id: generateId(), name: authForm.name, email: authForm.email, password: authForm.password, phone: '', avatar: '' };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      // Migra workspaces sem dono e coloca como admin
      setWorkspaces(prev => prev.map(w => !w.userId ? { ...w, userId: newUser.id, members: [{ userId: newUser.id, role: 'admin' }] } : w));
    } else if (authView === 'login') {
      const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (user) setCurrentUser(user);
      else setAuthError('Email ou senha incorretos.');
    } else if (authView === 'forgot') {
      setAppAlert(`Um link de recuperação foi enviado para ${authForm.email}`);
      setAuthView('login');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    setAuthView('login');
  };

  const openProfileModal = () => {
    setProfileForm({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '', avatar: currentUser.avatar || '', currentPassword: '', newPassword: '' });
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    if (profileForm.email !== currentUser.email && users.find(u => u.email === profileForm.email && u.id !== currentUser.id)) {
      return setAppAlert("Este email já está sendo utilizado por outra conta.");
    }
    if (profileForm.currentPassword || profileForm.newPassword) {
      if (profileForm.currentPassword !== currentUser.password) return setAppAlert("Senha atual incorreta.");
    }
    
    const updatedUser = { 
      ...currentUser, name: profileForm.name, email: profileForm.email, phone: profileForm.phone, avatar: profileForm.avatar,
      password: profileForm.newPassword ? profileForm.newPassword : currentUser.password
    };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsProfileModalOpen(false);
    setAppAlert("Seu perfil foi atualizado com sucesso e está sincronizado com suas atividades.");
  };

  // --- Handlers de Tarefas & Histórico ---
  const createLog = (action, details) => ({ id: generateId(), userId: currentUser.id, action, details, timestamp: new Date().toISOString() });

  const handleOpenModal = (task = null, columnId = null) => {
    setSubtaskInput('');
    setCommentInput('');
    setEditingCommentId(null);
    setReplyingToId(null);
    setTaskModalTab('details');
    if (task) {
      setEditingTaskId(task.id);
      setTaskForm({ ...task, subtasks: task.subtasks || [], assignees: task.assignees || [], tagIds: task.tagIds || [], history: task.history || [], comments: task.comments || [], attachments: task.attachments || [], cardColor: task.cardColor || 'slate', completionComment: task.completionComment || '' });
    } else {
      setEditingTaskId(null);
      setTaskForm({ 
        title: '', description: '', priority: 'Média', status: columnId || activeWorkspace?.columns[0]?.id || 'todo', 
        cardColor: 'slate', deadline: new Date().toISOString().split('T')[0], subtasks: [], completionComment: '',
        assignees: [currentUser.id], tagIds: [], history: [], comments: [], attachments: []
      });
    }
    setIsModalOpen(true);
  };

  const toggleAssignee = (userId) => {
    setTaskForm(prev => {
      const isAssigned = prev.assignees.includes(userId);
      return { ...prev, assignees: isAssigned ? prev.assignees.filter(id => id !== userId) : [...prev.assignees, userId] };
    });
  };

  const toggleTaskTag = (tagId) => {
    setTaskForm(prev => {
      const currentTags = prev.tagIds || [];
      return { ...prev, tagIds: currentTags.includes(tagId) ? currentTags.filter(id => id !== tagId) : [...currentTags, tagId] };
    });
  };

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

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    if (taskForm.status === 'done' && hasPendingSubtasks(taskForm)) return setAppAlert("Conclua as subtarefas antes de Finalizar.");
    
    // Analisa quem foi recém adicionado para notificar
    const oldTask = editingTaskId ? tasks.find(t => t.id === editingTaskId) : null;
    const oldAssignees = oldTask ? oldTask.assignees || [] : [];
    const newAssignees = taskForm.assignees.filter(id => !oldAssignees.includes(id) && id !== currentUser?.id);

    newAssignees.forEach(uid => {
      addNotification(uid, 'Nova Atribuição', `${currentUser.name} atribuiu-lhe o card: ${taskForm.title}`);
    });

    if (editingTaskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === editingTaskId) {
          const isNowDone = taskForm.status === 'done';
          const wasDone = t.status === 'done';
          let newCompletedAt = t.completedAt;
          let logs = [...(taskForm.history || [])];

          if (t.title !== taskForm.title) logs.push(createLog('UPDATE', 'Alterou o título do card'));
          if (t.status !== taskForm.status) {
            const colName = activeWorkspace.columns.find(c => c.id === taskForm.status)?.title;
            logs.push(createLog('STATUS', `Moveu para "${colName}"`));
          }
          if (isNowDone && !wasDone) {
            newCompletedAt = new Date().toISOString();
            logs.push(createLog('COMPLETE', 'Finalizou o card e adicionou relato'));
          } else if (!isNowDone && wasDone) {
            newCompletedAt = null;
            logs.push(createLog('REOPEN', 'Reabriu o card (Removeu de Finalizado)'));
          }

          return { ...t, ...taskForm, completedAt: newCompletedAt, completionComment: isNowDone ? taskForm.completionComment : '', history: logs };
        }
        return t;
      }));
    } else {
      const newTask = { 
        ...taskForm, id: generateId(), workspaceId: activeWorkspace.id,
        status: taskForm.status || activeWorkspace.columns[0].id, createdAt: new Date().toISOString(), 
        completedAt: taskForm.status === 'done' ? new Date().toISOString() : null,
        completionComment: taskForm.status === 'done' ? taskForm.completionComment : '', deletedAt: null,
        history: [...(taskForm.history || []), createLog('CREATE', 'Criou o card original')]
      };
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleDrop = (columnId) => {
    if (!draggedTaskId) return;
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (!draggedTask || draggedTask.status === columnId) { 
      setDraggedTaskId(null); 
      return; 
    } 

    if (columnId === 'done' && hasPendingSubtasks(draggedTask)) {
      setAppAlert("Conclua todas as subtarefas dentro do card antes de movê-lo para 'Finalizado'!");
      setDraggedTaskId(null); 
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t.id === draggedTaskId) {
        const isNowDone = columnId === 'done';
        const wasDone = t.status === 'done';
        let newCompletedAt = t.completedAt;
        let logs = [...(t.history || [])];
        
        const colName = activeWorkspace.columns.find(c => c.id === columnId)?.title;
        logs.push(createLog('STATUS', `Moveu para "${colName}"`));

        if (isNowDone && !wasDone) {
          newCompletedAt = new Date().toISOString();
          logs.push(createLog('COMPLETE', 'Finalizou o card arrastando'));
        } else if (!isNowDone && wasDone) {
          newCompletedAt = null;
          logs.push(createLog('REOPEN', 'Reabriu o card'));
        }
        return { ...t, status: columnId, completedAt: newCompletedAt, completionComment: isNowDone ? t.completionComment : '', history: logs };
      }
      return t;
    }));
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

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setTaskForm(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), { id: generateId(), text: subtaskInput, completed: false }] }));
    setSubtaskInput('');
  };

  const handleToggleSubtask = (id) => {
    setTaskForm(prev => {
      const subtask = (prev.subtasks || []).find(st => st.id === id);
      const isCompleted = !subtask.completed;
      const log = createLog(isCompleted ? 'COMPLETE' : 'REOPEN', `${isCompleted ? 'Concluiu' : 'Reabriu'} a subtarefa: "${subtask.text}"`);
      return { 
        ...prev, 
        subtasks: (prev.subtasks || []).map(st => st.id === id ? { ...st, completed: isCompleted } : st),
        history: [...(prev.history || []), log]
      };
    });
  };

  const handleGenerateSubtasksWithAI = async () => {
    if (!taskForm.title) {
      setAppAlert("Escreva o título do card primeiro para a IA entender o que sugerir.");
      return;
    }
    setIsGeneratingSubtasks(true);
    try {
      const prompt = `A tarefa principal no Kanban é: "${taskForm.title}". ${taskForm.description ? `O contexto é: "${taskForm.description}".` : ''} Gere uma lista de 3 a 5 passos práticos para o time concluir este card.`;
      const steps = await callGeminiAPI(prompt, true);
      if (steps && Array.isArray(steps)) {
        const newSubtasks = steps.map(s => ({ id: generateId(), text: s.text, completed: false }));
        setTaskForm(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), ...newSubtasks] }));
      }
    } catch(e) {
      setAppAlert("Erro ao gerar passos com a IA. Tente novamente.");
    }
    setIsGeneratingSubtasks(false);
  };
  
  const handleDragStart = (e, id) => {
    e.stopPropagation();
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget;
    target.classList.add('is-dragging');
    setTimeout(() => { if(target) target.style.opacity = '0.3'; }, 0);
  };

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

  const toggleTagFilter = (tagId) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };
  
  const toggleAssigneeFilter = (userId) => {
    setSelectedAssignees(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);
    const target = e.currentTarget;
    if(target) { target.classList.remove('is-dragging'); target.style.opacity = '1'; }
  };

  // --- Handlers do Workspace (Configurações e Equipa) ---
  const createWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceTitle.trim()) return;
    const newWs = { 
      id: generateId(), userId: currentUser.id, title: newWorkspaceTitle, color: newWorkspaceColor, 
      columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
      members: [{ userId: currentUser.id, role: 'admin' }],
      tags: [{ id: generateId(), label: 'Urgente', color: 'rose' }, { id: generateId(), label: 'Estudo', color: 'indigo' }]
    };
    setWorkspaces(prev => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
    setNewWorkspaceTitle('');
    setNewWorkspaceColor('indigo');
    setIsNewWorkspaceModalOpen(false);
  };

  const openEditWorkspace = (e, workspace) => {
    e.stopPropagation();
    setEditingWorkspaceForm({ 
      id: workspace.id, title: workspace.title, color: workspace.color || 'indigo', 
      members: workspace.members || [{ userId: workspace.userId, role: 'admin' }], 
      tags: workspace.tags || [] 
    });
    setWsModalTab('general');
    setIsWorkspaceMenuOpen(false);
    setIsEditWorkspaceModalOpen(true);
  };

  const updateWorkspace = (e) => {
    e.preventDefault();
    if (!editingWorkspaceForm.title.trim()) return;
    setWorkspaces(prev => prev.map(w => w.id === editingWorkspaceForm.id ? { 
      ...w, title: editingWorkspaceForm.title, color: editingWorkspaceForm.color,
      members: editingWorkspaceForm.members, tags: editingWorkspaceForm.tags 
    } : w));
    setIsEditWorkspaceModalOpen(false);
    setAppAlert("Configurações do quadro atualizadas com sucesso!");
  };

  const requestDeleteWorkspace = () => {
    if (userWorkspaces.length <= 1) {
      setAppAlert("Você não pode apagar o seu único quadro. Crie um novo antes de apagar este.");
      return;
    }
    setIsEditWorkspaceModalOpen(false);
    setDeleteConfirmation({ type: 'workspace', action: 'trash', id: editingWorkspaceForm.id, title: editingWorkspaceForm.title });
  };

  // Funções dentro do Modal de Editar Workspace
  const handleToggleMember = (userId) => {
    setEditingWorkspaceForm(prev => {
      const isMember = prev.members.some(m => m.userId === userId);
      if (isMember) {
        if (userId === activeWorkspace.userId) return prev; // O dono não pode ser removido
        return { ...prev, members: prev.members.filter(m => m.userId !== userId) };
      } else {
        return { ...prev, members: [...prev.members, { userId, role: 'member' }] };
      }
    });
  };

  const handleChangeMemberRole = (userId, role) => {
    if (userId === activeWorkspace.userId) return; // Dono é sempre admin
    setEditingWorkspaceForm(prev => ({
      ...prev, members: prev.members.map(m => m.userId === userId ? { ...m, role } : m)
    }));
  };

  const handleAddTagToWorkspace = () => {
    if (!newTagForm.label.trim()) return;
    setEditingWorkspaceForm(prev => ({
      ...prev, tags: [...(prev.tags || []), { id: generateId(), label: newTagForm.label, color: newTagForm.color }]
    }));
    setNewTagForm({ label: '', color: 'indigo' });
  };

  const handleRemoveTagFromWorkspace = (tagId) => {
    setEditingWorkspaceForm(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== tagId) }));
  };

  // Funções de Colunas
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

  const getPriorityStyles = (p) => {
    switch (p) {
      case 'Alta': return { badge: 'text-red-700 bg-red-100 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800', calendar: 'bg-red-500 text-white border-red-600' };
      case 'Média': return { badge: 'text-amber-700 bg-amber-100 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800', calendar: 'bg-amber-400 text-amber-950 border-amber-500' };
      case 'Baixa': return { badge: 'text-emerald-700 bg-emerald-100 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800', calendar: 'bg-emerald-500 text-white border-emerald-600' };
      default: return { badge: 'text-slate-700 bg-slate-100 ring-slate-200 dark:bg-slate-800 dark:text-slate-400', calendar: 'bg-slate-500 text-white border-slate-600' };
    }
  };

  const getUserDetails = (uid) => users.find(u => u.id === uid) || { name: 'Usuário Removido', avatar: '' };

  // ==========================================
  // RENDERIZAÇÃO DAS TELAS DE AUTENTICAÇÃO
  // ==========================================
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="absolute top-6 right-6 p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border animate-in fade-in zoom-in duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-600/30 rotate-3"><BookOpen className="text-white w-8 h-8" /></div>
          </div>
          <h2 className="text-3xl font-black text-center tracking-tighter mb-2">STUDY NEXUS</h2>
          <p className={`text-center text-sm font-bold uppercase tracking-widest mb-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            {authView === 'login' ? 'Bem-vindo de volta' : authView === 'register' ? 'Crie sua conta' : 'Recuperar Senha'}
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && <div className="p-3 bg-red-100/50 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 rounded-2xl text-xs font-bold text-center">{authError}</div>}
            
            {authView === 'register' && (
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                <input required type="text" placeholder="Seu Nome" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className={`w-full pl-12 pr-4 py-4 rounded-[1.5rem] border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
              </div>
            )}
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
              <input required type="email" placeholder="Email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className={`w-full pl-12 pr-4 py-4 rounded-[1.5rem] border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
            </div>
            {authView !== 'forgot' && (
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                <input required type="password" placeholder="Senha" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full pl-12 pr-4 py-4 rounded-[1.5rem] border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
              </div>
            )}
            {authView === 'register' && (
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                <input required type="password" placeholder="Confirmar Senha" value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})} className={`w-full pl-12 pr-4 py-4 rounded-[1.5rem] border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
              </div>
            )}
            {authView === 'login' && (
              <div className="flex justify-end"><button type="button" onClick={() => {setAuthView('forgot'); setAuthError('');}} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">Esqueceu a senha?</button></div>
            )}
            <button type="submit" className={`w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] mt-4 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
              {authView === 'login' ? 'Entrar' : authView === 'register' ? 'Criar Conta' : 'Enviar Link'}
            </button>
          </form>

          <div className={`mt-8 pt-6 border-t text-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            {authView === 'login' ? (
              <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Não tem uma conta? <button onClick={() => {setAuthView('register'); setAuthError('');}} className="text-indigo-500 hover:text-indigo-600 ml-1">Registre-se</button></p>
            ) : (
              <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Já tem uma conta? <button onClick={() => {setAuthView('login'); setAuthError('');}} className="text-indigo-500 hover:text-indigo-600 ml-1">Fazer Login</button></p>
            )}
          </div>
        </div>
      </div>
    );
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
      <header className={`border-b px-8 py-5 flex flex-col xl:flex-row justify-between items-center sticky top-0 z-40 gap-4 shadow-sm backdrop-blur-md transition-colors ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex flex-col md:flex-row items-center gap-6 xl:gap-10 w-full xl:w-auto">
          
          <div className="relative z-40 w-full md:w-auto flex justify-center">
            {activeWorkspace && (
              <button onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)} className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <div className={`${PALETTE[activeWorkspace.color || 'indigo'].dot} p-1.5 rounded-xl shadow-inner rotate-3 transition-colors`}>
                  <Layout className="text-white w-5 h-5" />
                </div>
                <div className="text-left flex-1 min-w-[120px]">
                  <h1 className="text-sm font-black tracking-tight leading-none truncate max-w-[150px]">{activeWorkspace.title}</h1>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Workspace</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isWorkspaceMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isWorkspaceMenuOpen && (
              <div className={`absolute top-full mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="p-2 space-y-1">
                  <div className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Seus Quadros</div>
                  {userWorkspaces.map(w => {
                    const isWAdmin = w.userId === currentUser.id || w.members?.find(m => m.userId === currentUser.id)?.role === 'admin';
                    return (
                      <div key={w.id} className={`w-full px-2 py-1 rounded-xl flex items-center justify-between transition-colors ${activeWorkspace?.id === w.id ? (theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50') : (theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50')}`}>
                        <button onClick={() => { setActiveWorkspaceId(w.id); setIsWorkspaceMenuOpen(false); }} className={`flex-1 text-left px-2 py-2 text-sm font-bold flex items-center gap-3 truncate ${activeWorkspace?.id === w.id ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : (theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${PALETTE[w.color || 'indigo'].dot}`} />
                          <span className="truncate">{w.title}</span>
                        </button>
                        {isWAdmin && (
                          <button onClick={(e) => openEditWorkspace(e, w)} className={`p-2 transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`} title="Configurações do Quadro"><Settings size={14} /></button>
                        )}
                      </div>
                    );
                  })}
                  <div className={`my-1 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`} />
                  <button onClick={() => { setIsWorkspaceMenuOpen(false); setIsNewWorkspaceModalOpen(true); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <FolderPlus size={16} /> Criar Novo Quadro
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <nav className={`flex p-1.5 rounded-2xl border w-full md:w-auto justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <button onClick={() => setView('board')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'board' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Columns size={16} /> Quadro</button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'calendar' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><CalendarIcon size={16} /> Calendário</button>
            <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'dashboard' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Activity size={16} /> Estatísticas</button>
            <div className={`w-[1px] h-6 mx-2 my-auto ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <button onClick={() => setView('trash')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'trash' ? (theme === 'dark' ? 'bg-red-900/40 text-red-400 shadow-md' : 'bg-red-50 text-red-600 shadow-md') : 'text-slate-500 hover:text-red-400'}`}><Trash size={16} /> Lixeira</button>
          </nav>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
          <button onClick={() => handleOpenModal()} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 font-black text-xs uppercase tracking-widest ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
            <Plus size={16} strokeWidth={3} /> Novo Card
          </button>
          
          <div className={`w-[1px] h-8 mx-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {/* Botó de Cerca Global */}
          <div className="relative z-40">
            <button onClick={() => setIsSearchOpen(true)} className={`relative p-2.5 mr-2 rounded-full border transition-all active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} title="Cerca Global (Ctrl+K)">
              <Search size={18} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
            </button>
          </div>

          {/* Menu de Notificações */}
          <div className="relative z-40">
            <button onClick={() => { setIsNotifMenuOpen(!isNotifMenuOpen); if(!isNotifMenuOpen) markAllNotifsAsRead(); }} className={`relative p-2.5 mr-2 rounded-full border transition-all active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              <Bell size={18} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {isNotifMenuOpen && (
              <div className={`absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                  <h3 className={`text-sm font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Notificações</h3>
                  {userNotifications.length > 0 && (
                    <button onClick={() => setNotifications(prev => prev.filter(n => n.userId !== currentUser.id))} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest">Limpar</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {userNotifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell size={24} className={`mx-auto mb-2 opacity-20 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`} />
                      <p className={`text-xs font-bold mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nenhuma notificação nova.</p>
                    </div>
                  ) : (
                    userNotifications.map(n => (
                      <div key={n.id} className={`p-4 border-b last:border-0 transition-colors ${!n.read ? (theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50/50') : ''} ${theme === 'dark' ? 'border-slate-700/50 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{n.title}</span>
                          <span className={`text-[8px] font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(n.timestamp).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative z-40">
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <UserCircle size={20} />
                </div>
              )}
              <span className={`text-sm font-bold truncate max-w-[100px] ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{currentUser.name.split(' ')[0]}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <div className={`absolute top-full right-0 mt-2 w-56 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="p-2 space-y-1">
                  <div className={`px-4 py-3 flex items-center justify-between border-b mb-1 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tema</span>
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`p-2 rounded-xl border transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                  </div>
                  <button onClick={openProfileModal} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <User size={16} /> Meu Perfil
                  </button>
                  <button onClick={handleLogout} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${theme === 'dark' ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}`}>
                    <LogOut size={16} /> Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-100px)] animate-in fade-in duration-500 flex flex-col">
        
        {view === 'board' && activeWorkspace && (
          <>
            <div className={`mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-[2rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Filter size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? (theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800') : (theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50')}`}>Todas</button>
                  <button onClick={() => setFilter('overdue')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'overdue' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : (theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50')}`}><AlertCircle size={14} /> Atrasadas</button>
                  <button onClick={() => setFilter('urgent')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'urgent' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : (theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50')}`}>Urgentes</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setSortByDeadline(!sortByDeadline)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${sortByDeadline ? (theme === 'dark' ? 'bg-indigo-900/40 border-indigo-700 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600') : (theme === 'dark' ? 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50')}`}>
                  <ArrowDownUp size={14} /> {sortByDeadline ? 'Prazo Mais Próximo' : 'Ordenar por Prazo'}
                </button>
              </div>
            </div>
            
            {(activeWorkspace.tags?.length > 0 || activeWorkspace.members?.length > 0) && (
              <div className={`mb-8 p-5 rounded-[2rem] border shadow-sm transition-colors flex flex-col gap-4 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                
                {/* Linha de Etiquetas */}
                {activeWorkspace.tags && activeWorkspace.tags.length > 0 && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 w-full sm:w-auto min-w-[160px]">
                      <Tag size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Filtrar Etiquetas:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap flex-1">
                      {activeWorkspace.tags.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        const cInfo = PALETTE[tag.color];
                        return (
                          <button key={tag.id} onClick={() => toggleTagFilter(tag.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected ? `${cInfo.dot} text-white border-transparent shadow-md` : `${cInfo.soft} ${cInfo.text} ${cInfo.border} opacity-60 hover:opacity-100`}`}>
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Linha de Responsáveis */}
                {activeWorkspace.members && activeWorkspace.members.length > 0 && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 w-full sm:w-auto min-w-[160px]">
                      <Users size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Por Responsável:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap flex-1">
                      {activeWorkspace.members.map(member => {
                        const u = getUserDetails(member.userId);
                        const isSelected = selectedAssignees.includes(u.id);
                        return (
                          <button key={u.id} onClick={() => toggleAssigneeFilter(u.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : (theme === 'dark' ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100')}`}>
                            {u.avatar ? <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" /> : <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>{u.name.charAt(0)}</div>}
                            {u.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botão Limpar Filtros */}
                {(selectedTags.length > 0 || selectedAssignees.length > 0) && (
                  <div className={`pt-3 mt-1 border-t flex justify-end ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button onClick={() => { setSelectedTags([]); setSelectedAssignees([]); }} className={`text-[10px] font-black uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>
                      Limpar Todos os Filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-8 items-start overflow-x-auto pb-8 custom-scrollbar">
              {activeWorkspace.columns.map(column => {
                const colColorInfo = PALETTE[column.color || 'slate'];
                
                return (
                <div 
                  key={column.id} 
                  draggable={isCurrentUserAdmin && !draggedTaskId}
                  onDragStart={(e) => handleColumnDragStart(e, column.id)}
                  onDragEnd={handleColumnDragEnd}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => handleColumnDrop(e, column.id)} 
                  className={`flex flex-col rounded-[2.5rem] border p-5 min-h-[500px] max-h-[2500px] w-full md:w-[380px] flex-shrink-0 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-200/40 border-slate-200/60'} ${draggedColumnId === column.id ? 'opacity-40 scale-[0.98]' : ''}`}
                >
                  <div className={`px-4 py-3 flex justify-between items-center mb-6 relative rounded-2xl transition-colors ${draggedColumnId ? (theme === 'dark' ? 'bg-slate-800' : 'bg-white') : ''}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isCurrentUserAdmin && (
                        <div className={`cursor-grab active:cursor-grabbing flex-shrink-0 ${theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`} title="Arraste para reordenar">
                          <GripVertical size={16} />
                        </div>
                      )}
                      <div className={`relative ${editingColumnId === column.id ? 'z-50' : 'z-20'}`}>
                        {isCurrentUserAdmin ? (
                          <button onClick={(e) => { e.stopPropagation(); setEditingColumnId(editingColumnId === column.id ? null : column.id); }} className={`w-4 h-4 rounded-full ${colColorInfo.dot} shadow-sm ring-2 ring-offset-2 transition-all hover:scale-110 flex-shrink-0 ${theme === 'dark' ? 'ring-slate-800 ring-offset-slate-900' : 'ring-white ring-offset-slate-200'}`} title="Mudar cor da coluna" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full ${colColorInfo.dot} shadow-sm flex-shrink-0`} />
                        )}
                        {editingColumnId === column.id && isCurrentUserAdmin && (
                          <div className={`absolute top-full left-0 mt-2 p-2 rounded-2xl shadow-xl flex gap-2 border animate-in zoom-in z-50 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            {COLOR_KEYS.map(k => (
                              <button key={k} type="button" onClick={(e) => { e.stopPropagation(); changeColumnColor(column.id, k); }} className={`w-5 h-5 rounded-full ${PALETTE[k].dot} hover:scale-110 transition-transform ${column.color === k ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white' : ''}`} />
                            ))}
                          </div>
                        )}
                      </div>

                      {renamingColumnId === column.id && isCurrentUserAdmin ? (
                        <input 
                          autoFocus
                          value={renameColumnTitle}
                          onChange={(e) => setRenameColumnTitle(e.target.value)}
                          onBlur={() => saveColumnRename(column.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveColumnRename(column.id); }}
                          className={`font-black uppercase text-[11px] tracking-[0.2em] w-full bg-transparent border-b focus:outline-none ${theme === 'dark' ? 'text-slate-200 border-indigo-500' : 'text-slate-800 border-indigo-500'}`}
                        />
                      ) : (
                        <h2 onClick={() => startRenameColumn(column)} className={`font-black uppercase text-[11px] tracking-[0.2em] truncate ${isCurrentUserAdmin ? 'cursor-pointer hover:opacity-80' : ''} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} title={isCurrentUserAdmin ? "Clique para renomear" : ""}>
                          {column.title}
                        </h2>
                      )}

                      <span className={`border text-[10px] px-2.5 py-0.5 rounded-full font-black ml-auto flex-shrink-0 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {processedTasks.filter(t => t.status === column.id).length}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 ml-2 flex-shrink-0 ${columnMenuOpenId === column.id ? 'z-50' : 'z-20'}`}>
                      <button onClick={() => handleOpenModal(null, column.id)} className={`p-1.5 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`} title="Adicionar Card">
                        <Plus size={16} />
                      </button>
                      
                      {isCurrentUserAdmin && (
                        <div className="relative">
                          <button onClick={() => setColumnMenuOpenId(columnMenuOpenId === column.id ? null : column.id)} className={`p-1.5 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-white'}`}>
                            <MoreVertical size={16} />
                          </button>
                          {columnMenuOpenId === column.id && (
                            <div className={`absolute top-full right-0 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in z-50 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                              <div className="p-1.5 flex flex-col">
                                <button onClick={() => startRenameColumn(column)} className={`text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}><Edit3 size={14}/> Renomear</button>
                                <button onClick={() => handleMoveColumn(column.id, 'left')} className={`text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}><ArrowLeft size={14}/> Mover Esquerda</button>
                                <button onClick={() => handleMoveColumn(column.id, 'right')} className={`text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}><ArrowRight size={14}/> Mover Direita</button>
                                <div className={`my-1 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`} />
                                <button onClick={() => handleDeleteColumn(column.id)} className={`text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'dark' ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}`}><Trash2 size={14}/> Excluir Coluna</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-2">
                    {processedTasks.filter(t => t.status === column.id).map(task => {
                      const priorityStyles = getPriorityStyles(task.priority);
                      const isOverdue = checkIsOverdue(task.deadline) && task.status !== 'done';
                      const cardColorInfo = PALETTE[task.cardColor || 'slate'];
                      
                      return (
                        <div key={task.id} draggable="true" onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} onClick={() => handleOpenModal(task)} 
                          className={`group p-6 rounded-[2rem] shadow-sm border transition-all cursor-grab active:cursor-grabbing relative overflow-hidden transform-gpu flex-shrink-0
                            ${isOverdue ? (theme === 'dark' ? 'bg-slate-800 border-red-900/50 hover:border-red-500 shadow-red-900/10' : 'bg-white border-red-200 hover:border-red-400 shadow-red-100') 
                                        : `${cardColorInfo.soft} ${cardColorInfo.border} hover:border-indigo-400 shadow-sm`}`}
                        >
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <GripVertical className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} group-hover:text-indigo-400 transition-colors`} size={14} />
                              
                              {/* Nova Bolinha de Cor do Card */}
                              <div className={`relative ${editingTaskColorId === task.id ? 'z-50' : 'z-20'}`}>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingTaskColorId(editingTaskColorId === task.id ? null : task.id); }} 
                                  className={`w-3.5 h-3.5 rounded-full ${cardColorInfo.dot} shadow-sm ring-2 ring-offset-1 transition-all hover:scale-110 flex-shrink-0 ${theme === 'dark' ? 'ring-slate-800 ring-offset-slate-900' : 'ring-white ring-offset-slate-200'}`} 
                                  title="Alterar cor do card" 
                                />
                                {editingTaskColorId === task.id && (
                                  <div className={`absolute top-full left-0 mt-2 p-2 rounded-2xl shadow-xl flex gap-2 border animate-in zoom-in z-50 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    {COLOR_KEYS.map(k => (
                                      <button 
                                        key={k} 
                                        type="button" 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, cardColor: k, history: [...(t.history || []), createLog('UPDATE', 'Alterou a cor do card (atalho rápido)')] } : t));
                                          setEditingTaskColorId(null);
                                        }} 
                                        className={`w-5 h-5 rounded-full ${PALETTE[k].dot} hover:scale-110 transition-transform ${task.cardColor === k ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white' : ''}`} 
                                        title={PALETTE[k].name}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>

                              <span className={`text-[9px] font-black px-3 py-1 rounded-full ring-1 uppercase tracking-tighter ${priorityStyles.badge}`}>
                                {task.priority}
                              </span>
                              {isOverdue && (
                                <span className="flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 uppercase tracking-tighter animate-pulse">
                                  <AlertCircle size={10} /> Atrasada
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <select
                                value={task.status}
                                onChange={(e) => handleMoveTaskStatus(e, task.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md outline-none cursor-pointer border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400'}`}
                                title="Mover Card para..."
                              >
                                {activeWorkspace.columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                              </select>
                              {isCurrentUserAdmin && (
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ type: 'task', action: 'trash', id: task.id, title: task.title }); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1" title="Excluir Card">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Renderização de Etiquetas na Visão do Card */}
                          {task.tagIds && task.tagIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3 mt-3">
                              {task.tagIds.map(tid => {
                                const tInfo = activeWorkspace.tags?.find(tag => tag.id === tid);
                                if(!tInfo) return null;
                                const cInfo = PALETTE[tInfo.color];
                                return (
                                  <span key={tid} className={`text-[9px] font-black px-2 py-0.5 rounded-md ${cInfo.soft} ${cInfo.text} border ${cInfo.border} truncate max-w-[120px]`}>
                                    {tInfo.label}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          
                          <h3 className={`font-bold text-lg mb-1 tracking-tight leading-snug ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{task.title}</h3>
                          <p className={`text-xs mb-5 line-clamp-2 leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{task.description}</p>
                          
                          {/* Exibição Atualizada dos Responsáveis (Chips com Nomes) */}
                          {task.assignees && task.assignees.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {task.assignees.map(uid => {
                                const u = getUserDetails(uid);
                                return (
                                  <div key={uid} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200 shadow-sm'}`}>
                                    {u.avatar ? (
                                      <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
                                        {u.name.charAt(0)}
                                      </div>
                                    )}
                                    <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                      {u.name.split(' ')[0]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className={`flex flex-col gap-3 pt-4 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}`}>
                                  <Clock size={12} /> Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')}
                                </div>
                                {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    <ListTodo size={12} /> {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                                  </div>
                                )}
                                {Array.isArray(task.attachments) && task.attachments.length > 0 && (
                                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    <Paperclip size={12} /> {task.attachments.length}
                                  </div>
                                )}
                                {Array.isArray(task.comments) && task.comments.length > 0 && (
                                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    <MessageSquare size={12} /> {task.comments.length}
                                  </div>
                                )}
                              </div>
                              {task.status === 'done' && <CheckCircle2 size={18} className="text-emerald-500" />}
                            </div>
                            {task.status === 'done' && task.completedAt && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/30 px-3 py-2 rounded-xl w-fit">
                                  <CheckCircle2 size={12} /> Encerrado em: {new Date(task.completedAt).toLocaleDateString('pt-BR')}
                                </div>
                                {task.completionComment && (
                                  <button onClick={(e) => { e.stopPropagation(); setViewingCommentTask(task); }} className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl w-fit transition-colors ${theme === 'dark' ? 'bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900/60' : 'bg-indigo-100/70 text-indigo-600 hover:bg-indigo-200'}`} title="Ver comentário de conclusão">
                                    <MessageSquare size={12} /> Ver Relato
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Botão de Adicionar Card Rápido na Coluna */}
                    <button onClick={() => handleOpenModal(null, column.id)} className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all active:scale-95 font-bold text-xs uppercase tracking-widest mt-2 ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/50' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-100'}`}>
                      <Plus size={14} strokeWidth={3} /> Adicionar Card
                    </button>
                    
                  </div>
                </div>
              )})}

              {isCurrentUserAdmin && (
                <button onClick={handleAddColumn} className={`flex-shrink-0 flex items-center justify-center gap-2 h-16 w-[380px] rounded-[2.5rem] border-2 border-dashed transition-all active:scale-95 font-black uppercase text-xs tracking-widest ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 bg-slate-900/30' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 bg-slate-100/50'}`}>
                  <Plus size={16} strokeWidth={3} /> Nova Coluna
                </button>
              )}

            </div>
          </>
        )}

        {view === 'calendar' && (
          <div className={`rounded-[3rem] shadow-2xl border overflow-hidden flex flex-col h-full min-h-[800px] transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200'}`}>
            <div className={`p-8 border-b flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50/30 border-slate-100'}`}>
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black tracking-tighter capitalize min-w-[250px]">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                <div className={`flex items-center rounded-2xl shadow-sm border p-1 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => {const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d);}} className={`p-2.5 rounded-xl transition-all active:scale-90 ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}><ChevronLeft size={22} /></button>
                  <div className={`w-[1px] h-6 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
                  <button onClick={() => setCurrentDate(new Date())} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isCurrentMonth ? (theme === 'dark' ? 'text-slate-600' : 'text-slate-300') : 'text-indigo-600 hover:bg-indigo-50/10 active:scale-95'}`} disabled={isCurrentMonth}>
                    <RotateCcw size={14} className={!isCurrentMonth ? "animate-in fade-in zoom-in" : ""} /> Hoje
                  </button>
                  <div className={`w-[1px] h-6 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
                  <button onClick={() => {const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d);}} className={`p-2.5 rounded-xl transition-all active:scale-90 ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}><ChevronRight size={22} /></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-800/10">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (<div key={d} className={`py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>{d}</div>))}
            </div>
            <div className="grid grid-cols-7 flex-1">
              {calendarDays.map((item, idx) => {
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isDayToday = item.date === todayString;
                const holiday = holidays.find(h => h.date === item.date);
                
                return (
                  <div key={idx} className={`min-h-[150px] p-4 border-r border-b flex flex-col group transition-all ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} ${item.type === 'padding' ? (theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-50/50') : (theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800/50' : 'bg-white hover:bg-slate-50/30')}`}>
                    {item.day && (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-sm font-black w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${isDayToday ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200/40 scale-110' : (theme === 'dark' ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600')}`}>{item.day}</span>
                          {holiday && <button onClick={() => setHolidayDetail(holiday)} className={`transition-colors p-1.5 rounded-xl ${theme === 'dark' ? 'text-indigo-400 bg-indigo-900/30' : 'text-indigo-400 bg-indigo-50'}`}><Info size={16} strokeWidth={2.5} /></button>}
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                          {processedTasks.filter(t => t.deadline === item.date).map(t => {
                            const isOverdue = checkIsOverdue(t.deadline) && t.status !== 'done';
                            const completedLog = t.completedAt ? `Encerrado em: ${new Date(t.completedAt).toLocaleDateString('pt-BR')}` : '';
                            return (
                              <button key={t.id} onClick={() => handleOpenModal(t)} title={completedLog} className={`w-full text-left text-[9px] px-3 py-2 rounded-xl font-black truncate shadow-sm transition-all hover:scale-105 active:scale-95 border-b-2 border-black/10 flex items-center justify-between gap-1 ${getPriorityStyles(t.priority).calendar} ${t.status === 'done' ? 'opacity-50 grayscale-[0.5]' : ''} ${isOverdue ? 'ring-2 ring-red-500 ring-offset-1 dark:ring-offset-slate-900 animate-pulse' : ''}`}>
                                <span className="truncate">{t.title}</span>
                                {t.status === 'done' && <CheckCircle2 size={12} className="shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Renderização do Dashboard (Estatísticas) */}
        {view === 'dashboard' && activeWorkspace && (() => {
          const wsTasks = workspaceTasks.filter(t => !t.deletedAt);
          const totalT = wsTasks.length;
          const doneT = wsTasks.filter(t => t.status === 'done').length;
          const progressPct = totalT === 0 ? 0 : Math.round((doneT / totalT) * 100);
          const overdueT = wsTasks.filter(t => t.status !== 'done' && checkIsOverdue(t.deadline)).length;
          const urgentT = wsTasks.filter(t => t.status !== 'done' && t.priority === 'Alta').length;

          return (
            <div className={`rounded-[3rem] shadow-2xl border p-8 flex flex-col h-full min-h-[800px] transition-colors overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tighter">Dashboard de Produtividade</h2>
                <p className={`text-sm font-bold uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Visão Geral: {activeWorkspace.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Card 1 */}
                <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}><ListTodo size={24} /></div>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total de Cards</h3>
                  </div>
                  <p className="text-4xl font-black">{totalT}</p>
                </div>
                
                {/* Card 2 */}
                <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><CheckCircle2 size={24} /></div>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Concluídos</h3>
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-emerald-500">{progressPct}%</p>
                    <p className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{doneT} de {totalT}</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}><AlertCircle size={24} /></div>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Atrasados</h3>
                  </div>
                  <p className="text-4xl font-black text-red-500">{overdueT}</p>
                </div>

                {/* Card 4 */}
                <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}><AlertTriangle size={24} /></div>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Urgentes Pend.</h3>
                  </div>
                  <p className="text-4xl font-black text-amber-500">{urgentT}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status por Coluna */}
                <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-lg font-black tracking-tight mb-6">Progresso por Fases</h3>
                  <div className="space-y-6">
                    {activeWorkspace.columns.map(col => {
                      const colTasks = wsTasks.filter(t => t.status === col.id).length;
                      const pct = totalT === 0 ? 0 : Math.round((colTasks / totalT) * 100);
                      const cInfo = PALETTE[col.color || 'slate'];
                      return (
                        <div key={col.id}>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{col.title}</span>
                            <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>{colTasks} cards ({pct}%)</span>
                          </div>
                          <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <div className={`h-full rounded-full ${cInfo.dot} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Carga por Membro */}
                <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-lg font-black tracking-tight mb-6">Carga de Trabalho (Pendentes)</h3>
                  <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {activeWorkspace.members.map(m => {
                       const u = getUserDetails(m.userId);
                       const mTasks = wsTasks.filter(t => t.assignees.includes(u.id) && t.status !== 'done').length;
                       const maxT = Math.max(...activeWorkspace.members.map(mem => wsTasks.filter(t => t.assignees.includes(mem.userId) && t.status !== 'done').length), 1);
                       const pct = Math.round((mTasks / maxT) * 100);

                       return (
                         <div key={u.id} className="flex items-center gap-4">
                            {u.avatar ? (
                              <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">{u.name.charAt(0)}</div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between text-xs font-bold mb-2">
                                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{u.name}</span>
                                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>{mTasks} pendentes</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <div className={`h-full rounded-full bg-indigo-500 transition-all duration-1000`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {view === 'trash' && (
          <div className={`rounded-[3rem] shadow-2xl border overflow-hidden flex flex-col min-h-[700px] transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50/30 border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-500'}`}>
                  <Trash size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">Lixeira Global</h2>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Itens de todos os quadros excluídos há menos de 30 dias.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className={`flex items-center px-4 py-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <Search size={16} className="mr-2 opacity-50" />
                  <input type="date" value={trashSearchDate} onChange={(e) => setTrashSearchDate(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full sm:w-auto" title="Filtrar por data" />
                  {trashSearchDate && <button onClick={() => setTrashSearchDate('')} className="ml-2 hover:text-red-500"><X size={14}/></button>}
                </div>
                {deletedTasks.length > 0 && isCurrentUserAdmin && (
                  <button onClick={() => setDeleteConfirmation({ type: 'empty_trash' })} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 font-black text-xs uppercase tracking-widest w-full sm:w-auto justify-center">
                    <Trash2 size={16} /> Esvaziar
                  </button>
                )}
              </div>
            </div>

            <div className={`p-8 flex-1 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
              {deletedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] opacity-50">
                  <Trash size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-xl font-black text-slate-400 dark:text-slate-500">Lixeira Vazia</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {deletedTasks.map(task => {
                    const deletedDate = new Date(task.deletedAt);
                    const diffDays = Math.floor(Math.abs(new Date() - deletedDate) / (1000 * 60 * 60 * 24));
                    const daysLeft = Math.max(0, 30 - diffDays);
                    const wsExists = userWorkspaces.some(w => w.id === task.workspaceId);
                    const wsName = wsExists ? userWorkspaces.find(w => w.id === task.workspaceId)?.title : 'Quadro Excluído';

                    return (
                      <div key={task.id} className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden opacity-80 hover:opacity-100 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full ring-1 uppercase tracking-tighter ${getPriorityStyles(task.priority).badge}`}>{task.priority}</span>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${daysLeft <= 3 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>Exclui em {daysLeft}d</span>
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-widest mb-3 truncate border-b pb-2 ${!wsExists ? 'text-red-500 border-red-100 dark:border-red-900' : 'text-indigo-500 border-slate-100 dark:border-slate-700'}`}>{wsName}</div>
                        <h3 className={`font-bold text-lg mb-1 tracking-tight leading-snug line-through decoration-slate-400/50 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{task.title}</h3>
                        <p className={`text-xs mb-5 line-clamp-2 leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{task.description}</p>
                        <div className={`pt-4 border-t flex items-center justify-between gap-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                          <button onClick={(e) => { 
                            e.stopPropagation(); 
                            setTasks(tasks.map(t => t.id === task.id ? { ...t, deletedAt: null, workspaceId: wsExists ? t.workspaceId : activeWorkspace.id } : t)); 
                          }} className="flex-1 flex justify-center items-center gap-2 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all">
                            <RotateCcw size={14} /> Restaurar
                          </button>
                          {isCurrentUserAdmin && (
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ type: 'task', action: 'permanent', id: task.id, title: task.title }); }} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 transition-all">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- Modais --- */}
      
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xl z-[70] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/20'}`}>
            <div className={`px-8 py-6 border-b shrink-0 flex justify-between items-center transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
              <div>
                <h2 className="text-xl font-black tracking-tighter">Meu Perfil</h2>
                <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-[10px] font-black uppercase tracking-widest mt-1`}>Configure sua conta</p>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className={`p-3 rounded-xl border transition-all hover:rotate-90 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}><X size={20} /></button>
            </div>
            <form onSubmit={saveProfile} className="p-8 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              <div className="flex flex-col items-center justify-center mb-2">
                {profileForm.avatar ? (
                  <img src={profileForm.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 mb-3 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 mb-3 shadow-lg border border-indigo-200">
                    <UserCircle size={40} />
                  </div>
                )}
                <div className="w-full relative">
                  <Camera className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input type="url" placeholder="URL da foto (Avatar)" value={profileForm.avatar} onChange={e => setProfileForm({...profileForm, avatar: e.target.value})} className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-xs shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nome</label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>E-mail</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input required type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Telefone</label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input type="tel" placeholder="(00) 00000-0000" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Trocar Senha (Opcional)</p>
                <div className="space-y-3">
                  <div className="relative">
                    <KeyRound className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input type="password" placeholder="Senha Atual" value={profileForm.currentPassword} onChange={e => setProfileForm({...profileForm, currentPassword: e.target.value})} className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-xs shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input type="password" placeholder="Nova Senha" value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-xs shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                  </div>
                </div>
              </div>

              <button type="submit" className={`w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] mt-4 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                Salvar Perfil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Tarefa Atualizado (Com Abas, Histórico e Etiquetas) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4 sm:p-6">
          <div className={`rounded-[2rem] w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/20'}`}>
            <div className={`px-8 py-6 border-b shrink-0 flex justify-between items-center transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
              <div>
                <h2 className="text-xl font-black tracking-tighter">{editingTaskId ? 'Editar Card' : 'Novo Card'}</h2>
                <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-[10px] font-black uppercase tracking-widest mt-1`}>Quadro Atual: {activeWorkspace?.title}</p>
              </div>
              
              <div className={`flex rounded-xl p-1 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <button type="button" onClick={() => setTaskModalTab('details')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${taskModalTab === 'details' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500'}`}>
                  Detalhes
                </button>
                <button type="button" onClick={() => setTaskModalTab('history')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${taskModalTab === 'history' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500'}`}>
                  Histórico
                </button>
              </div>

              <button onClick={() => setIsModalOpen(false)} className={`p-3 rounded-xl border transition-all hover:rotate-90 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}><X size={20} /></button>
            </div>
            
            {taskModalTab === 'details' ? (
              <form onSubmit={handleSaveTask} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-3">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>O que você vai dominar?</label>
                  <input autoFocus required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none transition-all font-bold text-lg shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} placeholder="Ex: Machine Learning" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Prazo Final</label>
                    <input type="date" required value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none font-bold ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                  </div>
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Prioridade</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none font-bold appearance-none cursor-pointer shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-white border-slate-100 focus:border-indigo-500 text-slate-800'}`}>
                      <option value="Baixa">🟢 Baixa</option>
                      <option value="Média">🟡 Média</option>
                      <option value="Alta">🔴 Alta</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Users size={12} /> Responsáveis
                    </label>
                    <div className={`w-full px-4 py-3 rounded-[1rem] border-2 flex flex-wrap gap-2 items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      {users.map(u => {
                        const isSelected = (taskForm.assignees || []).includes(u.id);
                        return (
                          <button 
                            key={u.id} type="button" onClick={() => toggleAssignee(u.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isSelected ? (theme === 'dark' ? 'bg-indigo-900/50 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200') : (theme === 'dark' ? 'opacity-50 grayscale border border-transparent' : 'opacity-60 grayscale border border-transparent hover:opacity-100')}`}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-slate-300">{u.name.charAt(0)}</div>
                            )}
                            <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>{u.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Tag size={12} /> Etiquetas
                    </label>
                    <div className={`w-full px-4 py-3 rounded-[1rem] border-2 flex flex-wrap gap-2 items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      {activeWorkspace?.tags?.map(tag => {
                        const isSelected = (taskForm.tagIds || []).includes(tag.id);
                        const cInfo = PALETTE[tag.color];
                        return (
                          <button key={tag.id} type="button" onClick={() => toggleTaskTag(tag.id)} className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected ? `${cInfo.dot} text-white border-transparent shadow-sm` : `${cInfo.soft} ${cInfo.text} ${cInfo.border} opacity-60 hover:opacity-100`}`}>
                            {tag.label}
                          </button>
                        );
                      })}
                      {(!activeWorkspace?.tags || activeWorkspace.tags.length === 0) && <span className="text-xs text-slate-400 font-bold">Nenhuma etiqueta criada no quadro.</span>}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Progresso</label>
                    <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none font-bold appearance-none cursor-pointer shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-white border-slate-100 focus:border-indigo-500 text-slate-800'}`}>
                      {activeWorkspace?.columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}><Palette size={12} /> Cor do Card</label>
                    <div className={`w-full px-4 py-3.5 rounded-[1rem] border-2 flex flex-wrap gap-2 items-center justify-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      {COLOR_KEYS.map(k => (
                        <button key={k} type="button" onClick={() => setTaskForm({...taskForm, cardColor: k})} className={`w-6 h-6 rounded-full ${PALETTE[k].dot} transition-transform hover:scale-110 ${taskForm.cardColor === k ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : 'opacity-70 grayscale-[0.3]'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Checklist / Subtarefas
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(e); }} className={`flex-1 px-6 py-4 rounded-[1rem] border-2 focus:outline-none font-bold text-sm shadow-inner transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} placeholder="Ex: Revisar capítulo 2..." />
                    <button type="button" onClick={handleAddSubtask} className={`px-5 rounded-[1rem] flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`} title="Adicionar">
                      <PlusCircle size={20} strokeWidth={2.5} />
                    </button>
                    <button type="button" onClick={handleGenerateSubtasksWithAI} disabled={isGeneratingSubtasks} className={`px-5 rounded-[1rem] flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 border border-amber-900/50' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'}`} title="Gerar passos com IA">
                      {isGeneratingSubtasks ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                  {taskForm.subtasks && taskForm.subtasks.length > 0 && (
                    <div className={`space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2 p-3 rounded-[1.5rem] border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800/50' : 'bg-slate-50/50 border-slate-100/50'}`}>
                      {taskForm.subtasks.map(st => (
                        <div key={st.id} className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${st.completed ? (theme === 'dark' ? 'bg-slate-800/40 border-slate-800 opacity-40' : 'bg-white/50 border-slate-100 opacity-50') : (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm')}`}>
                          <div className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer" onClick={() => handleToggleSubtask(st.id)}>
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (theme === 'dark' ? 'border-slate-600 bg-slate-900/50' : 'border-slate-300 bg-slate-50')}`}>
                              {st.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                            </div>
                            <span className={`font-bold text-xs truncate transition-all ${st.completed ? 'line-through decoration-2' : ''} ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{st.text}</span>
                          </div>
                          <button type="button" onClick={() => setDeleteConfirmation({ type: 'subtask', action: 'permanent', id: st.id, title: st.text })} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Detalhes / Observações 
                    <span className="text-[8px] opacity-70 border px-1.5 py-0.5 rounded-md border-current">Markdown</span>
                  </label>
                  <MarkdownEditor 
                    value={taskForm.description} 
                    onChange={val => setTaskForm({...taskForm, description: val})} 
                    theme={theme} 
                  />
                </div>

                <div className="space-y-3">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Paperclip size={12} /> Anexos
                  </label>
                  <div className={`w-full p-4 rounded-[1rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-300'}`}>
                     <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" />
                     <label htmlFor="file-upload" className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white border shadow-sm hover:bg-slate-50 text-slate-700'}`}>
                        Adicionar Ficheiro
                     </label>
                  </div>
                  {taskForm.attachments && taskForm.attachments.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                       {taskForm.attachments.map(att => (
                          <div key={att.id} className={`relative group p-2 rounded-xl border flex items-center gap-3 overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            {att.type.startsWith('image/') ? (
                              <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><FileText size={16} /></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{att.name}</p>
                            </div>
                            <button type="button" onClick={() => setTaskForm(prev => ({...prev, attachments: prev.attachments.filter(a => a.id !== att.id)}))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                          </div>
                       ))}
                     </div>
                  )}
                </div>

                {taskForm.status === 'done' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}`}>Comentário de Conclusão (Opcional)</label>
                    <textarea value={taskForm.completionComment} onChange={e => setTaskForm({...taskForm, completionComment: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none transition-all font-medium text-sm shadow-inner min-h-[80px] resize-none ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-900/50 focus:border-emerald-500 text-emerald-100' : 'bg-emerald-50/50 border-emerald-200 focus:border-emerald-500 text-emerald-900'}`} placeholder="Quais foram os resultados ou aprendizados finais deste card?" />
                  </div>
                )}

                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <MessageSquare size={12} /> Chat da Tarefa
                </label>
                <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                  {(taskForm.comments || []).length === 0 ? (
                    <p className={`text-xs font-medium text-center ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Nenhum comentário ainda.</p>
                  ) : (
                    (taskForm.comments || []).map(c => {
                      const u = getUserDetails(c.userId);
                      const isMyComment = c.userId === currentUser.id;
                      return (
                        <div key={c.id} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {u.avatar ? <img src={u.avatar} className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{u.name.charAt(0)}</div>}
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{u.name}</span>
                            <span className={`text-[9px] uppercase tracking-widest font-black ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(c.timestamp).toLocaleString('pt-BR')}</span>
                          </div>
                          
                          {editingCommentId === c.id ? (
                            <div className="pl-8 mt-2 space-y-2">
                              <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} className={`w-full p-3 rounded-xl border text-sm resize-none focus:outline-none ${theme === 'dark' ? 'bg-slate-900 border-indigo-500 text-white' : 'bg-white border-indigo-500'}`} autoFocus />
                              <div className="flex gap-2">
                                <button type="button" onClick={() => handleSaveEditComment(c.id)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Salvar</button>
                                <button type="button" onClick={() => setEditingCommentId(null)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} pl-8 whitespace-pre-wrap break-words`}>{c.text}</p>
                              <div className="flex gap-3 pl-8 mt-2">
                                <button type="button" onClick={() => { setReplyingToId(c.id); setReplyText(''); }} className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Responder</button>
                                {isMyComment && (
                                  <>
                                    <button type="button" onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.text); }} className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Editar</button>
                                    <button type="button" onClick={() => handleDeleteComment(c.id)} className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Excluir</button>
                                  </>
                                )}
                              </div>
                            </>
                          )}

                          {/* Respostas (Replies) */}
                          {c.replies && c.replies.length > 0 && (
                            <div className="mt-4 pl-8 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                              {c.replies.map(reply => {
                                const ru = getUserDetails(reply.userId);
                                const isMyReply = reply.userId === currentUser.id;
                                return (
                                  <div key={reply.id} className="pl-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      {ru.avatar ? <img src={ru.avatar} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-slate-300">{ru.name.charAt(0)}</div>}
                                      <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{ru.name}</span>
                                      <span className={`text-[8px] uppercase tracking-widest font-black ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(reply.timestamp).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} pl-7 whitespace-pre-wrap break-words`}>{reply.text}</p>
                                    {isMyReply && (
                                      <button type="button" onClick={() => handleDeleteReply(c.id, reply.id)} className={`text-[9px] font-bold uppercase tracking-widest hover:underline ml-7 mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>Excluir</button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Caixa de Resposta */}
                          {replyingToId === c.id && (
                            <div className="pl-8 mt-3 flex gap-2">
                              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') { e.preventDefault(); handleAddReply(c.id); }}} className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none font-medium text-xs transition-all ${theme === 'dark' ? 'bg-slate-900 border-indigo-500 text-slate-100' : 'bg-white border-indigo-500 text-slate-800'}`} placeholder="Escreva uma resposta..." autoFocus />
                              <button type="button" onClick={() => handleAddReply(c.id)} className={`px-3 rounded-lg flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                <Send size={12} />
                              </button>
                              <button type="button" onClick={() => setReplyingToId(null)} className={`px-2 rounded-lg flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex gap-2">
                    <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') { e.preventDefault(); handleAddComment(e); }}} className={`flex-1 px-5 py-3 rounded-[1rem] border-2 focus:outline-none font-bold text-sm shadow-inner transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} placeholder="Escreva um comentário..." />
                    <button type="button" onClick={handleAddComment} className={`px-5 rounded-[1rem] flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      <Send size={16} />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className={`w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                    <CheckCircle2 size={20} strokeWidth={3} /> {editingTaskId ? 'Salvar Card' : 'Salvar Card'}
                  </button>
                </div>
              </form>
            ) : (
              /* ABA DE HISTÓRICO */
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                {!editingTaskId ? (
                   <div className="flex flex-col items-center justify-center h-full opacity-50">
                     <History size={48} className="mb-4 text-slate-400" />
                     <p className="text-sm font-bold text-slate-500">Salve o card primeiro para ver o histórico.</p>
                   </div>
                ) : (taskForm.history && taskForm.history.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8 pb-4">
                    {[...(taskForm.history || [])].reverse().map(log => {
                      const u = getUserDetails(log.userId);
                      return (
                        <div key={log.id} className="relative pl-6">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center">
                            {log.action === 'CREATE' && <Plus size={8} className="text-white" />}
                            {log.action === 'STATUS' && <ArrowDownUp size={8} className="text-white" />}
                            {log.action === 'COMPLETE' && <CheckCircle2 size={8} className="text-white" />}
                            {log.action === 'UPDATE' && <Edit2 size={8} className="text-white" />}
                            {log.action === 'REOPEN' && <RotateCcw size={8} className="text-white" />}
                          </div>
                          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                              {u.avatar ? (
                                <img src={u.avatar} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{u.name.charAt(0)}</div>
                              )}
                              <div>
                                <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{u.name}</h4>
                                <p className={`text-[9px] uppercase tracking-widest font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{log.details}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 font-bold mt-10">Nenhum histórico registrado.</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Criação de Workspace */}
      {isNewWorkspaceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xl z-[60] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/20'}`}>
            <div className={`px-8 py-6 border-b shrink-0 flex justify-between items-center transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
              <div><h2 className="text-xl font-black tracking-tighter">Novo Quadro</h2></div>
              <button onClick={() => setIsNewWorkspaceModalOpen(false)} className={`p-3 rounded-xl border transition-all hover:rotate-90 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}><X size={20} /></button>
            </div>
            <form onSubmit={createWorkspace} className="p-8 space-y-6">
              <div className="space-y-3">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nome do Quadro</label>
                <input autoFocus required type="text" value={newWorkspaceTitle} onChange={e => setNewWorkspaceTitle(e.target.value)} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none transition-all font-bold text-lg shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} placeholder="Ex: Projetos de Faculdade" />
              </div>
              <div className="space-y-3">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}><Palette size={12} /> Cor do Quadro</label>
                <div className={`w-full px-4 py-3.5 rounded-[1rem] border-2 flex flex-wrap gap-2 items-center justify-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                  {COLOR_KEYS.map(k => (
                    <button key={k} type="button" onClick={() => setNewWorkspaceColor(k)} className={`w-6 h-6 rounded-full ${PALETTE[k].dot} transition-transform hover:scale-110 ${newWorkspaceColor === k ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : 'opacity-70 grayscale-[0.3]'}`} />
                  ))}
                </div>
              </div>
              <button type="submit" className={`w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                <Plus size={20} strokeWidth={3} /> Criar Quadro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edição Quadro (Admin) */}
      {isEditWorkspaceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xl z-[60] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/20'}`}>
            <div className={`px-8 py-6 border-b shrink-0 flex justify-between items-center transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
              <div><h2 className="text-xl font-black tracking-tighter">Configurações</h2></div>
              
              <div className={`flex rounded-xl p-1 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <button type="button" onClick={() => setWsModalTab('general')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${wsModalTab === 'general' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500'}`}>Geral</button>
                <button type="button" onClick={() => setWsModalTab('team')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${wsModalTab === 'team' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500'}`}>Equipa</button>
                <button type="button" onClick={() => setWsModalTab('tags')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${wsModalTab === 'tags' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500'}`}>Etiquetas</button>
              </div>

              <button onClick={() => setIsEditWorkspaceModalOpen(false)} className={`p-2 rounded-xl border transition-all hover:rotate-90 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}><X size={20} /></button>
            </div>
            
            <form onSubmit={updateWorkspace} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {wsModalTab === 'general' && (
                <>
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nome do Quadro</label>
                    <input autoFocus required type="text" value={editingWorkspaceForm.title} onChange={e => setEditingWorkspaceForm({...editingWorkspaceForm, title: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none transition-all font-bold text-lg shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                  </div>
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}><Palette size={12} /> Cor do Quadro</label>
                    <div className={`w-full px-4 py-3.5 rounded-[1rem] border-2 flex flex-wrap gap-2 items-center justify-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      {COLOR_KEYS.map(k => (
                        <button key={k} type="button" onClick={() => setEditingWorkspaceForm({...editingWorkspaceForm, color: k})} className={`w-6 h-6 rounded-full ${PALETTE[k].dot} transition-transform hover:scale-110 ${editingWorkspaceForm.color === k ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : 'opacity-70 grayscale-[0.3]'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button type="submit" className={`w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                      <CheckCircle2 size={20} strokeWidth={3} /> Salvar Alterações
                    </button>
                    <button type="button" onClick={requestDeleteWorkspace} className={`w-full font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] border-2 ${theme === 'dark' ? 'border-red-900/50 text-red-500 hover:bg-red-900/30' : 'border-red-100 text-red-500 hover:bg-red-50'}`}>
                      <Trash2 size={16} /> Apagar Quadro
                    </button>
                  </div>
                </>
              )}

              {wsModalTab === 'team' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                    <ShieldCheck size={20} className="flex-shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">Apenas Admins podem apagar cards e modificar as colunas do quadro. Membros apenas visualizam e editam o conteúdo.</p>
                  </div>
                  <div className="space-y-2">
                    {users.map(u => {
                      const isMember = editingWorkspaceForm.members.find(m => m.userId === u.id);
                      const isOwner = activeWorkspace.userId === u.id;
                      return (
                        <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isMember ? (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm') : (theme === 'dark' ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-100 opacity-60')}`}>
                          <div className="flex items-center gap-3">
                            {u.avatar ? <img src={u.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" /> : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>}
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{u.name}</span>
                              <span className={`text-[9px] uppercase tracking-widest font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{u.email}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {isMember && (
                              <select 
                                value={isMember.role} 
                                disabled={isOwner}
                                onChange={(e) => {
                                  setEditingWorkspaceForm(prev => ({...prev, members: prev.members.map(m => m.userId === u.id ? { ...m, role: e.target.value } : m)}));
                                }}
                                className={`text-xs font-bold px-2 py-1 rounded-lg outline-none ${isOwner ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                              >
                                <option value="member">Membro</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                            <button 
                              type="button" 
                              disabled={isOwner}
                              onClick={() => {
                                setEditingWorkspaceForm(prev => {
                                  const exists = prev.members.some(m => m.userId === u.id);
                                  if (exists) return { ...prev, members: prev.members.filter(m => m.userId !== u.id) };
                                  return { ...prev, members: [...prev.members, { userId: u.id, role: 'member' }] };
                                });
                              }} 
                              className={`p-1.5 rounded-lg transition-all ${isOwner ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'} ${isMember ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}
                            >
                              {isMember ? <X size={14} /> : <Plus size={14} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className={`w-full mt-4 font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                    <CheckCircle2 size={20} strokeWidth={3} /> Salvar Equipa
                  </button>
                </div>
              )}

              {wsModalTab === 'tags' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nova Etiqueta</label>
                    <div className="flex gap-2">
                      <input type="text" value={newTagForm.label} onChange={(e) => setNewTagForm({...newTagForm, label: e.target.value})} className={`flex-1 px-4 py-3 rounded-[1rem] border-2 focus:outline-none font-bold text-sm shadow-inner transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} placeholder="Ex: Backend" />
                      <div className={`flex items-center px-2 rounded-[1rem] border-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <select value={newTagForm.color} onChange={e => setNewTagForm({...newTagForm, color: e.target.value})} className="bg-transparent font-bold text-xs outline-none cursor-pointer">
                          {COLOR_KEYS.map(k => <option key={k} value={k}>{PALETTE[k].name}</option>)}
                        </select>
                      </div>
                      <button type="button" onClick={() => {
                        if (!newTagForm.label.trim()) return;
                        setEditingWorkspaceForm(prev => ({ ...prev, tags: [...(prev.tags || []), { id: generateId(), label: newTagForm.label, color: newTagForm.color }] }));
                        setNewTagForm({ label: '', color: 'indigo' });
                      }} className={`px-4 rounded-[1rem] flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                        <PlusCircle size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Etiquetas do Quadro</label>
                    <div className="flex flex-wrap gap-2">
                      {editingWorkspaceForm.tags?.map(tag => {
                        const cInfo = PALETTE[tag.color];
                        return (
                          <div key={tag.id} className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border ${cInfo.soft} ${cInfo.border} ${cInfo.text}`}>
                            <span className="text-xs font-bold">{tag.label}</span>
                            <button type="button" onClick={() => setEditingWorkspaceForm(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== tag.id) }))} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        );
                      })}
                      {(!editingWorkspaceForm.tags || editingWorkspaceForm.tags.length === 0) && <p className="text-sm font-medium text-slate-500">Nenhuma etiqueta criada.</p>}
                    </div>
                  </div>
                  <button type="submit" className={`w-full mt-4 font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                    <CheckCircle2 size={20} strokeWidth={3} /> Salvar Etiquetas
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {messagingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-indigo-50'}`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                 {messagingUser.avatar ? (
                    <img src={messagingUser.avatar} className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl font-bold text-indigo-600 border-4 border-indigo-500">{messagingUser.name.charAt(0)}</div>
                  )}
                 <div className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900"><Send size={14} className="text-white" /></div>
              </div>
              <div>
                <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Mensagem Direta</h3>
                <p className={`font-medium text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Envie uma mensagem para <strong>{messagingUser.name}</strong> referente a este card.</p>
              </div>
              <textarea className={`w-full p-4 rounded-xl border mt-2 text-sm resize-none h-24 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="Escreva sua mensagem..."></textarea>
              <div className="flex gap-2 w-full mt-2">
                <button onClick={() => setMessagingUser(null)} className={`flex-1 font-black py-3 rounded-xl transition-all active:scale-95 uppercase text-xs tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancelar</button>
                <button onClick={() => { setAppAlert("Mensagem enviada com sucesso (Simulado)!"); setMessagingUser(null); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all active:scale-95 uppercase text-xs tracking-widest">Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {appAlert && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-amber-100'}`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-500'}`}><AlertCircle size={32} /></div>
              <div>
                <h3 className={`text-xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Atenção</h3>
                <p className={`font-medium text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{appAlert}</p>
              </div>
              <button onClick={() => setAppAlert(null)} className={`w-full mt-4 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-black'}`}>Entendi</button>
            </div>
          </div>
        </div>
      )}

      {viewingCommentTask && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-emerald-900/50' : 'bg-white border-emerald-100'}`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}><MessageSquare size={32} /></div>
              <div className="w-full">
                <h3 className={`text-xl font-black tracking-tight mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Relato de Conclusão</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Referente a este card: {viewingCommentTask.title}</p>
                <div className={`p-5 rounded-2xl text-left font-medium text-sm leading-relaxed border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  {viewingCommentTask.completionComment}
                </div>
              </div>
              <button onClick={() => setViewingCommentTask(null)} className={`w-full mt-2 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg ${theme === 'dark' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>Fechar Relato</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-50'}`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}><AlertTriangle size={32} /></div>
              <div>
                <h3 className={`text-xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                  {deleteConfirmation.type === 'empty_trash' ? 'Esvaziar Lixeira?' : deleteConfirmation.type === 'workspace' ? 'Excluir Quadro?' : deleteConfirmation.action === 'trash' ? 'Mover para a Lixeira?' : 'Excluir Definitivamente?'}
                </h3>
                <p className={`font-medium text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {deleteConfirmation.type === 'empty_trash' ? 'Todos os cards excluídos serão perdidos para sempre.' : deleteConfirmation.type === 'workspace' ? <span>Excluir o quadro <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>"{deleteConfirmation.title}"</strong>? Todos os cards dele irão para a lixeira.</span> : deleteConfirmation.action === 'trash' ? <span>O item será movido para a lixeira.</span> : <span>Excluir permanentemente <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>"{deleteConfirmation.title}"</strong>?</span>}
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => setDeleteConfirmation(null)} className={`flex-1 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancelar</button>
                <button onClick={() => {
                  if (deleteConfirmation.type === 'workspace') {
                    const wsId = deleteConfirmation.id;
                    const newWs = workspaces.filter(w => w.id !== wsId);
                    setWorkspaces(newWs);
                    if (activeWorkspaceId === wsId) setActiveWorkspaceId(newWs[0]?.id || null);
                    setTasks(prev => prev.map(t => t.workspaceId === wsId ? { ...t, deletedAt: new Date().toISOString() } : t));
                  } else if (deleteConfirmation.type === 'task') {
                    if (deleteConfirmation.action === 'trash') setTasks(prev => prev.map(t => t.id === deleteConfirmation.id ? { ...t, deletedAt: new Date().toISOString() } : t));
                    else if (deleteConfirmation.action === 'permanent') setTasks(prev => prev.filter(t => t.id !== deleteConfirmation.id));
                  } else if (deleteConfirmation.type === 'subtask') {
                    setTaskForm(prev => ({ ...prev, subtasks: prev.subtasks.filter(st => st.id !== deleteConfirmation.id) }));
                  } else if (deleteConfirmation.type === 'empty_trash') setTasks(prev => prev.filter(t => !t.deletedAt));
                  setDeleteConfirmation(null);
                }} className={`flex-1 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg ${deleteConfirmation.action === 'trash' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {deleteConfirmation.action === 'trash' ? 'Mover' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {holidayDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className={`rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-indigo-50'}`}>
            <div className="flex flex-col items-center text-center gap-5">
              <div className={`p-5 rounded-full ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-500'}`}><PartyPopper size={36} /></div>
              <h3 className="text-2xl font-black tracking-tight">Feriado Nacional</h3>
              <p className={`font-black uppercase text-[10px] tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Data: {new Date(holidayDetail.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              <p className={`font-bold px-6 py-5 rounded-[1.5rem] w-full border leading-relaxed ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-indigo-300' : 'bg-indigo-50/50 border-indigo-100/50 text-indigo-900'}`}>{holidayDetail.name}</p>
              <button onClick={() => setHolidayDetail(null)} className={`w-full font-black py-5 rounded-2xl mt-2 transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-black text-white'}`}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cerca Global (Command Palette) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh] p-4" onClick={() => setIsSearchOpen(false)}>
          <div className={`rounded-[2rem] w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
              <Search size={24} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              <input 
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca tasques, objectius... (Ctrl+K)"
                className={`w-full bg-transparent border-none outline-none px-4 text-lg font-bold ${theme === 'dark' ? 'text-slate-100 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}
                onKeyDown={e => { if(e.key === 'Escape') setIsSearchOpen(false); }}
              />
              <button onClick={() => setIsSearchOpen(false)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><X size={20} /></button>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center">
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Escriu per començar a cercar...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No s'han trobat resultats per "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(task => {
                    const ws = workspaces.find(w => w.id === task.workspaceId);
                    const isOverdue = checkIsOverdue(task.deadline) && task.status !== 'done';
                    return (
                      <button 
                        key={task.id} 
                        onClick={() => { 
                          setIsSearchOpen(false); 
                          if (activeWorkspaceId !== task.workspaceId) setActiveWorkspaceId(task.workspaceId);
                          setTimeout(() => handleOpenModal(task), 100); 
                        }} 
                        className={`w-full text-left p-4 rounded-xl flex flex-col gap-2 transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm truncate">{task.title}</span>
                          {task.status === 'done' && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-70">
                          <span className="flex items-center gap-1"><Layout size={10} /> {ws?.title || 'Desconegut'}</span>
                          <span className="flex items-center gap-1"><Clock size={10} className={isOverdue ? 'text-red-500' : ''} /> {new Date(task.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;