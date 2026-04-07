import { Trash, Trash2, Search, X, RotateCcw } from 'lucide-react';
import { getPriorityStyles } from '../../utils/styles';

const TrashView = ({
  theme,
  deletedTasks,
  userWorkspaces,
  activeWorkspace,
  trashSearchDate,
  setTrashSearchDate,
  isCurrentUserAdmin,
  setDeleteConfirmation,
  setTasks,
  tasks
}) => {
  return (
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
  );
};

export default TrashView;
