'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Home, Plus, Search, Download, Edit3, Trash2, CheckCircle2, AlertCircle, Wrench, Layers, Tag, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface RoomItem {
  room_id: number;
  building_id?: number;
  room_code: string;
  room_number: string;
  floor_number: number;
  area: number;
  base_price: number;
  max_occupants: number;
  status: number; // 0: Trong, 1: Dat coc, 2: Dang o, 3: Bao tri
  status_text?: string;
  cleaning_status: number; // 0: Sach se, 1: Chua don
  cleaning_status_text?: string;
  tenant_name?: string;
  tenant_phone?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingRoom, setEditingRoom] = useState<Partial<RoomItem> | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((r: any, idx: number) => ({
          room_id: r.room_id || r.id || (idx + 1),
          building_id: r.building_id || 1,
          room_code: r.room_code || `P${r.room_number || (100 + idx)}`,
          room_number: r.room_number || String(r.room_code || (100 + idx)),
          floor_number: Number(r.floor_number || r.floor || 1),
          area: Number(r.area || r.area_sqm || 25),
          base_price: Number(r.base_price || 3500000),
          max_occupants: Number(r.max_occupants || 3),
          status: typeof r.status === 'number' ? r.status : (r.status === 'Occupied' ? 2 : r.status === 'Available' ? 0 : 3),
          status_text: r.status_text || (r.status === 2 ? 'Đang ở' : r.status === 1 ? 'Đặt cọc' : r.status === 3 ? 'Bảo trì' : 'Phòng trống'),
          cleaning_status: typeof r.cleaning_status === 'number' ? r.cleaning_status : (r.cleaning_status === 'Clean' ? 0 : 1),
          cleaning_status_text: r.cleaning_status_text || 'Sạch sẽ',
          tenant_name: r.tenant_name || '',
          tenant_phone: r.tenant_phone || '',
        }));
        setRooms(normalized);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phòng:', err);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const sTerm = searchTerm.toLowerCase();
    const matchSearch =
      (r.room_number || '').toLowerCase().includes(sTerm) ||
      (r.room_code || '').toLowerCase().includes(sTerm) ||
      (r.tenant_name || '').toLowerCase().includes(sTerm);

    const matchFloor = floorFilter === 'ALL' || r.floor_number === Number(floorFilter);
    const matchStatus = statusFilter === 'ALL' || String(r.status) === statusFilter;
    return matchSearch && matchFloor && matchStatus;
  });

  const handleExportExcel = () => {
    const data = filteredRooms.map((r, idx) => ({
      STT: idx + 1,
      'Số phòng': r.room_number,
      'Tầng': r.floor_number,
      'Giá thuê cơ bản (đ/tháng)': r.base_price,
      'Diện tích (m2)': r.area,
      'Sức chứa tối đa': r.max_occupants,
      'Trạng thái': r.status_text || 'Phòng trống',
      'Người đang ở': r.tenant_name || 'Chưa có',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachPhong');
    XLSX.writeFile(wb, `Danh_Sach_Phong_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    setRooms(prev => prev.map(r => r.room_id === editingRoom.room_id ? { ...r, ...editingRoom } as RoomItem : r));
    setShowModal(false);
  };

  return (
    <AppLayout title="Quản lý Danh mục Phòng" subtitle="Phân loại phòng, diện tích, giá thuê cơ bản và tình trạng dọn dẹp">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Home className="text-blue-600 shrink-0" size={24} />
              <span>Danh mục Phòng trọ</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý giá thuê, diện tích, sức chứa và tình trạng phòng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none justify-center px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
            >
              <Download size={14} />
              Excel
            </button>
            <button
              onClick={() => {
                setEditingRoom({
                  room_id: Date.now(),
                  room_number: '303',
                  room_code: 'P303',
                  floor_number: 3,
                  base_price: 4500000,
                  area: 28,
                  max_occupants: 3,
                  status: 0,
                  status_text: 'Phòng trống',
                  cleaning_status: 0,
                });
                setShowModal(true);
              }}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} />
              Thêm phòng
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1 shrink-0">
              <Layers size={14} />
              Tầng:
            </div>
            {['ALL', '1', '2', '3'].map((fl) => (
              <button
                key={fl}
                onClick={() => setFloorFilter(fl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  floorFilter === fl
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {fl === 'ALL' ? 'Tất cả' : `Tầng ${fl}`}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-300 mx-2 hidden sm:block shrink-0"></div>

            {['ALL', '2', '0', '1', '3'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' && 'Tất cả trạng thái'}
                {st === '2' && 'Đang ở'}
                {st === '0' && 'Phòng trống'}
                {st === '1' && 'Đặt cọc'}
                {st === '3' && 'Bảo trì'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo số phòng, mã..."
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
                  <th className="py-3 px-4">Số phòng</th>
                  <th className="py-3 px-4 text-center">Tầng</th>
                  <th className="py-3 px-4 text-right">Giá cơ bản (tháng)</th>
                  <th className="py-3 px-4 text-center">Diện tích</th>
                  <th className="py-3 px-4 text-center">Sức chứa</th>
                  <th className="py-3 px-4 text-center">Trạng thái phòng</th>
                  <th className="py-3 px-4 text-center">Tình trạng vệ sinh</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((r, idx) => (
                  <tr key={r.room_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      <span className="px-2.5 py-1 bg-slate-100 rounded text-xs border border-slate-200">
                        P.{r.room_number || r.room_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">Tầng {r.floor_number}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 text-sm">
                      {(r.base_price || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{r.area} m²</td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      <span className="font-bold text-blue-600">{r.status === 2 ? 1 : 0}</span> / {r.max_occupants} người
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.status === 2 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đang ở ({r.tenant_name || 'Khách thuê'})
                        </span>
                      ) : r.status === 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Sẵn sàng cho thuê
                        </span>
                      ) : r.status === 1 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Đã đặt cọc
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Đang bảo trì
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.cleaning_status === 0 ? (
                        <span className="text-emerald-600 font-medium text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 size={13} /> Sạch sẽ
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px] flex items-center justify-center gap-1">
                          <AlertCircle size={13} /> Cần dọn dẹp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingRoom(r);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Chỉnh sửa phòng"
                      >
                        <Edit3 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Không tìm thấy phòng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Edit Room */}
        {showModal && editingRoom && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6 animate-in fade-in zoom-in-95 text-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Cập nhật thông tin Phòng {editingRoom.room_number || editingRoom.room_code}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số phòng *</label>
                    <input
                      type="text"
                      required
                      value={editingRoom.room_number || ''}
                      onChange={(e) => setEditingRoom({ ...editingRoom, room_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tầng</label>
                    <input
                      type="number"
                      required
                      value={editingRoom.floor_number || 1}
                      onChange={(e) => setEditingRoom({ ...editingRoom, floor_number: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Giá thuê cơ bản (đ) *</label>
                    <input
                      type="number"
                      step={50000}
                      required
                      value={editingRoom.base_price || 0}
                      onChange={(e) => setEditingRoom({ ...editingRoom, base_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Diện tích (m²)</label>
                    <input
                      type="number"
                      value={editingRoom.area || 25}
                      onChange={(e) => setEditingRoom({ ...editingRoom, area: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Trạng thái phòng</label>
                    <select
                      value={editingRoom.status ?? 0}
                      onChange={(e) => setEditingRoom({ ...editingRoom, status: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value={0}>Trống (Sẵn sàng)</option>
                      <option value={2}>Đang ở</option>
                      <option value={1}>Đặt cọc</option>
                      <option value={3}>Sửa chữa bảo trì</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tình trạng dọn dẹp</label>
                    <select
                      value={editingRoom.cleaning_status ?? 0}
                      onChange={(e) => setEditingRoom({ ...editingRoom, cleaning_status: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value={0}>Đã dọn sạch</option>
                      <option value={1}>Cần dọn dẹp</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
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
