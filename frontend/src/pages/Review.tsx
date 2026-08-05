import React, { useRef, useState } from 'react';
import { EditorTabs } from '../components/editor/EditorTabs';
import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor';
import { AIReviewPanel } from '../components/review/AIReviewPanel';
import { Code2, FileUp, Sparkles } from 'lucide-react';
import { useReviewStore } from '../store/reviewStore';
import { useUIStore } from '../store/uiStore';

const languageFromFileName = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const languages: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', java: 'java', c: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp',
    go: 'go', rs: 'rust', json: 'json', html: 'html', css: 'css',
  };
  return languages[extension || ''] || 'plaintext';
};

export const Review: React.FC = () => {
  const [mobileTab, setMobileTab] = useState<'editor' | 'review'>('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentReview, openFile } = useReviewStore();
  const { addNotification } = useUIStore();

  const handleLocalFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 50_000) {
      addNotification({ title: 'File too large', message: 'Choose a source file smaller than 50 KB for review.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      openFile({
        id: `local-${Date.now()}`,
        name: file.name,
        path: `local/${file.name}`,
        type: 'file',
        language: languageFromFileName(file.name),
        content: typeof reader.result === 'string' ? reader.result : '',
        isModified: false,
      });
      addNotification({ title: 'File loaded', message: `${file.name} is ready for review.`, type: 'success' });
      setMobileTab('editor');
    };
    reader.onerror = () => addNotification({ title: 'Unable to read file', message: 'Please select a text-based source file.', type: 'error' });
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 bg-[#0A0A0A] overflow-hidden relative">
      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="flex lg:hidden bg-[#0A0A0A] border-b border-[rgba(197,160,89,0.18)] px-2 py-1 shrink-0 z-10 gap-2">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
            mobileTab === 'editor'
              ? 'bg-[#C5A059] text-[#0A0A0A]'
              : 'bg-[#141414] text-[#D4CFC9]/70 hover:text-[#D4CFC9]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('review')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
            mobileTab === 'review'
              ? 'bg-[#C5A059] text-[#0A0A0A]'
              : 'bg-[#141414] text-[#D4CFC9]/70 hover:text-[#D4CFC9]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-current" />
          <span>AI Review {currentReview ? `(${currentReview.overallScore}%)` : ''}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cc,.hpp,.go,.rs,.json,.html,.css,.txt"
        onChange={handleLocalFile}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded border border-[rgba(197,160,89,0.35)] bg-[#141414] px-2.5 py-1.5 text-xs font-medium text-[#D4CFC9] transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
        title="Open a local source file"
      >
        <FileUp className="h-3.5 w-3.5" />
        <span>Open file</span>
      </button>

      {/* Central Editor Area */}
      <div className={`flex-1 flex-col min-w-0 h-full overflow-hidden ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Top Opened Files Tabs */}
        <EditorTabs />

        {/* Monaco Editor Container */}
        <div className="flex-1 relative overflow-hidden flex">
          <MonacoCodeEditor />
        </div>
      </div>

      {/* Right AI Review Panel */}
      <div className={`h-full ${mobileTab === 'review' ? 'flex flex-1 w-full' : 'hidden lg:flex'}`}>
        <AIReviewPanel />
      </div>
    </div>
  );
};
