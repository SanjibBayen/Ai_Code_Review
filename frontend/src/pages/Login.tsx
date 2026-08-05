import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Mail, ArrowRight, Github, Lock, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid developer email address');
      return;
    }

    try {
      setError('');
      await login(email);
      navigate('/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send verification code. Try again.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {searchParams.get('expired') && (
        <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded text-xs text-amber-300">
          Your session has expired. Please verify your email to log in again.
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
        {/* <p className="text-xs text-gray-400 mt-1">
          Enter your email to receive a 6-digit developer verification code.
        </p> */}
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Gmail / Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="email"
              required
              placeholder="demo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full justify-center py-2.5 text-sm"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Send Verification Code
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#30363d]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
          <span className="bg-[#0d1117] px-2 text-gray-500">OR DEVELOPER CONNECT</span>
        </div>
      </div>

      {/* <button
        onClick={() => {
          setEmail('demo@gmail.com');
        }}
        type="button"
        className="w-full py-2 px-3 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-200 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <Sparkles className="w-4 h-4 text-blue-400" />
        <span>Quick Demo Login (demo@gmail.com)</span>
      </button> */}

      <p className="text-center text-xs text-gray-400 pt-2">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-400 hover:underline font-semibold">
          Create account
        </Link>
      </p>
    </div>
  );
};
