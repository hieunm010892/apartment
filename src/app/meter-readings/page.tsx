'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Zap, Droplets, AlertTriangle, CheckCircle2, Download, Plus, Save, Trash2, Edit3, Calculator, Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MeterReading {
  id: number;
  room_id: number;
  room_code: string;
  reading_month: number;
  reading_year: number;
  old_electric: number;
  new_electric: number;
  electric_usage: number;
  old_water: number;
  new_water: number;
  water_usage: number;
  reading_date: string;
  is_billed?: boolean;
}

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReading, setEditingReading] = useState<Partial<MeterReading> | null>(null);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const res = await fetch('/api/meter-readings');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReadings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReadings = readings.filter(r => {
    const matchMonth = r.reading_month === selectedMonth && r.reading_year === selectedYear;
    const matchSearch = r.room_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchMonth && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingReading({
      room_code: '101',
      reading_month: selectedMonth,
      reading_year: selectedYear,
      old_electric: 120,
      new_electric: 120,
      electric_usage: 0,
      old_water: 15,
      new_water: 15,
      water_usage: 0,
      reading_date: new Date().toISOString().slice(0, 10),
    });
    setShowAddModal(true);
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReading) return;

    // Check logic
    if ((editingReading.new_electric || 0) < (editingReading.old_electric || 0)) {
      alert('Cảnh báo: Chỉ số Điện mới không được nhỏ hơn chỉ số cũ!');
      return;
    }
    if ((editingReading.new_water || 0) < (editingReading.old_water || 0)) {
      alert('Cảnh báo: Chỉ số Nước mới không được nhỏ hơn chỉ số cũ!');
      return;
    }

    try {
      const res = await fetch('/api/meter-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReading)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchReadings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const data = filteredReadings.map((r, idx) => ({
      STT: idx + 1,
      'Phòng': r.room_code,
      'Tháng/Năm': `${r.reading_month}/${r.reading_year}`,
      'Điện cũ': r.old_electric,
      'Điện mới': r.new_electric,
      'Tiêu thụ Điện (kWh)': r.electric_usage,
      'Nước cũ': r.old_water,
      'Nước mới': r.new_water,
      'Tiêu thụ Nước (m3)': r.water_usage,
      'Ngày chốt': r.reading_date,
      'Trạng thái tính tiền': r.is_billed ? 'Đã lập HĐ' : 'Chưa lập HĐ',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ChiSoDienNuoc');
    XLSX.writeFile(wb, `Chi_So_Dien_Nuoc_T${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="text-amber-500" size={26} />
              Ghi nhận Chỉ số Điện & Nước Hàng Tháng
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Nhập và kiểm tra chỉ số công tơ điện, đồng hồ nước, tự động tính sản lượng tiêu thụ và phát hiện cảnh báo bất thường
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
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              <Plus size={16} />
              Ghi chỉ số mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Kỳ chốt số:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-blue-700 bg-slate-50"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-blue-700 bg-slate-50"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
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
                      Chỉ số Điện (kWh)
                    </div>
                  </th>
                  <th className="py-3 px-4 bg-blue-50/50 text-blue-900 text-center" colSpan={3}>
                    <div className="flex items-center justify-center gap-1">
                      <Droplets size={14} className="text-blue-500" />
                      Chỉ số Nước (m³)
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
                  const isAbnormal = abnormalElectric || abnormalWater;

                  return (
                    <tr key={reading.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2.5 py-1 bg-slate-100 rounded text-xs border border-slate-200">
                          {reading.room_code}
                        </span>
                      </td>
                      {/* Điện */}
                      <td className="py-3 px-2 text-right font-mono text-slate-600">{reading.old_electric}</td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">{reading.new_electric}</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-amber-600 bg-amber-50/20">
                        {reading.electric_usage} kWh
                      </td>
                      {/* Nước */}
                      <td className="py-3 px-2 text-right font-mono text-slate-600">{reading.old_water}</td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">{reading.new_water}</td>
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
                        <div className="flex items-center justify-center gap-1">
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredReadings.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Chưa có dữ liệu ghi số cho Tháng {selectedMonth}/{selectedYear}. Nhấn &quot;Ghi chỉ số mới&quot; để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Ghi chỉ số */}
        {showAddModal && editingReading && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4">
                Nhập Chỉ Số Điện & Nước Định Kỳ
              </h3>

              <form onSubmit={handleSaveReading} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số phòng</label>
                    <input
                      type="text"
                      required
                      value={editingReading.room_code || ''}
                      onChange={(e) => setEditingReading({ ...editingReading, room_code: e.target.value })}
                      placeholder="VD: 101"
                      className="w-full px-3 py-2 border rounded-lg font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tháng</label>
                    <input
                      type="number"
                      value={editingReading.reading_month || selectedMonth}
                      onChange={(e) => setEditingReading({ ...editingReading, reading_month: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Năm</label>
                    <input
                      type="number"
                      value={editingReading.reading_year || selectedYear}
                      onChange={(e) => setEditingReading({ ...editingReading, reading_year: Number(e.target.value) })}
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
                        value={editingReading.old_electric ?? 0}
                        onChange={(e) => {
                          const oldV = Number(e.target.value);
                          const newV = editingReading.new_electric || 0;
                          setEditingReading({
                            ...editingReading,
                            old_electric: oldV,
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
                        value={editingReading.new_electric ?? 0}
                        onChange={(e) => {
                          const newV = Number(e.target.value);
                          const oldV = editingReading.old_electric || 0;
                          setEditingReading({
                            ...editingReading,
                            new_electric: newV,
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
                        value={editingReading.old_water ?? 0}
                        onChange={(e) => {
                          const oldV = Number(e.target.value);
                          const newV = editingReading.new_water || 0;
                          setEditingReading({
                            ...editingReading,
                            old_water: oldV,
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
                        value={editingReading.new_water ?? 0}
                        onChange={(e) => {
                          const newV = Number(e.target.value);
                          const oldV = editingReading.old_water || 0;
                          setEditingReading({
                            ...editingReading,
                            new_water: newV,
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
