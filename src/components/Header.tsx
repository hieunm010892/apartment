'use client';

import React from 'react';
import { Menu, Calendar, Database, Building2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export default function Header({ title, subtitle, onOpenMobileMenu }: HeaderProps) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
          aria-label="Mở menu điều hướng"
        >
          <Menu size={22} />
        </button>

        <div className="overflow-hidden">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0">
        {/* PostgreSQL Database Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px] sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">PostgreSQL</span> Active
        </div>

        {/* Date (hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-500 font-medium text-xs">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="capitalize">{today}</span>
        </div>
      </div>
    </header>
  );
}
