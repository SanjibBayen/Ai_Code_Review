import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid developer email');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      await register(name, email, password);
      navigate('/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Create your developer account</h2>
        <p className="text-xs text-gray-400 mt-1">
          Get started with automated AI code reviews and security scans.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              required
              placeholder="Uttam Maji"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Gmail / Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="email"
              required
              placeholder="uttammaji842@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full justify-center py-2.5 text-sm"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account & Verify
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:underline font-semibold">
          Log in
        </Link>
      </p>
    </div>
  );
};
