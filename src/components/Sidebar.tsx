'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building, Home, Users, FileText,
  Gauge, Receipt, Wallet, Wrench, Shield, LogOut,
  Layers, Package, CheckCircle2, X
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Sơ đồ phòng (PMS)', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tòa nhà / Cơ sở', href: '/buildings', icon: Building },
  { name: 'Quản lý Phòng trọ', href: '/rooms', icon: Home },
  { name: 'Khách thuê & CT01', href: '/tenants', icon: Users },
  { name: 'Hợp đồng thuê', href: '/contracts', icon: FileText },
  { name: 'Ghi số Điện - Nước', href: '/meter-readings', icon: Gauge },
  { name: 'Hóa đơn & VietQR', href: '/invoices', icon: Receipt },
  { name: 'Sổ quỹ Thu - Chi', href: '/cashbook', icon: Wallet },
  { name: 'Sự cố & Bảo trì', href: '/maintenance', icon: Wrench },
  { name: 'Tài sản trong phòng', href: '/assets', icon: Package },
  { name: 'Dịch vụ & Giảm trừ', href: '/services', icon: Layers },
  { name: 'Quản trị & Nhật ký', href: '/users', icon: Shield },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 bg-[#1E3A8A] flex items-center justify-between px-4 border-b border-blue-900">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-blue-950 flex items-center justify-center shrink-0 shadow-inner">
            <Building className="h-5 w-5 text-blue-200" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white tracking-wider uppercase truncate">APARTMENT ERP</h2>
            <p className="text-[10px] text-blue-200 truncate">Quản lý Nhà trọ & Căn hộ</p>
          </div>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Phân Hệ Quản Lý
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose && onClose()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Strip */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
            A
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-semibold text-white truncate">admin</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Đang kết nối
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="w-64 shrink-0 hidden md:flex md:flex-col border-r border-slate-800">
        {navContent}
      </aside>

      {/* Mobile Drawer (Slide-out Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
