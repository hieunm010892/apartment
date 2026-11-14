'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus, Search, Download, Calendar, Filter, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CashTransaction {
  id: number;
  transaction_code: string;
  transaction_type: string; // 'IN' (Thu) or 'OUT' (Chi)
  category: string;
  amount: number;
  payment_method: string;
  transaction_date: string;
  payer_receiver: string;
  description: string;
}

export default function CashbookPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState<Partial<CashTransaction>>({
    transaction_type: 'IN',
    category: 'Thu tiền phòng',
    amount: 5000000,
    payment_method: 'Transfer',
    transaction_date: new Date().toISOString().slice(0, 10),
    payer_receiver: 'Nguyễn Văn An',
    description: 'Thanh toán tiền trọ tháng 10/2026',
  });

  useEffect(() => {
    fetchCashbook();
  }, []);

  const fetchCashbook = async () => {
    try {
      const res = await fetch('/api/cashbook');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTx = transactions.filter(t => {
    const matchSearch =
      t.transaction_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payer_receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'ALL' || t.transaction_type === typeFilter;
    return matchSearch && matchType;
  });

  const totalIn = transactions.filter(t => t.transaction_type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.transaction_type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  const handleExportExcel = () => {
    const data = filteredTx.map((t, idx) => ({
      STT: idx + 1,
      'Mã phiếu': t.transaction_code,
      'Loại': t.transaction_type === 'IN' ? 'Thu' : 'Chi',
      'Khoản mục': t.category,
      'Số tiền (đ)': t.amount,
      'Hình thức': t.payment_method === 'Transfer' ? 'Chuyển khoản' : 'Tiền mặt',
      'Người nộp / nhận': t.payer_receiver,
      'Ngày GD': t.transaction_date,
      'Nội dung': t.description,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SoQuy');
    XLSX.writeFile(wb, `So_Quy_Thu_Chi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CashTransaction = {
      id: Date.now(),
      transaction_code: `PT${Date.now().toString().slice(-6)}`,
      transaction_type: newTx.transaction_type || 'IN',
      category: newTx.category || 'Thu tiền phòng',
      amount: Number(newTx.amount) || 0,
      payment_method: newTx.payment_method || 'Transfer',
      transaction_date: newTx.transaction_date || new Date().toISOString().slice(0, 10),
      payer_receiver: newTx.payer_receiver || '',
      description: newTx.description || '',
    };
    setTransactions([created, ...transactions]);
    setShowAddModal(false);
  };

  return (
    <AppLayout title="Sổ quỹ Thu - Chi" subtitle="Quản lý phiếu thu, phiếu chi và cân đối dòng tiền vận hành">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="text-emerald-600 shrink-0" size={24} />
              <span>Sổ quỹ Thu - Chi</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý phiếu thu, phiếu chi và cân đối tồn quỹ
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
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} />
              Tạo phiếu
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <ArrowDownLeft size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Tổng thu tháng 10/2026</p>
              <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
                {totalIn.toLocaleString('en-US')} đ
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Tổng chi tháng 10/2026</p>
              <p className="text-2xl font-extrabold text-rose-600 font-mono mt-0.5">
                {totalOut.toLocaleString('en-US')} đ
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Tồn quỹ hiện tại</p>
              <p className="text-2xl font-extrabold text-blue-700 font-mono mt-0.5">
                {balance.toLocaleString('en-US')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            {['ALL', 'IN', 'OUT'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'ALL' && 'Tất cả phiếu'}
                {t === 'IN' && 'Khoản Thu (+)'}
                {t === 'OUT' && 'Khoản Chi (-)'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, người nộp, lý do..."
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
                  <th className="py-3 px-4">Mã GD</th>
                  <th className="py-3 px-4 text-center">Loại phiếu</th>
                  <th className="py-3 px-4">Khoản mục</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-center">Hình thức</th>
                  <th className="py-3 px-4">Người nộp / nhận</th>
                  <th className="py-3 px-4">Ngày GD</th>
                  <th className="py-3 px-4">Nội dung diễn giải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{t.transaction_code}</td>
                    <td className="py-3 px-4 text-center">
                      {t.transaction_type === 'IN' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1">
                          <ArrowDownLeft size={12} /> Thu
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center gap-1">
                          <ArrowUpRight size={12} /> Chi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{t.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                      {t.transaction_type === 'IN' ? (
                        <span className="text-emerald-700">+{t.amount.toLocaleString('en-US')} đ</span>
                      ) : (
                        <span className="text-rose-600">-{t.amount.toLocaleString('en-US')} đ</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-medium">
                      {t.payment_method === 'Transfer' ? 'Chuyển khoản (VietQR)' : 'Tiền mặt'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{t.payer_receiver}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{t.transaction_date}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={t.description}>
                      {t.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm phiếu Thu/Chi */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 text-xs">
              <h3 className="text-base font-bold text-slate-900 border-b pb-3 mb-4">
                Tạo Phiếu Thu / Phiếu Chi Sổ Quỹ
              </h3>

              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Loại nghiệp vụ</label>
                    <select
                      value={newTx.transaction_type || 'IN'}
                      onChange={(e) => setNewTx({ ...newTx, transaction_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                    >
                      <option value="IN">Phiếu Thu (+)</option>
                      <option value="OUT">Phiếu Chi (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Khoản mục</label>
                    <input
                      type="text"
                      required
                      value={newTx.category || ''}
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                      placeholder="Tiền phòng, Sửa máy lạnh..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số tiền (đ) *</label>
                    <input
                      type="number"
                      step={10000}
                      required
                      value={newTx.amount || 0}
                      onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-sm text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hình thức</label>
                    <select
                      value={newTx.payment_method || 'Transfer'}
                      onChange={(e) => setNewTx({ ...newTx, payment_method: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="Transfer">Chuyển khoản</option>
                      <option value="Cash">Tiền mặt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Người nộp / nhận</label>
                  <input
                    type="text"
                    required
                    value={newTx.payer_receiver || ''}
                    onChange={(e) => setNewTx({ ...newTx, payer_receiver: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nội dung chi tiết</label>
                  <input
                    type="text"
                    value={newTx.description || ''}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
                  >
                    Ghi sổ quỹ
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

