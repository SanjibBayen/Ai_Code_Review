import React from 'react';
import { Outlet } from 'react-router-dom';
import { Terminal, Code2, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#0d1117] text-gray-200 flex flex-col lg:flex-row font-sans">
      {/* Left visual side: VS Code terminal style branding */}
      <div className="lg:w-1/2 p-8 lg:p-12 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between relative overflow-hidden">
        {/* Top logo */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md">
            &gt;_
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight block leading-none">AI CODE REVIEW</span>
            <span className="text-[10px] text-gray-400 font-mono">Developer Platform v2.4</span>
          </div>
        </div>

        {/* Middle terminal graphic */}
        <div className="my-10 z-10">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs shadow-2xl space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#30363d]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-gray-500 text-[10px] ml-2">bash - ai-code-review</span>
            </div>
            <p className="text-blue-400">&gt; ai-code-review analyze --repo=main</p>
            <p className="text-gray-400">✓ Parsing AST & file dependency tree...</p>
            <p className="text-emerald-400">✓ Security scan: 0 critical SQLi vulnerabilities</p>
            <p className="text-amber-400">⚠ Performance: 2 unmemoized React hooks detected</p>
            <p className="text-gray-300 font-bold">&gt; Overall Quality Score: 92/100 (A+)</p>
          </div>

          <div className="mt-8 space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Ship better code with intelligent automated reviews.
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Integrate deep security scans, performance heuristics, and architectural insights directly into your workflow.
            </p>
          </div>
        </div>

        {/* Footer features */}
        <div className="grid grid-cols-3 gap-4 border-t border-[#30363d] pt-6 text-xs text-gray-400 z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>OWASP Top 10</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>20+ Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Gemini Powered</span>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-[#0d1117]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
