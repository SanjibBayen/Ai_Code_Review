import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useReviewStore } from '../../store/reviewStore';
import { X, Check, Copy } from 'lucide-react';
import { Button } from '../common/Button';

export const MonacoDiffViewer: React.FC = () => {
  const { activeDiffIssue, setDiffViewActive, activeFile, updateFileContent } = useReviewStore();
  const [copied, setCopied] = React.useState(false);

  if (!activeDiffIssue) return null;

  const originalCode = activeDiffIssue.originalCode || activeFile?.content || '';
  const modifiedCode = activeDiffIssue.suggestedCode || activeDiffIssue.suggestedFix || '';

  const handleApplyFix = () => {
    if (activeFile && activeDiffIssue.suggestedCode) {
      const updatedContent = activeFile.content?.replace(
        activeDiffIssue.originalCode || '',
        activeDiffIssue.suggestedCode
      );
      if (updatedContent) {
        updateFileContent(activeFile.path, updatedContent);
      }
    }
    setDiffViewActive(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(modifiedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[80vh] bg-[#111111] border border-[rgba(197,160,89,0.25)] rounded shadow-2xl flex flex-col overflow-hidden">
        {/* Diff Header */}
        <div className="px-4 py-3 bg-[#0A0A0A] border-b border-[rgba(197,160,89,0.18)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#D4CFC9] font-serif flex items-center gap-2">
              <span>Diff View: {activeDiffIssue.title}</span>
              <span className="text-xs font-mono text-[#C5A059]">Line {activeDiffIssue.line}</span>
            </h3>
            <p className="text-xs text-[#D4CFC9]/60 mt-0.5">{activeDiffIssue.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy Fix'}
            </Button>
            <Button variant="primary" size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={handleApplyFix}>
              Apply Fix
            </Button>
            <button
              onClick={() => setDiffViewActive(false)}
              className="p-1 text-[#D4CFC9]/60 hover:text-[#C5A059] rounded hover:bg-[#141414]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Editor Container */}
        <div className="flex-1 bg-[#0A0A0A] relative">
          <DiffEditor
            height="100%"
            language={activeFile?.language || 'javascript'}
            original={originalCode}
            modified={modifiedCode}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              readOnly: true,
              automaticLayout: true,
              renderSideBySide: true,
              minimap: { enabled: false }
            }}
          />
        </div>
      </div>
    </div>
  );
};
