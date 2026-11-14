'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user session exists in localStorage
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Đang chuyển hướng tới Hệ thống Quản lý Nhà trọ...</p>
      </div>
    </div>
  );
}

