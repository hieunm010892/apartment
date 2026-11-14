'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { FileText, Plus, Search, Download, Printer, CheckCircle2, Clock, AlertCircle, Eye, LogOut, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Contract {
  id: number;
  contract_number: string;
  room_code: string;
  tenant_name: string;
  tenant_phone: string;
  start_date: string;
  end_date: string;
  rental_price: number;
  deposit_amount: number;
  billing_cycle: number;
  status: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    deduction_reason: 'Khấu trừ tiền điện nước cuối kỳ',
    deduction_amount: 350000,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setContracts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchSearch =
      c.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tenant_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportExcel = () => {
    const data = filteredContracts.map((c, idx) => ({
      STT: idx + 1,
      'Số hợp đồng': c.contract_number,
      'Phòng': c.room_code,
      'Khách đại diện': c.tenant_name,
      'Điện thoại': c.tenant_phone,
      'Ngày bắt đầu': c.start_date,
      'Ngày kết thúc': c.end_date,
      'Giá thuê (đ/tháng)': c.rental_price,
      'Tiền cọc (đ)': c.deposit_amount,
      'Trạng thái': c.status === 'Active' ? 'Đang hiệu lực' : 'Đã thanh lý',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HopDongThue');
    XLSX.writeFile(wb, `Danh_Sach_Hop_Dong_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleConfirmCheckout = () => {
    alert(`Đã hoàn tất thủ tục Check-out & Thanh lý hợp đồng cho phòng ${selectedContract?.room_code}. Tiền hoàn cọc: ${(selectedContract?.deposit_amount || 0) - checkoutData.deduction_amount} đ.`);
    setShowCheckoutModal(false);
  };

  return (
    <AppLayout title="Quản lý Hợp đồng Thuê" subtitle="Theo dõi thời hạn hợp đồng, tiền cọc bảo đảm và thanh lý trả phòng">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-indigo-600 shrink-0" size={24} />
              <span>Hợp đồng & Check-in / Out</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thời hạn hợp đồng, tiền cọc giữ chỗ và thanh lý trả phòng
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
              onClick={() => alert('Chức năng lập hợp đồng mới')}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} />
              Tạo HĐ mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1">
            {['ALL', 'Active', 'Expiring', 'Terminated'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' && 'Tất cả'}
                {st === 'Active' && 'Đang hiệu lực'}
                {st === 'Expiring' && 'Sắp hết hạn (30 ngày)'}
                {st === 'Terminated' && 'Đã thanh lý'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Tìm theo số HĐ, tên khách, số phòng..."
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
                  <th className="py-3 px-4">Số Hợp đồng</th>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Khách đại diện</th>
                  <th className="py-3 px-4">Thời hạn HĐ</th>
                  <th className="py-3 px-4 text-right">Giá thuê/tháng</th>
                  <th className="py-3 px-4 text-right">Tiền cọc giữ chỗ</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.contract_number}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-xs">
                        P.{c.room_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.tenant_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.tenant_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.start_date} <span className="text-slate-400">→</span> {c.end_date}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {c.rental_price.toLocaleString('en-US')} đ
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                      {c.deposit_amount.toLocaleString('en-US')} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} />
                        Đang hiệu lực
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedContract(c);
                            setShowCheckoutModal(true);
                          }}
                          className="px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded border border-rose-200 transition flex items-center gap-1"
                          title="Quy trình trả phòng & Hoàn cọc"
                        >
                          <LogOut size={13} />
                          Check-out
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Check-out & Hoàn cọc */}
        {showCheckoutModal && selectedContract && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 text-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LogOut size={18} className="text-rose-600" />
                  Quy trình Thanh lý Hợp đồng & Check-out (P.{selectedContract.room_code})
                </h3>
                <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Khách thuê đại diện:</span>
                    <span className="font-bold text-slate-900">{selectedContract.tenant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tiền cọc ban đầu:</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      {selectedContract.deposit_amount.toLocaleString('en-US')} đ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số tiền khấu trừ (Điện/Nước cuối, sửa chữa hư hỏng):</label>
                  <input
                    type="number"
                    value={checkoutData.deduction_amount}
                    onChange={(e) => setCheckoutData({ ...checkoutData, deduction_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-rose-600 text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lý do khấu trừ:</label>
                  <input
                    type="text"
                    value={checkoutData.deduction_reason}
                    onChange={(e) => setCheckoutData({ ...checkoutData, deduction_reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Số tiền cọc thực trả lại khách:</span>
                  <span className="font-bold font-mono text-lg text-emerald-700">
                    {Math.max(0, selectedContract.deposit_amount - checkoutData.deduction_amount).toLocaleString('en-US')} đ
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmCheckout}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow"
                  >
                    Xác nhận trả phòng & Trả cọc
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

