import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

const DashboardView = ({
  theme,
  activeWorkspace,
  workspaceTasks,
  calculateDashboardMetrics
}) => {
  const wsTasks = workspaceTasks.filter(t => !t.deletedAt);
  const metrics = calculateDashboardMetrics(wsTasks);

  return (
    <div className={`rounded-[3rem] shadow-2xl border overflow-hidden flex flex-col h-full min-h-[800px] transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200'}`}>
      <div className={`p-8 border-b transition-colors ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50/30 border-slate-100'}`}>
        <h2 className="text-3xl font-black tracking-tighter">Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 p-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className={`rounded-2xl border-2 p-6 transition-all flex items-center gap-4 group ${theme === 'dark' ? 'bg-slate-800/50 border-emerald-900 hover:border-emerald-700 hover:bg-slate-800/80' : 'bg-white border-emerald-200 hover:border-emerald-400 hover:bg-slate-50'}`}>
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Concluídas</p>
            <p className={`text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.completed}</p>
            <p className={`text-xs mt-2 font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{metrics.completionRate}% do total</p>
          </div>
        </div>

        <div className={`rounded-2xl border-2 p-6 transition-all flex items-center gap-4 group ${theme === 'dark' ? 'bg-slate-800/50 border-amber-900 hover:border-amber-700 hover:bg-slate-800/80' : 'bg-white border-amber-200 hover:border-amber-400 hover:bg-slate-50'}`}>
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
            <Clock size={32} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Em Progresso</p>
            <p className={`text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.inProgress}</p>
            <p className={`text-xs mt-2 font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Tarefas ativas</p>
          </div>
        </div>

        <div className={`rounded-2xl border-2 p-6 transition-all flex items-center gap-4 group ${theme === 'dark' ? 'bg-slate-800/50 border-red-900 hover:border-red-700 hover:bg-slate-800/80' : 'bg-white border-red-200 hover:border-red-400 hover:bg-slate-50'}`}>
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Atrasadas</p>
            <p className={`text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.overdue}</p>
            <p className={`text-xs mt-2 font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Requerem atenção</p>
          </div>
        </div>

        <div className={`rounded-2xl border-2 p-6 transition-all flex items-center gap-4 group ${theme === 'dark' ? 'bg-slate-800/50 border-indigo-900 hover:border-indigo-700 hover:bg-slate-800/80' : 'bg-white border-indigo-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
            <Zap size={32} className="text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Total</p>
            <p className={`text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.total}</p>
            <p className={`text-xs mt-2 font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Todas as tarefas</p>
          </div>
        </div>

        <div className={`col-span-2 rounded-2xl border-2 p-6 transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className={`text-lg font-black tracking-tighter mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Distribuição de Trabalho</h3>
          <div className="space-y-3">
            {metrics.workDistribution.map((item, idx) => {
              const maxValue = Math.max(...metrics.workDistribution.map(w => w.value), 1);
              const percentage = (item.value / maxValue) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-semibold capitalize ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{item.status}: {item.value}</span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className={`h-full rounded-full transition-all ${
                      item.status === 'todo' ? 'bg-slate-500' :
                      item.status === 'doing' ? 'bg-amber-500' :
                      item.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`} style={{width: `${percentage}%`}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
