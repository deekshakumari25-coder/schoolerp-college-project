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
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">School portal</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Sign in as admin, teacher, or student</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">python backend/scripts/seed.py</code> for
          demo users: admin/admin, teacher/teacher, student/student
        </p>
      </div>
    </div>
  );
}
