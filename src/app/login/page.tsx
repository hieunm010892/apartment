'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, KeyRound, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Đăng nhập không thành công.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-[400px] overflow-hidden rounded-xl bg-white shadow-xl border border-slate-200">
        {/* Header Banner */}
        <div className="bg-[#1E3A8A] px-5 py-4 text-white flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#312E81]">
            <Building2 className="h-5 w-5 text-blue-200" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">Hệ Thống Quản Lý Nhà Trọ</h1>
            <p className="text-xs text-blue-200">Apartment & Property Management ERP</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên đăng nhập (*)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                placeholder="Nhập username..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu (*)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>

          {/* Hint Badge */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 py-1.5 px-3 text-center text-[11px] text-slate-500">
            Tài khoản mẫu: <span className="font-semibold text-slate-700">admin</span> | Mật khẩu: <span className="font-semibold text-slate-700">admin123</span>
          </div>

          {/* Action Button */}
          <div className="pt-1 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-70 transition-colors"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

