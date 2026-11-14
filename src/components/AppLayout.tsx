'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, title = 'Hệ thống Quản lý Nhà trọ & Căn hộ ERP', subtitle }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
