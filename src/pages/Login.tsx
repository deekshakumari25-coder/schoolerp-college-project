import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';
import type { Role, UserMe } from '@/types/auth';

interface LoginResponse {
  token: string;
  username: string;
  role: Role;
  displayName: string;
  isClassTeacher: boolean;
  homeroomClassId: string | null;
  subjectsTaught: { classId: string; subjectName: string }[];
}

function toUserMe(r: LoginResponse): UserMe {
  return {
    username: r.username,
    role: r.role,
    displayName: r.displayName,
    isClassTeacher: r.isClassTeacher,
    homeroomClassId: r.homeroomClassId,
    subjectsTaught: r.subjectsTaught ?? [],
  };
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', { username, password });
      login(data.token, toUserMe(data));
      if (data.role === 'admin') navigate('/admin', { replace: true });
      else if (data.role === 'teacher')
        navigate(data.isClassTeacher ? '/teacher/my-class' : '/teacher/no-class', { replace: true });
      else navigate('/student', { replace: true });
    } catch {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-zinc-950 font-sans">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 md:hidden flex justify-center items-center">
            <img src="/school_logo.png" alt="SH School Logo" className="w-16 h-16 mr-3" />
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">SHS</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Please enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex align-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900 w-full dark:text-white transition-all shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Sign in to Portal
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <span className="font-semibold block mb-1">Demo Accounts</span>
            <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">admin/admin</code> •{' '}
            <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">smith/password</code> •{' '}
            <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">alice/alice</code>
          </p>
        </div>
      </div>

      {/* Right Side - Brand & Graphics */}
      <div className="hidden md:flex w-1/2 relative bg-zinc-900 overflow-hidden items-center justify-center">
        {/* Dynamic Abstract Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-zinc-900 to-indigo-900/60 z-0"></div>
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen"></div>
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen"></div>
        
        {/* Glassmorphism content container */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center backdrop-blur-sm bg-zinc-900/40 rounded-3xl border border-white/5 shadow-2xl overflow-hidden max-w-md w-full mx-8">
          
          <div className="mb-8 p-6 bg-white/5 shadow-inner rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transform transition-transform hover:scale-105 duration-500">
            <img src="/school_logo.png" alt="SH School Logo" className="w-32 h-32 object-contain drop-shadow-2xl" />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            SH School
          </h2>
          
          <div className="w-16 h-1 bg-blue-500 rounded-full mb-6 opacity-80"></div>
          
          <p className="text-blue-100 text-lg md:text-xl font-medium tracking-wide">
            Empowering the minds of tomorrow.
          </p>
          
          <p className="mt-4 text-zinc-400 text-sm max-w-sm">
            Access your courses, grades, attendances, and administration portal all in one beautifully designed platform.
          </p>
        </div>
      </div>
    </div>
  );
}
