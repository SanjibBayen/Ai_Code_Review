import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart, Mail, ShieldCheck, Terminal } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#30363d] bg-[#0b1018] text-gray-400">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.5fr_1fr_1fr] md:px-12">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white transition-colors hover:text-blue-400">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 font-mono text-xs font-bold shadow-md">
              &gt;_
            </span>
            <span className="font-semibold tracking-tight">AI CODE REVIEW</span>
          </Link>
          <p className="max-w-sm text-xs leading-5 text-gray-500">
            Practical, AI-assisted code reviews for teams that want to ship secure, maintainable software with confidence.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-md border border-[#30363d] p-2 text-gray-400 transition-colors hover:border-blue-500 hover:text-white"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="mailto:support@aicodereview.dev"
              aria-label="Contact support"
              className="rounded-md border border-[#30363d] p-2 text-gray-400 transition-colors hover:border-blue-500 hover:text-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-200">Platform</h2>
          <nav aria-label="Platform links" className="space-y-2 text-xs">
            <Link to="/register" className="block transition-colors hover:text-blue-400">Start a free review</Link>
            <Link to="/login" className="block transition-colors hover:text-blue-400">Developer sign in</Link>
            <Link to="/dashboard" className="block transition-colors hover:text-blue-400">Live IDE demo</Link>
          </nav>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-200">Built for developers</h2>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Security-focused insights</li>
            <li className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-blue-400" /> IDE-style review workflow</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#30363d]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-[11px] md:flex-row md:items-center md:justify-between md:px-12">
          <span>© {year} AI Code Review. All rights reserved.</span>
          <span className="flex items-center gap-1">Built with <Heart className="h-3 w-3 fill-red-400 text-red-400" /> for better code.</span>
        </div>
      </div>
    </footer>
  );
};
