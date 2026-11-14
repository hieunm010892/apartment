'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Zap, Droplets, AlertTriangle, CheckCircle2, Download, Plus, Save, Trash2, Edit3, Calculator, Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MeterReadingItem {
  reading_id: number;
  room_id: number;
  room_number: string;
  billing_month: number;
  billing_year: number;
  electric_old: number;
  electric_new: number;
  electric_usage: number;
  water_old: number;
  water_new: number;
  water_usage: number;
  reading_date: string;
  is_abnormal_warning?: boolean;
  is_billed?: boolean;
}

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState<MeterReadingItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReading, setEditingReading] = useState<Partial<MeterReadingItem> | null>(null);

  useEffect(() => {
    fetchReadings();
  }, [selectedMonth, selectedYear]);

  const fetchReadings = async () => {
    try {
      const res = await fetch(`/api/meter-readings?month=${selectedMonth}&year=${selectedYear}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((r: any, idx: number) => ({
          reading_id: r.reading_id || r.id || (idx + 1),
          room_id: r.room_id || 1,
          room_number: r.room_number || r.room_code || '101',
          billing_month: Number(r.billing_month || r.reading_month || selectedMonth),
          billing_year: Number(r.billing_year || r.reading_year || selectedYear),
          electric_old: Number(r.electric_old ?? r.old_electric ?? 0),
          electric_new: Number(r.electric_new ?? r.new_electric ?? 0),
          electric_usage: Number(r.electric_usage ?? Math.max(0, (r.electric_new ?? r.new_electric ?? 0) - (r.electric_old ?? r.old_electric ?? 0))),
          water_old: Number(r.water_old ?? r.old_water ?? 0),
          water_new: Number(r.water_new ?? r.new_water ?? 0),
          water_usage: Number(r.water_usage ?? Math.max(0, (r.water_new ?? r.new_water ?? 0) - (r.water_old ?? r.old_water ?? 0))),
          reading_date: r.reading_date || '2026-10-31',
          is_abnormal_warning: r.is_abnormal_warning || false,
          is_billed: r.is_billed || false,
        }));
        setReadings(normalized);
      }
    } catch (err) {
      console.error('Lỗi tải chỉ số điện nước:', err);
    }
  };

  const filteredReadings = readings.filter(r => {
    const sTerm = searchTerm.toLowerCase();
    const matchMonth = r.billing_month === selectedMonth && r.billing_year === selectedYear;
    const matchSearch = (r.room_number || '').toLowerCase().includes(sTerm);
    return matchMonth && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingReading({
      reading_id: Date.now(),
      room_number: '101',
      billing_month: selectedMonth,
      billing_year: selectedYear,
      electric_old: 120,
      electric_new: 120,
      electric_usage: 0,
      water_old: 15,
      water_new: 15,
      water_usage: 0,
      reading_date: new Date().toISOString().slice(0, 10),
    });
    setShowAddModal(true);
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReading) return;

    if ((editingReading.electric_new || 0) < (editingReading.electric_old || 0)) {
      alert('Cảnh báo: Chỉ số Điện mới không được nhỏ hơn chỉ số cũ!');
      return;
    }
    if ((editingReading.water_new || 0) < (editingReading.water_old || 0)) {
      alert('Cảnh báo: Chỉ số Nước mới không được nhỏ hơn chỉ số cũ!');
      return;
    }

    try {
      const res = await fetch('/api/meter-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReading)
      });
      setShowAddModal(false);
      fetchReadings();
    } catch (err) {
      console.error(err);
      setShowAddModal(false);
    }
  };

  const handleExportExcel = () => {
    const data = filteredReadings.map((r, idx) => ({
      STT: idx + 1,
      'Phòng': r.room_number,
      'Tháng/Năm': `${r.billing_month}/${r.billing_year}`,
      'Điện cũ': r.electric_old,
      'Điện mới': r.electric_new,
      'Tiêu thụ Điện (kWh)': r.electric_usage,
      'Nước cũ': r.water_old,
      'Nước mới': r.water_new,
      'Tiêu thụ Nước (m3)': r.water_usage,
      'Ngày chốt': r.reading_date,
      'Trạng thái': r.is_billed ? 'Đã lập HĐ' : 'Chưa lập HĐ',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ChiSoDienNuoc');
    XLSX.writeFile(wb, `Chi_So_Dien_Nuoc_T${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <AppLayout title="Ghi nhận Chỉ số Điện & Nước" subtitle="Nhập chỉ số điện nước định kỳ, kiểm tra tiêu thụ và cảnh báo bất thường">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="text-amber-500 shrink-0" size={24} />
              <span>Chỉ số Điện & Nước</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Nhập chỉ số công tơ điện nước và phát hiện tiêu thụ bất thường
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
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} />
              Ghi chỉ số
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0">Kỳ chốt:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-blue-700 bg-slate-50"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-blue-700 bg-slate-50"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo số phòng (101, 102...)"
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
                  <th className="py-3 px-4 bg-amber-50/50 text-amber-900 text-center" colSpan={3}>
                    <div className="flex items-center justify-center gap-1">
                      <Zap size={14} className="text-amber-500" />
                      Điện (kWh)
                    </div>
                  </th>
                  <th className="py-3 px-4 bg-blue-50/50 text-blue-900 text-center" colSpan={3}>
                    <div className="flex items-center justify-center gap-1">
                      <Droplets size={14} className="text-blue-500" />
                      Nước (m³)
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Cảnh báo</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="py-1 px-3"></th>
                  <th className="py-1 px-4"></th>
                  <th className="py-1 px-2 text-right bg-amber-50/30">CS Cũ</th>
                  <th className="py-1 px-2 text-right bg-amber-50/30">CS Mới</th>
                  <th className="py-1 px-2 text-right font-bold text-amber-800 bg-amber-50/50">Tiêu thụ</th>
                  <th className="py-1 px-2 text-right bg-blue-50/30">CS Cũ</th>
                  <th className="py-1 px-2 text-right bg-blue-50/30">CS Mới</th>
                  <th className="py-1 px-2 text-right font-bold text-blue-800 bg-blue-50/50">Tiêu thụ</th>
                  <th className="py-1 px-4"></th>
                  <th className="py-1 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReadings.map((reading, index) => {
                  const abnormalElectric = reading.electric_usage > 300;
                  const abnormalWater = reading.water_usage > 25;
                  const isAbnormal = reading.is_abnormal_warning || abnormalElectric || abnormalWater;

                  return (
                    <tr key={reading.reading_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2.5 py-1 bg-slate-100 rounded text-xs border border-slate-200">
                          P.{reading.room_number}
                        </span>
                      </td>
                      {/* Điện */}
                      <td className="py-3 px-2 text-right font-mono text-slate-600">{reading.electric_old}</td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">{reading.electric_new}</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-amber-600 bg-amber-50/20">
                        {reading.electric_usage} kWh
                      </td>
                      {/* Nước */}
                      <td className="py-3 px-2 text-right font-mono text-slate-600">{reading.water_old}</td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">{reading.water_new}</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-blue-600 bg-blue-50/20">
                        {reading.water_usage} m³
                      </td>
                      {/* Cảnh báo */}
                      <td className="py-3 px-4 text-center">
                        {isAbnormal ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle size={12} />
                            Đột biến cao
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 size={12} />
                            Bình thường
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setEditingReading(reading);
                            setShowAddModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Sửa chỉ số"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredReadings.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Chưa có dữ liệu ghi số cho Tháng {selectedMonth}/{selectedYear}. Nhấn &quot;Ghi chỉ số&quot; để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Ghi chỉ số */}
        {showAddModal && editingReading && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 animate-in fade-in zoom-in-95 text-xs">
              <h3 className="text-base font-bold text-slate-900 border-b pb-3 mb-4">
                Nhập Chỉ Số Điện & Nước Định Kỳ
              </h3>

              <form onSubmit={handleSaveReading} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số phòng</label>
                    <input
                      type="text"
                      required
                      value={editingReading.room_number || ''}
                      onChange={(e) => setEditingReading({ ...editingReading, room_number: e.target.value })}
                      placeholder="VD: 101"
                      className="w-full px-3 py-2 border rounded-lg font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tháng</label>
                    <input
                      type="number"
                      value={editingReading.billing_month || selectedMonth}
                      onChange={(e) => setEditingReading({ ...editingReading, billing_month: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Năm</label>
                    <input
                      type="number"
                      value={editingReading.billing_year || selectedYear}
                      onChange={(e) => setEditingReading({ ...editingReading, billing_year: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Electric block */}
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                  <div className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <Zap size={15} className="text-amber-600" />
                    Chỉ số Điện (kWh)
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Chỉ số cũ</label>
                      <input
                        type="number"
                        value={editingReading.electric_old ?? 0}
                        onChange={(e) => {
                          const oldV = Number(e.target.value);
                          const newV = editingReading.electric_new || 0;
                          setEditingReading({
                            ...editingReading,
                            electric_old: oldV,
                            electric_usage: Math.max(0, newV - oldV),
                          });
                        }}
                        className="w-full px-2 py-1.5 border rounded font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Chỉ số mới</label>
                      <input
                        type="number"
                        value={editingReading.electric_new ?? 0}
                        onChange={(e) => {
                          const newV = Number(e.target.value);
                          const oldV = editingReading.electric_old || 0;
                          setEditingReading({
                            ...editingReading,
                            electric_new: newV,
                            electric_usage: Math.max(0, newV - oldV),
                          });
                        }}
                        className="w-full px-2 py-1.5 border rounded font-mono font-bold text-sm text-blue-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Sử dụng (kWh)</label>
                      <div className="px-2 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-amber-700 text-sm">
                        {editingReading.electric_usage ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Water block */}
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <Droplets size={15} className="text-blue-600" />
                    Chỉ số Nước (m³)
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Chỉ số cũ</label>
                      <input
                        type="number"
                        value={editingReading.water_old ?? 0}
                        onChange={(e) => {
                          const oldV = Number(e.target.value);
                          const newV = editingReading.water_new || 0;
                          setEditingReading({
                            ...editingReading,
                            water_old: oldV,
                            water_usage: Math.max(0, newV - oldV),
                          });
                        }}
                        className="w-full px-2 py-1.5 border rounded font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Chỉ số mới</label>
                      <input
                        type="number"
                        value={editingReading.water_new ?? 0}
                        onChange={(e) => {
                          const newV = Number(e.target.value);
                          const oldV = editingReading.water_old || 0;
                          setEditingReading({
                            ...editingReading,
                            water_new: newV,
                            water_usage: Math.max(0, newV - oldV),
                          });
                        }}
                        className="w-full px-2 py-1.5 border rounded font-mono font-bold text-sm text-blue-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Sử dụng (m³)</label>
                      <div className="px-2 py-1.5 bg-white border border-blue-300 rounded font-mono font-bold text-blue-700 text-sm">
                        {editingReading.water_usage ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
                  >
                    Lưu chỉ số
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
