import { Filter, Plus, ListTodo, MessageSquare, Paperclip, Clock, CheckCircle2, GripVertical, AlertCircle, Trash2, MoreVertical, Edit3, ArrowLeft, ArrowRight, Tag, Users, ArrowDownUp } from 'lucide-react';
import { PALETTE, COLOR_KEYS } from '../../utils/constants';
import { checkIsOverdue } from '../../utils/validation';
import { getPriorityStyles } from '../../utils/styles';

const BoardView = ({
  theme,
  activeWorkspace,
  processedTasks,
  filter,
  setFilter,
  sortByDeadline,
  setSortByDeadline,
  selectedTags,
  toggleTagFilter,
  selectedAssignees,
  toggleAssigneeFilter,
  isCurrentUserAdmin,
  draggedTaskId,
  handleDragStart,
  handleDragEnd,
  draggedColumnId,
  handleColumnDragStart,
  handleColumnDragEnd,
  handleColumnDrop,
  columnMenuOpenId,
  setColumnMenuOpenId,
  editingColumnId,
  setEditingColumnId,
  changeColumnColor,
  renamingColumnId,
  renameColumnTitle,
  startRenameColumn,
  saveColumnRename,
  setRenameColumnTitle,
  handleOpenModal,
  handleDeleteColumn,
  handleMoveColumn,
  editingTaskColorId,
  setEditingTaskColorId,
  setTasks,
  createLog,
  handleMoveTaskStatus,
  setDeleteConfirmation,
  getUserDetails,
  setViewingCommentTask,
  handleAddColumn
}) => {
  return (
    <>
      {/* Board Filters */}
      <div className={`mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 lg:p-6 rounded-[2rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
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
      
      {/* Tag & Assignee Filters */}
      {(activeWorkspace.tags?.length > 0 || activeWorkspace.members?.length > 0) && (
        <div className={`mb-4 md:mb-8 p-3 md:p-4 lg:p-6 rounded-[2rem] border shadow-sm transition-colors flex flex-col gap-3 md:gap-4 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
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
                      {u.avatar ? <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" /> : <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>{u.name.charAt(0)}</div>}
                      {u.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedTags.length > 0 || selectedAssignees.length > 0) && (
            <div className={`pt-3 mt-1 border-t flex justify-end ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
              <button onClick={() => { toggleTagFilter(); toggleAssigneeFilter(); }} className={`text-[10px] font-black uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start md:overflow-x-auto pb-4 md:pb-8 custom-scrollbar">
        {activeWorkspace.columns.map(column => (
          <div 
            key={column.id} 
            draggable={isCurrentUserAdmin && !draggedTaskId}
            onDragStart={(e) => handleColumnDragStart(e, column.id)}
            onDragEnd={handleColumnDragEnd}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => handleColumnDrop(e, column.id)} 
            className={`flex flex-col rounded-[2.5rem] border p-3 md:p-4 lg:p-5 min-h-[300px] md:min-h-[500px] max-h-[2500px] w-full md:w-[380px] md:flex-shrink-0 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-200/40 border-slate-200/60'} ${draggedColumnId === column.id ? 'opacity-40 scale-[0.98]' : ''}`}
          >
            {/* Column Header */}
            <div className={`px-4 py-3 flex justify-between items-center mb-6 relative rounded-2xl transition-colors ${draggedColumnId ? (theme === 'dark' ? 'bg-slate-800' : 'bg-white') : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isCurrentUserAdmin && (
                  <div className={`cursor-grab active:cursor-grabbing flex-shrink-0 ${theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`} title="Arraste para reordenar">
                    <GripVertical size={16} />
                  </div>
                )}
                <div className={`relative ${editingColumnId === column.id ? 'z-50' : 'z-20'}`}>
                  {isCurrentUserAdmin ? (
                    <button onClick={(e) => { e.stopPropagation(); setEditingColumnId(editingColumnId === column.id ? null : column.id); }} className={`w-4 h-4 rounded-full ${PALETTE[column.color || 'indigo'].dot} shadow-sm ring-2 ring-offset-2 transition-all hover:scale-110 flex-shrink-0 ${theme === 'dark' ? 'ring-slate-800 ring-offset-slate-900' : 'ring-white ring-offset-slate-200'}`} title="Mudar cor da coluna" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full ${PALETTE[column.color || 'indigo'].dot} shadow-sm flex-shrink-0`} />
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

            {/* Tasks List */}
            <div className="flex-1 space-y-3 md:space-y-4 lg:space-y-5 overflow-y-auto custom-scrollbar pr-2">
              {processedTasks.filter(t => t.status === column.id).map(task => {
                const priorityStyles = getPriorityStyles(task.priority);
                const isOverdue = checkIsOverdue(task.deadline) && task.status !== 'done';
                const cardColorInfo = PALETTE[task.cardColor || 'slate'];
                
                return (
                  <div key={task.id} draggable="true" onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} onClick={() => handleOpenModal(task)} 
                    className={`group p-3 md:p-4 lg:p-6 rounded-[2rem] shadow-sm border transition-all cursor-grab active:cursor-grabbing relative overflow-hidden transform-gpu flex-shrink-0
                      ${isOverdue ? (theme === 'dark' ? 'bg-slate-800 border-red-900/50 hover:border-red-500 shadow-red-900/10' : 'bg-white border-red-200 hover:border-red-400 shadow-red-100') 
                                  : `${cardColorInfo.soft} ${cardColorInfo.border} hover:border-indigo-400 shadow-sm`}`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <GripVertical className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} group-hover:text-indigo-400 transition-colors`} size={14} />
                        
                        <div className={`relative ${editingTaskColorId === task.id ? 'z-50' : 'z-20'}`}>
                          <button onClick={(e) => { e.stopPropagation(); setEditingTaskColorId(editingTaskColorId === task.id ? null : task.id); }} className={`w-3.5 h-3.5 rounded-full ${cardColorInfo.dot} shadow-sm ring-2 ring-offset-1 transition-all hover:scale-110 flex-shrink-0 ${theme === 'dark' ? 'ring-slate-800 ring-offset-slate-900' : 'ring-white ring-offset-slate-200'}`} title="Alterar cor do card" />
                          {editingTaskColorId === task.id && (
                            <div className={`absolute top-full left-0 mt-2 p-2 rounded-2xl shadow-xl flex gap-2 border animate-in zoom-in z-50 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                              {COLOR_KEYS.map(k => (
                                <button key={k} type="button" onClick={(e) => { e.stopPropagation(); setTasks(prev => prev.map(t => t.id === task.id ? { ...t, cardColor: k, history: [...(t.history || []), createLog('UPDATE', 'Alterou a cor do card')] } : t)); setEditingTaskColorId(null); }} className={`w-5 h-5 rounded-full ${PALETTE[k].dot} hover:scale-110 transition-transform ${task.cardColor === k ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white' : ''}`} />
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
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              <ListTodo size={12} /> {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                            </div>
                          )}
                          {task.attachments && task.attachments.length > 0 && (
                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              <Paperclip size={12} /> {task.attachments.length}
                            </div>
                          )}
                          {task.comments && task.comments.length > 0 && (
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
              
              <button onClick={() => handleOpenModal(null, column.id)} className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all active:scale-95 font-bold text-xs uppercase tracking-widest mt-2 ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/50' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-100'}`}>
                <Plus size={14} strokeWidth={3} /> Adicionar Card
              </button>
            </div>
          </div>
        ))}

        {isCurrentUserAdmin && (
          <button onClick={handleAddColumn} className={`flex-shrink-0 flex items-center justify-center gap-2 h-16 w-[380px] rounded-[2.5rem] border-2 border-dashed transition-all active:scale-95 font-black uppercase text-xs tracking-widest ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 bg-slate-900/30' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 bg-slate-100/50'}`}>
            <Plus size={16} strokeWidth={3} /> Nova Coluna
          </button>
        )}
      </div>
    </>
  );
};

export default BoardView;
