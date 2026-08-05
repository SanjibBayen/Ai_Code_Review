import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { ShieldCheck, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';

export const VerifyOTP: React.FC = () => {
  const { pendingEmail, demoOtp, verifyOTP, login, loading } = useAuthStore();
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 minutes
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const email = pendingEmail || 'uttammaji842@gmail.com';

  // Timer countdown
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setOtpDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setError('');
      await verifyOTP(email, fullOtp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired verification code.');
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      await login(email);
      setTimerSeconds(120);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch {
      setError('Failed to resend code');
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-3">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Verify your email</h2>
        <p className="text-xs text-gray-400 mt-1">
          We sent a 6-digit verification code to{' '}
          <span className="font-semibold text-gray-200 font-mono">{email}</span>.
        </p>
      </div>

      {demoOtp && (
        <div className="p-3 bg-blue-950/60 border border-blue-800/60 rounded text-xs text-blue-300 font-mono flex items-center justify-between">
          <span>Demo Verification OTP Code:</span>
          <span className="font-bold text-sm text-white bg-blue-900/80 px-2 py-0.5 rounded tracking-widest">{demoOtp}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>New 6-digit code dispatched to your email!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded text-xs text-red-400">
            {error}
          </div>
        )}

        {/* 6 Digit Input Group */}
        <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 text-center text-lg font-bold font-mono bg-[#161b22] border border-[#30363d] rounded-md text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          ))}
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full justify-center py-2.5 text-sm"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Verify & Continue to Dashboard
        </Button>
      </form>

      {/* Timer & Resend */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#30363d]">
        <span className="font-mono text-gray-400">
          Code expires in <span className="text-blue-400 font-bold">{formatTimer(timerSeconds)}</span>
        </span>

        <button
          onClick={handleResend}
          disabled={timerSeconds > 0}
          className="text-blue-400 hover:underline font-semibold disabled:opacity-40 disabled:no-underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Resend code</span>
        </button>
      </div>
    </div>
  );
};
