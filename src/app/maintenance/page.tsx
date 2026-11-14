'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Wrench, Plus, Search, Download, CheckCircle2, Clock, AlertTriangle, UserCheck, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MaintenanceTicket {
  id: number;
  ticket_code: string;
  room_code: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string;
  material_cost: number;
  labor_cost: number;
  total_cost: number;
  created_at: string;
  resolved_at?: string;
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Partial<MaintenanceTicket> | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/maintenance');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch =
      t.ticket_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportExcel = () => {
    const data = filteredTickets.map((t, idx) => ({
      STT: idx + 1,
      'Mã phiếu': t.ticket_code,
      'Phòng': t.room_code,
      'Nội dung sự cố': t.title,
      'Mức độ': t.priority,
      'Trạng thái': t.status,
      'Thợ sửa chữa': t.assigned_to,
      'Chi phí vật tư (đ)': t.material_cost,
      'Chi phí công thợ (đ)': t.labor_cost,
      'Tổng chi phí (đ)': t.total_cost,
      'Ngày tiếp nhận': t.created_at,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoTriSuCo');
    XLSX.writeFile(wb, `Danh_Sach_Bao_Tri_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    const mat = Number(editingTicket.material_cost) || 0;
    const lab = Number(editingTicket.labor_cost) || 0;
    const updated = {
      ...editingTicket,
      material_cost: mat,
      labor_cost: lab,
      total_cost: mat + lab,
    };

    if (editingTicket.id) {
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? { ...t, ...updated } as MaintenanceTicket : t));
    } else {
      const newOne: MaintenanceTicket = {
        id: Date.now(),
        ticket_code: `SC${Date.now().toString().slice(-4)}`,
        room_code: editingTicket.room_code || '101',
        title: editingTicket.title || '',
        description: editingTicket.description || '',
        priority: editingTicket.priority || 'Medium',
        status: editingTicket.status || 'InProgress',
        assigned_to: editingTicket.assigned_to || 'Thợ kỹ thuật tòa nhà',
        material_cost: mat,
        labor_cost: lab,
        total_cost: mat + lab,
        created_at: new Date().toISOString().slice(0, 10),
      };
      setTickets([newOne, ...tickets]);
    }
    setShowModal(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="text-amber-600" size={26} />
              Quản lý Yêu cầu Sửa chữa, Bảo trì & Chi phí Vận hành
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tiếp nhận báo hỏng thiết bị từ khách thuê, phân công kỹ thuật viên và hạch toán chi phí vật tư - nhân công
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
            <button
              onClick={() => {
                setEditingTicket({
                  room_code: '101',
                  title: 'Hỏng vòi sen nhà tắm',
                  description: 'Vòi sen bị rò rỉ nước',
                  priority: 'Medium',
                  status: 'Open',
                  assigned_to: 'Thợ điện nước Tân Phong',
                  material_cost: 150000,
                  labor_cost: 100000,
                });
                setShowModal(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              <Plus size={16} />
              Tạo phiếu báo hỏng
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            {['ALL', 'Open', 'InProgress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' && 'Tất cả sự cố'}
                {st === 'Open' && 'Mới tiếp nhận'}
                {st === 'InProgress' && 'Đang sửa chữa'}
                {st === 'Resolved' && 'Đã hoàn thành'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Tìm theo mã sự cố, phòng, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-4">Mã sự cố</th>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Nội dung báo hỏng</th>
                  <th className="py-3 px-4 text-center">Mức độ</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Kỹ thuật viên phụ trách</th>
                  <th className="py-3 px-4 text-right">Chi phí vật tư</th>
                  <th className="py-3 px-4 text-right">Công thợ</th>
                  <th className="py-3 px-4 text-right">Tổng chi phí</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{t.ticket_code}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-xs border border-blue-200">
                        P.{t.room_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.description}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.priority === 'High' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Khẩn cấp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Bình thường
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.status === 'Resolved' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Đã xử lý
                        </span>
                      ) : (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-200 inline-flex items-center gap-1">
                          <Clock size={12} /> Đang xử lý
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{t.assigned_to}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{t.material_cost.toLocaleString('en-US')} đ</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{t.labor_cost.toLocaleString('en-US')} đ</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {t.total_cost.toLocaleString('en-US')} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingTicket(t);
                          setShowModal(true);
                        }}
                        className="px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-600 hover:text-white rounded transition"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Ticket */}
        {showModal && editingTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 text-xs">
              <h3 className="text-base font-bold text-slate-900 border-b pb-3 mb-4">
                Phiếu Bảo trì Sự cố & Dự toán Chi phí
              </h3>

              <form onSubmit={handleSaveTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số phòng</label>
                    <input
                      type="text"
                      required
                      value={editingTicket.room_code || ''}
                      onChange={(e) => setEditingTicket({ ...editingTicket, room_code: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Trạng thái</label>
                    <select
                      value={editingTicket.status || 'InProgress'}
                      onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-semibold"
                    >
                      <option value="Open">Mới tiếp nhận</option>
                      <option value="InProgress">Đang sửa chữa</option>
                      <option value="Resolved">Đã sửa chữa xong</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tiêu đề sự cố *</label>
                  <input
                    type="text"
                    required
                    value={editingTicket.title || ''}
                    onChange={(e) => setEditingTicket({ ...editingTicket, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thợ kỹ thuật phụ trách</label>
                  <input
                    type="text"
                    value={editingTicket.assigned_to || ''}
                    onChange={(e) => setEditingTicket({ ...editingTicket, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Chi phí vật tư (đ)</label>
                    <input
                      type="number"
                      value={editingTicket.material_cost ?? 0}
                      onChange={(e) => setEditingTicket({ ...editingTicket, material_cost: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Công thợ (đ)</label>
                    <input
                      type="number"
                      value={editingTicket.labor_cost ?? 0}
                      onChange={(e) => setEditingTicket({ ...editingTicket, labor_cost: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
                  >
                    Lưu cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
