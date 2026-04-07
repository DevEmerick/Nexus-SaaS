export const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'Alta':
      return {
        badge: 'text-red-700 bg-red-100 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800',
        calendar: 'bg-red-500 text-white border-red-600'
      };
    case 'Média':
      return {
        badge: 'text-amber-700 bg-amber-100 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800',
        calendar: 'bg-amber-400 text-amber-950 border-amber-500'
      };
    case 'Baixa':
      return {
        badge: 'text-emerald-700 bg-emerald-100 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800',
        calendar: 'bg-emerald-500 text-white border-emerald-600'
      };
    default:
      return {
        badge: 'text-slate-700 bg-slate-100 ring-slate-200 dark:bg-slate-800 dark:text-slate-400',
        calendar: 'bg-slate-500 text-white border-slate-600'
      };
  }
};
