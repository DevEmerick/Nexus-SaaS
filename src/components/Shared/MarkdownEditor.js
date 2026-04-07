import React, { useState } from 'react';
import { Bold, Italic, Strikethrough, Link, List as ListIcon } from 'lucide-react';

const MarkdownEditor = ({ value, onChange, theme }) => {
  const [view, setView] = useState('write');
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

export default MarkdownEditor;
