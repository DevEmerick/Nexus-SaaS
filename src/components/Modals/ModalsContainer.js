import React from 'react';
import { X, Send, AlertTriangle, AlertCircle, MessageSquare, PartyPopper, Search, CheckCircle2, Layout, Clock, Palette, Plus, PlusCircle, ShieldCheck } from 'lucide-react';
import { PALETTE, COLOR_KEYS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';
import MarkdownEditor from '../Shared/MarkdownEditor';

const ModalsContainer = ({
  theme,
  // Profile Modal
  isProfileModalOpen, setIsProfileModalOpen, profileForm, setProfileForm, saveProfile,
  // Task Modal
  isModalOpen, setIsModalOpen, editingTaskId, taskForm, setTaskForm, taskModalTab, setTaskModalTab, 
  users, activeWorkspace, toggleAssignee, toggleTaskTag, subtaskInput, setSubtaskInput, 
  handleAddSubtask, handleToggleSubtask, reverseHistory, handleSaveTask, handleAddComment, commentInput, 
  setCommentInput, editingCommentId, setEditingCommentId, editingCommentText, setEditingCommentText, 
  handleSaveEditComment, setReplyingToId, replyingToId, replyText, setReplyText, handleAddReply, 
  handleDeleteComment, handleDeleteReply,
  // Workspace Modals
  isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen, newWorkspaceTitle, setNewWorkspaceTitle, 
  newWorkspaceColor, setNewWorkspaceColor, createWorkspace,
  isEditWorkspaceModalOpen, setIsEditWorkspaceModalOpen, wsModalTab, setWsModalTab, 
  editingWorkspaceForm, setEditingWorkspaceForm, newTagForm, setNewTagForm, updateWorkspace, 
  requestDeleteWorkspace,
  // Utility Modals
  messagingUser, setMessagingUser, appAlert, setAppAlert,
  viewingCommentTask, setViewingCommentTask,
  deleteConfirmation, setDeleteConfirmation, workspaces, setWorkspaces, activeWorkspaceId, 
  setActiveWorkspaceId, setTasks, handleFileUpload,
  holidayDetail, setHolidayDetail,
  isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, searchResults, handleOpenModal
}) => {
  return (
    <>
      {/* --- MODAL PERFIL --- */}
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
                    <div className="text-4xl">👤</div>
                  </div>
                )}
                <div className="w-full relative">
                  <input type="url" placeholder="URL da foto (Avatar)" value={profileForm.avatar} onChange={e => setProfileForm({...profileForm, avatar: e.target.value})} className={`w-full pl-4 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-xs shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nome</label>
                <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>E-mail</label>
                <input required type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Telefone</label>
                <input type="tel" placeholder="(00) 00000-0000" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-sm shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Trocar Senha (Opcional)</p>
                <div className="space-y-3">
                  <input type="password" placeholder="Senha Atual" value={profileForm.currentPassword} onChange={e => setProfileForm({...profileForm, currentPassword: e.target.value})} className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-xs shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                  <input type="password" placeholder="Nova Senha" value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all font-bold text-xs shadow-inner ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-slate-50/50 border-slate-100 focus:border-indigo-500 text-slate-800'}`} />
                </div>
              </div>
              <button type="submit" className={`w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] mt-4 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}>
                Salvar Perfil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TAREFA --- */}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      👥 Responsáveis
                    </label>
                    <div className={`w-full px-4 py-3 rounded-[1rem] border-2 flex flex-wrap gap-2 items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      {users.map(u => {
                        const isSelected = (taskForm.assignees || []).includes(u.id);
                        return (
                          <button key={u.id} type="button" onClick={() => toggleAssignee(u.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isSelected ? (theme === 'dark' ? 'bg-indigo-900/50 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200') : (theme === 'dark' ? 'opacity-50 grayscale border border-transparent' : 'opacity-60 grayscale border border-transparent hover:opacity-100')}`}>
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
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
                      🏷️ Etiquetas
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Progresso</label>
                    <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className={`w-full px-6 py-4 rounded-[1rem] border-2 focus:outline-none font-bold appearance-none cursor-pointer shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-slate-100' : 'bg-white border-slate-100 focus:border-indigo-500 text-slate-800'}`}>
                      {activeWorkspace?.columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>🎨 Cor do Card</label>
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
                    📎 Anexos
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
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>📄</div>
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
                    💬 Chat da Tarefa
                  </label>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                    {(taskForm.comments || []).length === 0 ? (
                      <p className={`text-xs font-medium text-center ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Nenhum comentário ainda.</p>
                    ) : (
                      (taskForm.comments || []).map(c => (
                        <div key={c.id} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {c.userId && <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{c.userId}</span>}
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
                                <button type="button" onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.text); }} className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Editar</button>
                                <button type="button" onClick={() => handleDeleteComment(c.id)} className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Excluir</button>
                              </div>
                            </>
                          )}
                          {replyingToId === c.id && (
                            <div className="pl-8 mt-3 flex gap-2">
                              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') { e.preventDefault(); handleAddReply(c.id); }}} className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none font-medium text-xs transition-all ${theme === 'dark' ? 'bg-slate-900 border-indigo-500 text-slate-100' : 'bg-white border-indigo-500 text-slate-800'}`} placeholder="Escreva uma resposta..." autoFocus />
                              <button type="button" onClick={() => handleAddReply(c.id)} className={`px-3 rounded-lg flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                <Send size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
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
                    <CheckCircle2 size={20} strokeWidth={3} /> {editingTaskId ? 'Salvar Card' : 'Criar Card'}
                  </button>
                </div>
              </form>
            ) : (
              /* ABA DE HISTÓRICO */
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                {!editingTaskId ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <span className="text-3xl mb-4">📜</span>
                    <p className="text-sm font-bold text-slate-500">Salve o card primeiro para ver o histórico.</p>
                  </div>
                ) : (taskForm.history && taskForm.history.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8 pb-4">
                    {reverseHistory().map((log, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[27px] w-5 h-5 rounded-full ${theme === 'dark' ? 'bg-indigo-600 border-4 border-slate-900' : 'bg-indigo-500 border-4 border-white'}`} />
                        <div>
                          <div className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{log.action}</div>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{log.details}</p>
                          <span className={`text-[10px] font-bold mt-2 block ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <span className="text-3xl mb-4">📜</span>
                    <p className="text-sm font-bold text-slate-500">Nenhum histórico registrado.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL NOVO WORKSPACE --- */}
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

      {/* --- MODAL EDIT WORKSPACE --- */}
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
                      Apagar Quadro
                    </button>
                  </div>
                </>
              )}
              {wsModalTab === 'team' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                    <ShieldCheck size={20} className="flex-shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">Apenas Admins podem apagar cards e modificar as colunas do quadro.</p>
                  </div>
                  <div className="space-y-2">
                    {users.map(u => {
                      const isMember = editingWorkspaceForm.members.find(m => m.userId === u.id);
                      return (
                        <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isMember ? (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm') : (theme === 'dark' ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-100 opacity-60')}`}>
                          <div className="flex items-center gap-3">
                            {u.avatar ? <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" /> : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>}
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{u.name}</span>
                              <span className={`text-[9px] uppercase tracking-widest font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{u.email}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => {
                            setEditingWorkspaceForm(prev => {
                              const exists = prev.members.some(m => m.userId === u.id);
                              if (exists) return { ...prev, members: prev.members.filter(m => m.userId !== u.id) };
                              return { ...prev, members: [...prev.members, { userId: u.id, role: 'member' }] };
                            });
                          }} className={`p-1.5 rounded-lg transition-all ${isMember ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                            {isMember ? <X size={14} /> : <Plus size={14} />}
                          </button>
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

      {/* --- MODAL MENSAGENS --- */}
      {messagingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-indigo-50'}`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-500'}`}><Send size={32} /></div>
              <div>
                <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Mensagem Direta</h3>
                <p className={`font-medium text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Envie uma mensagem para <strong>{messagingUser.name}</strong>.</p>
              </div>
              <textarea className={`w-full p-4 rounded-xl border mt-2 text-sm resize-none h-24 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="Escreva sua mensagem..."></textarea>
              <div className="flex gap-2 w-full mt-2">
                <button type="button" onClick={() => setMessagingUser(null)} className={`flex-1 font-black py-3 rounded-xl transition-all active:scale-95 uppercase text-xs tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancelar</button>
                <button type="button" onClick={() => { setAppAlert("Mensagem enviada!"); setMessagingUser(null); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all active:scale-95 uppercase text-xs tracking-widest">Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ALERTA --- */}
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

      {/* --- MODAL RELATO CONCLUSÃO --- */}
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

      {/* --- MODAL CONFIRMAÇÃO DELEÇÃO --- */}
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
                  {deleteConfirmation.type === 'empty_trash' ? 'Todos os cards excluídos serão perdidos para sempre.' : deleteConfirmation.type === 'workspace' ? <span>Excluir o quadro <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>"{deleteConfirmation.title}"</strong>?</span> : deleteConfirmation.action === 'trash' ? 'O item será movido para a lixeira.' : <span>Excluir permanentemente <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>"{deleteConfirmation.title}"</strong>?</span>}
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => setDeleteConfirmation(null)} className={`flex-1 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancelar</button>
                <button onClick={() => {
                  if (deleteConfirmation.type === 'workspace') {
                    const wsId = deleteConfirmation.id;
                    const newWs = workspaces.filter(w => w.id !== wsId);
                    setWorkspaces(newWs);
                    if (window.setActiveWorkspaceId) window.setActiveWorkspaceId(newWs[0]?.id || null);
                  } else if (deleteConfirmation.type === 'empty_trash') {
                    setTasks(prev => prev.filter(t => !t.deletedAt));
                  }
                  setDeleteConfirmation(null);
                }} className={`flex-1 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg ${deleteConfirmation.action === 'trash' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {deleteConfirmation.action === 'trash' ? 'Mover' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL FERIADO --- */}
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

      {/* --- MODAL BUSCA GLOBAL --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh] p-4" onClick={() => setIsSearchOpen(false)}>
          <div className={`rounded-[2rem] w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
              <Search size={24} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              <input 
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                className={`w-full bg-transparent border-none outline-none px-4 text-lg font-bold ${theme === 'dark' ? 'text-slate-100 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}
                onKeyDown={e => { if(e.key === 'Escape') setIsSearchOpen(false); }}
              />
              <button onClick={() => setIsSearchOpen(false)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><X size={20} /></button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center">
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Escreva para buscar...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Nenhum resultado encontrado</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(task => (
                    <button key={task.id} onClick={() => { setIsSearchOpen(false); handleOpenModal(task); }} className={`w-full text-left p-4 rounded-xl flex flex-col gap-2 transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm truncate">{task.title}</span>
                        {task.status === 'done' && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-70">
                        <span className="flex items-center gap-1"><Layout size={10} /> {task.workspaceId}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(task.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalsContainer;
