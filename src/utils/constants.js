// --- Paleta de Cores do Sistema ---
export const PALETTE = {
  slate: { name: 'Cinza', dot: 'bg-slate-500', soft: 'bg-slate-50 dark:bg-slate-800/80', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' },
  indigo: { name: 'Índigo', dot: 'bg-indigo-500', soft: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800/50', text: 'text-indigo-700 dark:text-indigo-400' },
  emerald: { name: 'Esmeralda', dot: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-400' },
  rose: { name: 'Rosa', dot: 'bg-rose-500', soft: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800/50', text: 'text-rose-700 dark:text-rose-400' },
  amber: { name: 'Âmbar', dot: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-700 dark:text-amber-400' },
  cyan: { name: 'Ciano', dot: 'bg-cyan-500', soft: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-200 dark:border-cyan-800/50', text: 'text-cyan-700 dark:text-cyan-400' },
  purple: { name: 'Roxo', dot: 'bg-purple-500', soft: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800/50', text: 'text-purple-700 dark:text-purple-400' }
};

export const COLOR_KEYS = Object.keys(PALETTE);

export const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'Aguardando', color: 'slate' },
  { id: 'in-progress', title: 'Em Progresso', color: 'indigo' },
  { id: 'done', title: 'Finalizado', color: 'emerald' },
];
