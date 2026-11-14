'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { LayoutDashboard, Receipt, Gauge, Users, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({
  children,
  title = 'Hệ thống Quản lý Nhà trọ & Căn hộ ERP',
  subtitle
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavItems = [
    { name: 'Sơ đồ', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Hóa đơn', href: '/invoices', icon: Receipt },
    { name: 'Điện Nước', href: '/meter-readings', icon: Gauge },
    { name: 'Khách thuê', href: '/tenants', icon: Users },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar (Desktop fixed + Mobile slide-over drawer) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb-friendly quick bar for smartphones) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 flex items-center justify-around shadow-lg">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition ${
                  isActive
                    ? 'text-blue-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                <span className="mt-0.5">{item.name}</span>
              </Link>
            );
          })}

          {/* More menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800"
          >
            <Menu size={19} />
            <span className="mt-0.5">Tất cả</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
