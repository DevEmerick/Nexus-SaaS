import { ChevronLeft, ChevronRight, RotateCcw, Info, CheckCircle2 } from 'lucide-react';
import { getPriorityStyles } from '../../utils/styles';
import { checkIsOverdue } from '../../utils/validation';

const CalendarView = ({
  theme,
  currentDate,
  setCurrentDate,
  isCurrentMonth,
  calendarDays,
  processedTasks,
  holidays,
  setHolidayDetail,
  handleOpenModal,
  checkIsOverdue: checkOverdueFunc
}) => {
  return (
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
  );
};

export default CalendarView;
