import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Sparkles,
  ShieldCheck,
  Code2,
  GitBranch,
  Terminal,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { SiteFooter } from '../components/layout/SiteFooter';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 font-sans flex flex-col">
      {/* Header Navigation */}
      <header className="h-14 bg-[#161b22] border-b border-[#30363d] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-md">
            &gt;_
          </div>
          <span className="font-bold text-white tracking-tight">AI CODE REVIEW</span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/60 rounded-full text-xs text-blue-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Automated Code Review for Modern Developers</span>
          </div> */}

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Find bugs, security vulnerabilities and performance issues before production.
          </h1>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI Code Review operates as a virtual Senior Staff Engineer inside your IDE, performing deep security scans, AST analysis, and performance refactoring.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/login')}
            >
              Start Reviewing Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Explore Live IDE Demo
            </Button>
          </div>
        </div>

        {/* Hero Visual: Fake VS Code Review Workspace */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
          {/* Header Bar */}
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between text-gray-400 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-sans font-semibold text-gray-300">auth.controller.js — AI Code Review Workspace</span>
            </div>
            <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded font-bold">92/100 Quality Score</span>
          </div>

          {/* IDE Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#30363d]">
            {/* Editor preview */}
            <div className="p-4 md:col-span-2 space-y-1.5 text-gray-300 bg-[#0d1117]">
              <p><span className="text-purple-400">exports</span>.<span className="text-yellow-300">verifyOTP</span> = <span className="text-blue-400">async</span> (req, res) =&gt; &#123;</p>
              <p className="pl-4"><span className="text-purple-400">const</span> &#123; email, otp &#125; = req.body;</p>
              <p className="pl-4 text-red-400 bg-red-950/30 p-1 rounded border-l-2 border-red-500">
                <span className="text-gray-500">32 | </span><span className="text-purple-400">const</span> query = `SELECT * FROM users WHERE email = '${`email`}'`; ⚠ CRITICAL: SQL Injection Risk
              </p>
              <p className="pl-4"><span className="text-purple-400">const</span> token = jwt.sign(&#123; id &#125;, SECRET, &#123; expiresIn: <span className="text-amber-300">'15m'</span> &#125;);</p>
              <p className="pl-4">res.<span className="text-yellow-300">json</span>(&#123; token &#125;);</p>
              <p>&#125;;</p>
            </div>

            {/* AI Recommendation panel */}
            <div className="p-4 bg-[#161b22] space-y-3 font-sans">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>SQL INJECTION DETECTED</span>
              </div>
              <p className="text-xs text-gray-300 leading-normal">
                User input is directly concatenated into dynamic SQL string. Attackers can dump sensitive user records.
              </p>
              <div className="p-2 bg-[#0d1117] border border-[#30363d] rounded font-mono text-[10px] text-emerald-400">
                + const query = 'SELECT * FROM users WHERE email = $1';
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-lg space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Security Vulnerability Scans</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Detect SQL Injections, XSS vectors, hardcoded secrets, and unsafe JWT configurations instantly.
            </p>
          </div>

          <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-lg space-y-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Performance Bottlenecks</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Identify O(N^2) computational loops, unindexed queries, and redundant React re-renders.
            </p>
          </div>

          <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-lg space-y-2">
            <Code2 className="w-6 h-6 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Monaco Diff Refactoring</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Compare original code with AI-suggested refactored diffs and apply fixes with a single click.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
