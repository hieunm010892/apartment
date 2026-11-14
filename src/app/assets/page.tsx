'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Package, Plus, Search, Download, Edit3, Trash2, CheckCircle2, AlertTriangle, Shield, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Asset {
  id: number;
  room_id: number;
  room_code: string;
  asset_name: string;
  serial_number: string;
  purchase_date: string;
  warranty_until: string;
  condition_status: string;
  notes?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Partial<Asset> | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized: Asset[] = data.map((item: any) => ({
          id: item.asset_id || item.id || Date.now(),
          room_id: item.room_id || 1,
          room_code: item.room_number || item.room_code || '101',
          asset_name: item.asset_name || '',
          serial_number: item.serial_number || '',
          purchase_date: item.purchase_date || '2025-01-01',
          warranty_until: item.warranty_until || '2026-12-31',
          condition_status: item.condition_status === 3 ? 'Repair' : 'Good',
          notes: item.notes || '',
        }));
        setAssets(normalized);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssets = (Array.isArray(assets) ? assets : []).filter(a => {
    const s = (searchTerm || '').toLowerCase();
    return (
      (a.asset_name || '').toLowerCase().includes(s) ||
      (a.room_code || '').toLowerCase().includes(s) ||
      (a.serial_number || '').toLowerCase().includes(s)
    );
  });

  const handleExportExcel = () => {
    const data = filteredAssets.map((a, idx) => ({
      STT: idx + 1,
      'Phòng': a.room_code,
      'Tên thiết bị': a.asset_name,
      'Số seri / Model': a.serial_number,
      'Ngày mua': a.purchase_date,
      'Hạn bảo hành': a.warranty_until,
      'Tình trạng': a.condition_status === 'Good' ? 'Hoạt động tốt' : 'Cần bảo dưỡng',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TaiSanThietBi');
    XLSX.writeFile(wb, `Danh_Sach_Thiet_Bi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    if (editingAsset.id) {
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...editingAsset } as Asset : a));
    } else {
      const created: Asset = {
        id: Date.now(),
        room_id: 1,
        room_code: editingAsset.room_code || '101',
        asset_name: editingAsset.asset_name || '',
        serial_number: editingAsset.serial_number || 'SN-DEFAULT',
        purchase_date: editingAsset.purchase_date || new Date().toISOString().slice(0, 10),
        warranty_until: editingAsset.warranty_until || '2026-12-31',
        condition_status: editingAsset.condition_status || 'Good',
        notes: editingAsset.notes || '',
      };
      setAssets([created, ...assets]);
    }
    setShowModal(false);
  };

  return (
    <AppLayout title="Quản lý Tài sản Thiết bị" subtitle="Kiểm kê trang thiết bị, máy lạnh, tủ lạnh và hạn bảo hành theo phòng">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="text-blue-600 shrink-0" size={24} />
              <span>Tài sản & Thiết bị</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm kê máy lạnh, tủ lạnh, khóa vân tay và hạn bảo hành
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
                setEditingAsset({
                  room_code: '101',
                  asset_name: 'Máy lạnh Panasonic Inverter 1.5HP',
                  serial_number: 'PANA-2026-X1',
                  purchase_date: '2025-01-10',
                  warranty_until: '2027-01-10',
                  condition_status: 'Good',
                });
                setShowModal(true);
              }}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} />
              Thêm thiết bị
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Tìm theo tên thiết bị, số phòng, số seri..."
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
                  <th className="py-3 px-4">Phòng gắn thiết bị</th>
                  <th className="py-3 px-4">Tên thiết bị / Tài sản</th>
                  <th className="py-3 px-4">Mã Seri / Model</th>
                  <th className="py-3 px-4">Ngày trang bị</th>
                  <th className="py-3 px-4">Hạn bảo hành</th>
                  <th className="py-3 px-4 text-center">Tình trạng</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-xs border border-blue-200">
                        P.{a.room_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{a.asset_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{a.serial_number}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{a.purchase_date}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{a.warranty_until}</td>
                    <td className="py-3 px-4 text-center">
                      {a.condition_status === 'Good' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Hoạt động tốt
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-200 inline-flex items-center gap-1">
                          <AlertTriangle size={12} /> Cần sửa chữa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingAsset(a);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                      >
                        <Edit3 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && editingAsset && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 text-xs">
              <h3 className="text-base font-bold text-slate-900 border-b pb-3 mb-4">
                Thông tin Thiết bị / Tài sản
              </h3>

              <form onSubmit={handleSaveAsset} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số phòng</label>
                    <input
                      type="text"
                      required
                      value={editingAsset.room_code || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, room_code: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mã Seri / Model</label>
                    <input
                      type="text"
                      value={editingAsset.serial_number || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, serial_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên tài sản / thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={editingAsset.asset_name || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, asset_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ngày trang bị</label>
                    <input
                      type="date"
                      value={editingAsset.purchase_date || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, purchase_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hạn bảo hành</label>
                    <input
                      type="date"
                      value={editingAsset.warranty_until || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, warranty_until: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tình trạng thiết bị</label>
                  <select
                    value={editingAsset.condition_status || 'Good'}
                    onChange={(e) => setEditingAsset({ ...editingAsset, condition_status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Good">Hoạt động tốt</option>
                    <option value="Damaged">Bị hư hỏng / cần sửa chữa</option>
                  </select>
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
                    Lưu thiết bị
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

