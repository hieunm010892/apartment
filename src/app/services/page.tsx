'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Settings2, Plus, Edit3, Trash2, CheckCircle2, Search, Download, DollarSign, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ServiceItem {
  id: number;
  service_code: string;
  service_name: string;
  unit_price: number;
  unit_name: string;
  charge_type: string;
  is_active: boolean;
  description?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredServices = services.filter(s =>
    s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.service_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = filteredServices.map((s, idx) => ({
      STT: idx + 1,
      'Mã DV': s.service_code,
      'Tên dịch vụ': s.service_name,
      'Đơn giá (đ)': s.unit_price,
      'Đơn vị tính': s.unit_name,
      'Phương thức tính': s.charge_type,
      'Trạng thái': s.is_active ? 'Đang áp dụng' : 'Tạm dừng',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DichVu');
    XLSX.writeFile(wb, `Danh_Muc_Dich_Vu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (editingItem.id) {
      setServices(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...editingItem } as ServiceItem : s));
    } else {
      const newItem: ServiceItem = {
        id: Date.now(),
        service_code: editingItem.service_code || 'DV_NEW',
        service_name: editingItem.service_name || '',
        unit_price: Number(editingItem.unit_price) || 0,
        unit_name: editingItem.unit_name || 'Phòng',
        charge_type: editingItem.charge_type || 'Fixed',
        is_active: true,
      };
      setServices(prev => [...prev, newItem]);
    }
    setShowModal(false);
  };

  return (
    <AppLayout title="Danh mục Dịch vụ & Đơn giá" subtitle="Cấu hình danh mục dịch vụ tính phí hàng tháng và đơn giá linh hoạt">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="text-blue-600 shrink-0" size={24} />
              <span>Dịch vụ & Đơn giá</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Đơn giá điện, nước, internet, rác và các khoản giảm trừ
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
                setEditingItem({
                  service_code: '',
                  service_name: '',
                  unit_price: 100000,
                  unit_name: 'Tháng',
                  charge_type: 'Fixed',
                  is_active: true,
                });
                setShowModal(true);
              }}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} />
              Thêm dịch vụ
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
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
                  <th className="py-3 px-4">Mã DV</th>
                  <th className="py-3 px-4">Tên dịch vụ</th>
                  <th className="py-3 px-4 text-right">Đơn giá chuẩn</th>
                  <th className="py-3 px-4 text-center">Đơn vị tính</th>
                  <th className="py-3 px-4 text-center">Cách tính tiền</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.service_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.service_name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {s.unit_price < 0 ? (
                        <span className="text-emerald-600">{s.unit_price.toLocaleString('en-US')} đ</span>
                      ) : (
                        <span>{s.unit_price.toLocaleString('en-US')} đ</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">{s.unit_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {s.charge_type === 'Meter' && 'Theo chỉ số đo'}
                        {s.charge_type === 'PerPerson' && 'Theo đầu người'}
                        {s.charge_type === 'Fixed' && 'Cố định theo phòng'}
                        {s.charge_type === 'Discount' && 'Khoản trừ ưu đãi'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-600 font-semibold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 size={13} /> Hoạt động
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingItem(s);
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

        {/* Modal Service */}
        {showModal && editingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 text-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem.id ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã dịch vụ *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.service_code || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, service_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên dịch vụ *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.service_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, service_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Đơn giá (đ) *</label>
                    <input
                      type="number"
                      required
                      value={editingItem.unit_price ?? 0}
                      onChange={(e) => setEditingItem({ ...editingItem, unit_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Đơn vị tính</label>
                    <input
                      type="text"
                      value={editingItem.unit_name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, unit_name: e.target.value })}
                      placeholder="kWh, m3, Tháng, Xe..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phương thức tính phí</label>
                  <select
                    value={editingItem.charge_type || 'Fixed'}
                    onChange={(e) => setEditingItem({ ...editingItem, charge_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Fixed">Cố định theo phòng (VND / phòng / tháng)</option>
                    <option value="PerPerson">Theo số người ở (VND / người / tháng)</option>
                    <option value="Meter">Theo số tiêu thụ đồng hồ (VND / kWh, m³)</option>
                    <option value="Discount">Khoản trừ tiền ưu đãi (Giảm trừ VND)</option>
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
                    Lưu dịch vụ
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

