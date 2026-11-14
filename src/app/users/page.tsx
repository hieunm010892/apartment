'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ShieldCheck, Users, History, Key, CheckCircle2, Search, Download, UserPlus, Eye, Lock } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UserItem {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
}

interface AuditLogItem {
  id: number;
  user_name: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  created_at: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [users, setUsers] = useState<UserItem[]>([
    {
      id: 1,
      username: 'admin',
      full_name: 'Trần Thị Mỹ Hạnh (Cô Núi)',
      email: 'conui@apartment.vn',
      phone: '0903123456',
      role: 'SuperAdmin',
      is_active: true,
    },
    {
      id: 2,
      username: 'manager_hieu',
      full_name: 'Nguyễn Minh Hiếu',
      email: 'hieunm@apartment.vn',
      phone: '0912345678',
      role: 'Manager',
      is_active: true,
    },
    {
      id: 3,
      username: 'tech_nam',
      full_name: 'Lê Hoàng Nam (Kỹ thuật)',
      email: 'namlh@apartment.vn',
      phone: '0988776655',
      role: 'Technician',
      is_active: true,
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 1,
      user_name: 'admin',
      action: 'UPDATE',
      table_name: 'Buildings',
      record_id: '1',
      old_value: 'STK: 0501000080123',
      new_value: 'STK: 0501000080131 (Cập nhật STK chính xác)',
      ip_address: '192.168.0.69',
      created_at: '2026-10-31 08:30:15',
    },
    {
      id: 2,
      user_name: 'admin',
      action: 'INSERT',
      table_name: 'Invoices',
      record_id: 'HD-202610-101',
      old_value: '',
      new_value: 'Phát hành HĐ Tháng 10 Phòng 101 - Tổng tiền: 5.640.000 đ',
      ip_address: '192.168.0.69',
      created_at: '2026-10-31 09:12:00',
    },
    {
      id: 3,
      user_name: 'manager_hieu',
      action: 'PAYMENT',
      table_name: 'Payments',
      record_id: 'PT-101-10',
      old_value: 'Còn nợ: 5.640.000 đ',
      new_value: 'Khách thanh toán VietQR: 5.640.000 đ (Đã thanh toán đủ)',
      ip_address: '192.168.0.105',
      created_at: '2026-10-31 10:45:22',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleExportExcel = () => {
    if (activeTab === 'users') {
      const data = users.map((u, idx) => ({
        STT: idx + 1,
        'Tên đăng nhập': u.username,
        'Họ và tên': u.full_name,
        'Email': u.email,
        'Số điện thoại': u.phone,
        'Vai trò': u.role,
        'Trạng thái': u.is_active ? 'Kích hoạt' : 'Khóa',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'NguoiDung');
      XLSX.writeFile(wb, `Danh_Sach_Nguoi_Dung_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const data = auditLogs.map((a, idx) => ({
        STT: idx + 1,
        'Người thực hiện': a.user_name,
        'Hành động': a.action,
        'Bảng dữ liệu': a.table_name,
        'Mã bản ghi': a.record_id,
        'Giá trị mới': a.new_value,
        'Địa chỉ IP': a.ip_address,
        'Thời gian': a.created_at,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'LichSuThaoTac');
      XLSX.writeFile(wb, `Nhat_Ky_AuditLog_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={26} />
              Phân quyền Người dùng & Nhật ký Thao tác Hệ thống (Audit Log)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản trị tài khoản đăng nhập theo phân hệ vai trò (RBAC) và theo dõi lịch sử chỉnh sửa giá, xóa hóa đơn để chống thất thoát
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition"
            >
              <Download size={15} />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-white px-5 rounded-t-xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={16} />
            Danh sách Tài khoản Quản trị ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History size={16} />
            Nhật ký Lịch sử Thao tác (Audit Trail)
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-80">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
                <input
                  type="text"
                  placeholder="Tìm tài khoản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs"
                />
              </div>
              <button
                onClick={() => alert('Thêm tài khoản người dùng mới')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus size={15} />
                Thêm tài khoản
              </button>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-4">Tên đăng nhập</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Điện thoại</th>
                  <th className="py-3 px-4 text-center">Vai trò</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{u.username}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.phone}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-600 font-semibold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 size={13} /> Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-sm overflow-hidden p-5 space-y-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                  <th className="py-3 px-4">Bảng / Module</th>
                  <th className="py-3 px-4">Chi tiết thay đổi</th>
                  <th className="py-3 px-4 font-mono">Địa chỉ IP</th>
                  <th className="py-3 px-4 font-mono">Thời gian ghi nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">@{a.user_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800">
                        {a.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{a.table_name}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm truncate" title={a.new_value}>
                      {a.new_value}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{a.ip_address}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{a.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
