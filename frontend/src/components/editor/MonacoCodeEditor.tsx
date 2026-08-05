import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useReviewStore } from '../../store/reviewStore';

export const MonacoCodeEditor: React.FC = () => {
  const { activeFile, updateFileContent, currentReview, selectedIssue } = useReviewStore();
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom Sophisticated Dark theme
    monaco.editor.defineTheme('sophisticated-dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8c8275', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C5A059', fontStyle: 'bold' },
        { token: 'string', foreground: 'e0c99a' },
        { token: 'number', foreground: 'd4c090' },
        { token: 'type', foreground: 'E5C384' },
        { token: 'function', foreground: 'D4CFC9' },
      ],
      colors: {
        'editor.background': '#0A0A0A',
        'editor.foreground': '#D4CFC9',
        'editor.lineHighlightBackground': '#141414',
        'editorCursor.foreground': '#C5A059',
        'editorWhitespace.foreground': 'rgba(197, 160, 89, 0.15)',
        'editorLineNumber.foreground': 'rgba(212, 207, 201, 0.3)',
        'editorLineNumber.activeForeground': '#C5A059',
        'editorGutter.background': '#0A0A0A',
      }
    });

    monaco.editor.setTheme('sophisticated-dark-theme');

    // Add inline review markers if review exists
    if (currentReview?.issues && monaco) {
      const markers = currentReview.issues.map((iss) => ({
        startLineNumber: iss.line || 1,
        startColumn: 1,
        endLineNumber: iss.line || 1,
        endColumn: 100,
        message: `[${iss.severity}] ${iss.title}: ${iss.description}`,
        severity:
          iss.severity === 'CRITICAL' || iss.severity === 'ERROR'
            ? monaco.MarkerSeverity.Error
            : iss.severity === 'WARNING'
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Info
      }));

      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelMarkers(model, 'ai-code-review', markers);
      }
    }
  };

  // Jump to selected issue line in editor when user clicks an issue
  React.useEffect(() => {
    if (selectedIssue && editorRef.current) {
      editorRef.current.revealLineInCenter(selectedIssue.line || 1);
      editorRef.current.setPosition({ lineNumber: selectedIssue.line || 1, column: 1 });
      editorRef.current.focus();
    }
  }, [selectedIssue]);

  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#0A0A0A] flex flex-col items-center justify-center text-[#D4CFC9]/50 text-xs p-6">
        <p className="font-serif text-[#C5A059] text-sm mb-1">No file selected in workspace</p>
        <p className="text-[11px] text-[#D4CFC9]/40">Select a file from the Explorer sidebar to start editing.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#0A0A0A] relative">
      <Editor
        height="100%"
        language={activeFile.language || 'javascript'}
        value={activeFile.content || ''}
        onChange={(val) => updateFileContent(activeFile.path, val || '')}
        onMount={handleEditorMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 12 }
        }}
        loading={
          <div className="flex items-center justify-center h-full text-xs text-[#C5A059] bg-[#0A0A0A]">
            Loading Monaco Editor...
          </div>
        }
      />
    </div>
  );
};
