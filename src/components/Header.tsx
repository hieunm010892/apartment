'use client';

import { Building2, Calendar, Database, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600">
        {/* PostgreSQL Database Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          <Database className="h-3.5 w-3.5" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium">
          <Calendar className="h-3.5 w-3.5" />
          <span className="capitalize">{today}</span>
        </div>
      </div>
    </header>
  );
}
