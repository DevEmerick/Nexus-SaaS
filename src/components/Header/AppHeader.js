import { Layout, ChevronDown, Columns, CalendarIcon, Activity, Trash, Plus, Search, Bell, User, LogOut, UserCircle, FolderPlus, Settings, Moon, Sun } from 'lucide-react';
import { PALETTE } from '../../utils/constants';
import { getColorNameFromHex } from '../../utils/colorMapper';

const AppHeader = ({
  theme,
  setTheme,
  activeWorkspace,
  userWorkspaces,
  currentUser,
  view,
  setView,
  setIsWorkspaceMenuOpen,
  isWorkspaceMenuOpen,
  setActiveWorkspaceId,
  setIsNewWorkspaceModalOpen,
  openEditWorkspace,
  handleOpenModal,
  setIsSearchOpen,
  isNotifMenuOpen,
  setIsNotifMenuOpen,
  unreadNotifsCount,
  markAllNotifsAsRead,
  userNotifications,
  setNotifications,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  openProfileModal,
  handleLogout,
  setCurrentUser
}) => {
  return (
    <header className={`border-b px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 flex flex-col lg:flex-row justify-between items-center sticky top-0 z-40 gap-3 md:gap-4 shadow-sm backdrop-blur-md transition-colors ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
      <div className="flex flex-col md:flex-row items-center gap-6 xl:gap-10 w-full xl:w-auto">
        
        <div className="relative z-40 w-full md:w-auto flex justify-center">
          {activeWorkspace && (
            <button onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)} className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              <div className={`${PALETTE[getColorNameFromHex(activeWorkspace.color)].dot} p-1.5 rounded-xl shadow-inner rotate-3 transition-colors`}>
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
                        <div className={`w-2.5 h-2.5 rounded-full ${PALETTE[getColorNameFromHex(w.color)].dot}`} />
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
        
        <nav className={`flex p-2 md:p-1.5 rounded-2xl border w-full md:w-auto justify-center gap-1 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <button onClick={() => setView('board')} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'board' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Columns size={16} /><span className="hidden md:inline">Quadro</span></button>
          <button onClick={() => setView('calendar')} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'calendar' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><CalendarIcon size={16} /><span className="hidden md:inline">Calendário</span></button>
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'dashboard' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Activity size={16} /><span className="hidden md:inline">Estatísticas</span></button>
          <div className={`w-[1px] h-6 mx-1 md:mx-2 my-auto ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <button onClick={() => setView('trash')} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'trash' ? (theme === 'dark' ? 'bg-red-900/40 text-red-400 shadow-md' : 'bg-red-50 text-red-600 shadow-md') : 'text-slate-500 hover:text-red-400'}`}><Trash size={16} /><span className="hidden md:inline">Lixeira</span></button>
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4 w-full lg:w-auto justify-end">
        <button onClick={() => handleOpenModal()} className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-2xl transition-all shadow-md active:scale-95 font-black text-xs uppercase tracking-widest ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
          <Plus size={16} strokeWidth={3} /><span className="hidden md:inline">Novo Card</span>
        </button>
        
        <div className={`w-[1px] h-6 md:h-8 mx-1 md:mx-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Botão de Busca Global */}
        <div className="relative z-40">
          <button onClick={() => setIsSearchOpen(true)} className={`relative p-2.5 mr-2 rounded-full border transition-all active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} title="Busca Global (Ctrl+K)">
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
                  <button onClick={() => {
                    const newTheme = theme === 'light' ? 'dark' : 'light';
                    setTheme(newTheme);
                    if (currentUser) {
                      const updatedUser = { ...currentUser, themePreference: newTheme };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
                    }
                  }} className={`p-2 rounded-xl border transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
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
  );
};

export default AppHeader;
