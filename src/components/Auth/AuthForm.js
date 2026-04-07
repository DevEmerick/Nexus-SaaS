import { User, Mail, Lock, BookOpen, Sun, Moon } from 'lucide-react';

const AuthForm = ({
  theme,
  authView,
  authForm,
  authError,
  setAuthView,
  setAuthForm,
  setAuthError,
  setTheme,
  handleAuthSubmit
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <button onClick={() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('nexus_theme', newTheme);
      }} className="absolute top-6 right-6 p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
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
};

export default AuthForm;
