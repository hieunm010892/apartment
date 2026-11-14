'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Invoice, InvoiceDetail } from '@/lib/types';
import VietQrCanvas from '@/components/VietQrCanvas';
import {
  Receipt, Plus, Printer, FileDown, Send, CheckCircle2,
  AlertCircle, X, Search, DollarSign, Calendar, Eye, Share2,
  Edit3, Trash2, Save
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<number>(10);
  const [year, setYear] = useState<number>(2026);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<number>(1);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Invoice Edit & Create Modal
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Invoice> | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [month, year]);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (Array.isArray(data)) {
          setServiceList(data);
          if (data.length > 0) setSelectedServiceId(data[0].service_id || data[0].id);
        }
      } catch (err) {
        console.error('Error loading services:', err);
      }
    }
    loadServices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices?month=${month}&year=${year}`);
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading invoices:', e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPreviewModal(true);
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.remaining_amount);
    setShowPaymentModal(true);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.invoice_id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod: paymentMethod,
          notes: paymentNotes
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPaymentModal(false);
        loadInvoices();
        alert('Ghi nhận thanh toán thành công!');
      }
    } catch (e) {
      alert('Lỗi ghi nhận thanh toán');
    }
  };

  // Helper calculation for live edit totals
  const getEditTotals = (details?: InvoiceDetail[], paid: number = 0) => {
    let room = 0, elec = 0, water = 0, svc = 0, discount = 0, other = 0;
    for (const d of details || []) {
      const amt = Number(d.amount) || 0;
      const type = (d.item_type || 'SERVICE').toUpperCase();
      if (type === 'ROOM') room += amt;
      else if (type === 'ELECTRIC') elec += amt;
      else if (type === 'WATER') water += amt;
      else if (type === 'SERVICE') {
        if (amt < 0) discount += Math.abs(amt);
        else svc += amt;
      } else if (type === 'DISCOUNT' || amt < 0) {
        discount += Math.abs(amt);
      } else {
        other += amt;
      }
    }
    const gross = room + elec + water + svc + other;
    const total = Math.max(0, gross - discount);
    const remaining = Math.max(0, total - (paid || 0));
    return { gross, room, elec, water, svc, discount, other, total, remaining };
  };

  const handleOpenEdit = (inv: Invoice) => {
    const clonedDetails: InvoiceDetail[] = (inv.details || []).map(d => ({ ...d }));
    setEditForm({
      ...inv,
      details: clonedDetails,
    });
    if (serviceList.length > 0) {
      setSelectedServiceId(serviceList[0].service_id || serviceList[0].id);
    }
    setShowEditModal(true);
  };

  const handleOpenNewInvoice = () => {
    const defaultDetails: InvoiceDetail[] = [
      {
        invoice_detail_id: 1,
        invoice_id: 0,
        item_type: 'ROOM',
        item_name: `Tiền thuê phòng 101 (Tháng ${month}/${year})`,
        quantity: 1,
        unit_name: 'Tháng',
        unit_price: 3000000,
        amount: 3000000,
      },
      {
        invoice_detail_id: 2,
        invoice_id: 0,
        item_type: 'ELECTRIC',
        item_name: 'Tiền điện',
        old_index: 100,
        new_index: 150,
        quantity: 50,
        unit_name: 'kWh',
        unit_price: 3500,
        amount: 175000,
      },
      {
        invoice_detail_id: 3,
        invoice_id: 0,
        item_type: 'WATER',
        item_name: 'Tiền nước',
        old_index: 10,
        new_index: 15,
        quantity: 5,
        unit_name: 'm3',
        unit_price: 18000,
        amount: 90000,
      },
    ];

    setEditForm({
      invoice_id: 0,
      invoice_code: `HD${year}${String(month).padStart(2, '0')}-101`,
      room_number: '101',
      tenant_name: 'Khách thuê mới',
      tenant_phone: '0903123456',
      billing_month: month,
      billing_year: year,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      notes: 'Thanh toán đúng hạn qua VietQR',
      paid_amount: 0,
      details: defaultDetails,
    });
    if (serviceList.length > 0) {
      setSelectedServiceId(serviceList[0].service_id || serviceList[0].id);
    }
    setShowEditModal(true);
  };

  const handleAddSelectedService = () => {
    if (!editForm || !selectedServiceId) return;
    const svc = serviceList.find(s => (s.service_id || s.id) === Number(selectedServiceId));
    if (!svc) return;

    const isDiscount = svc.pricing_type === 4 || (svc.default_unit_price !== undefined && svc.default_unit_price < 0) || (svc.unit_price !== undefined && svc.unit_price < 0) || svc.service_code === 'DISCOUNT';
    const rawPrice = svc.default_unit_price !== undefined ? Number(svc.default_unit_price) : (Number(svc.unit_price) || 0);
    const signedPrice = isDiscount ? -Math.abs(rawPrice) : rawPrice;
    const itemType = isDiscount ? 'DISCOUNT' : svc.service_code === 'ELECTRIC' ? 'ELECTRIC' : svc.service_code === 'WATER' ? 'WATER' : 'SERVICE';
    const itemName = isDiscount && !svc.service_name.startsWith('Giảm') ? `Giảm trừ: ${svc.service_name}` : svc.service_name;

    const newLine: InvoiceDetail = {
      invoice_detail_id: Date.now(),
      invoice_id: editForm.invoice_id || 0,
      service_id: svc.service_id || svc.id,
      item_type: itemType,
      item_name: itemName,
      quantity: 1,
      unit_name: svc.unit_name || 'Lần',
      unit_price: signedPrice,
      amount: signedPrice,
      notes: '',
    };

    setEditForm(prev => prev ? ({
      ...prev,
      details: [...(prev.details || []), newLine],
    }) : null);
  };

  const handleAddCustomLine = () => {
    if (!editForm) return;
    const newLine: InvoiceDetail = {
      invoice_detail_id: Date.now(),
      invoice_id: editForm.invoice_id || 0,
      item_type: 'SERVICE',
      item_name: 'Phí dịch vụ phát sinh',
      quantity: 1,
      unit_name: 'Lần',
      unit_price: 100000,
      amount: 100000,
      notes: '',
    };

    setEditForm(prev => prev ? ({
      ...prev,
      details: [...(prev.details || []), newLine],
    }) : null);
  };

  const handleRemoveDetailLine = (index: number) => {
    if (!editForm) return;
    const newDetails = [...(editForm.details || [])];
    newDetails.splice(index, 1);
    setEditForm({ ...editForm, details: newDetails });
  };

  const handleDetailFieldChange = (index: number, field: string, value: any) => {
    if (!editForm || !editForm.details) return;
    const newDetails = [...editForm.details];
    const row = { ...newDetails[index], [field]: value };

    // Auto calculate quantity from meter readings
    if (field === 'old_index' || field === 'new_index') {
      const oldVal = field === 'old_index' ? Number(value) : Number(row.old_index || 0);
      const newVal = field === 'new_index' ? Number(value) : Number(row.new_index || 0);
      if (newVal >= oldVal) {
        row.quantity = newVal - oldVal;
      }
    }

    // Auto calculate signed price for DISCOUNT
    if (field === 'item_type' && value === 'DISCOUNT' && row.unit_price > 0) {
      row.unit_price = -row.unit_price;
    }

    // Auto calculate amount
    const qty = Number(row.quantity) || 0;
    let price = Number(row.unit_price) || 0;
    if (row.item_type === 'DISCOUNT' && price > 0) {
      price = -price;
      row.unit_price = price;
    }
    row.amount = Math.round(qty * price);

    newDetails[index] = row;
    setEditForm({ ...editForm, details: newDetails });
  };

  const handleSaveInvoiceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      setSavingEdit(true);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        await loadInvoices();
        alert('Đã lưu điều chỉnh thông tin hóa đơn thành công!');
      } else {
        alert(data.message || 'Lỗi khi lưu hóa đơn');
      }
    } catch (err: any) {
      alert('Lỗi kết nối khi lưu hóa đơn: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const exportData = invoices.map((inv, idx) => ({
      STT: idx + 1,
      'Mã HĐ': inv.invoice_code,
      'Phòng': inv.room_number,
      'Khách thuê': inv.tenant_name,
      'Kỳ': `${inv.billing_month}/${inv.billing_year}`,
      'Tiền phòng': inv.room_amount,
      'Tiền điện': inv.electric_amount,
      'Tiền nước': inv.water_amount,
      'Dịch vụ': inv.service_amount,
      'Giảm trừ': inv.discount_amount,
      'Tổng cộng sau giảm trừ': inv.total_amount,
      'Đã thanh toán': inv.paid_amount,
      'Còn lại cần thanh toán': inv.remaining_amount,
      'Trạng thái': inv.status_text,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HoaDon');
    XLSX.writeFile(wb, `DanhSachHoaDon_${month}_${year}.xlsx`);
  };

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter(inv => {
    const s = (search || '').toLowerCase();
    return (
      (inv.invoice_code || '').toLowerCase().includes(s) ||
      (inv.room_number || '').toLowerCase().includes(s) ||
      (inv.tenant_name || '').toLowerCase().includes(s)
    );
  });

  // Meter text helper
  const getMeterText = (inv: Invoice) => {
    if (!inv) return '';
    const details = Array.isArray(inv.details) ? inv.details : [];
    const elec = details.find(d => d.item_type === 'ELECTRIC');
    const water = details.find(d => d.item_type === 'WATER');
    const eText = elec
      ? `Chỉ số Điện: Cũ ${(elec.old_index || 0).toLocaleString('vi-VN')} → Mới ${(elec.new_index || 0).toLocaleString('vi-VN')} (${elec.quantity || 0} ${elec.unit_name || 'kWh'})`
      : 'Chỉ số Điện: Chưa ghi';
    const wText = water
      ? `Chỉ số Nước: Cũ ${(water.old_index || 0).toLocaleString('vi-VN')} → Mới ${(water.new_index || 0).toLocaleString('vi-VN')} (${water.quantity || 0} ${water.unit_name || 'm3'})`
      : 'Chỉ số Nước: Chưa ghi';
    return `${eText}     |     ${wText}`;
  };

  const getGrossSubtotal = (inv: Invoice) => {
    if (!inv) return 0;
    const raw = (inv.room_amount || 0) + (inv.electric_amount || 0) + (inv.water_amount || 0) + (inv.service_amount || 0) + (inv.other_amount || 0);
    if (raw > 0) return raw;
    return (inv.total_amount || 0) + (inv.discount_amount || 0);
  };

  return (
    <AppLayout title="Quản lý Hóa đơn & Thu tiền" subtitle="Phát hành hóa đơn định kỳ, xuất PDF/In A4, thanh toán VietQR">
      {/* Top Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Kỳ:</span>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none ml-1"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo phòng, tên khách, mã HĐ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white w-full focus:outline-none focus:border-brand-600 shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export Excel
          </button>
          <button
            onClick={handleOpenNewInvoice}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Lập Hóa đơn mới
          </button>
        </div>
      </div>

      {/* Invoice Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-800 font-bold">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-3">Mã Hóa đơn</th>
                <th className="py-3 px-3">Phòng</th>
                <th className="py-3 px-3">Khách thuê</th>
                <th className="py-3 px-3 text-right">Tổng cộng</th>
                <th className="py-3 px-3 text-right">Giảm trừ</th>
                <th className="py-3 px-3 text-right">Tổng sau giảm trừ</th>
                <th className="py-3 px-3 text-right">Đã thanh toán</th>
                <th className="py-3 px-3 text-right">Còn lại cần TT</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((inv, idx) => {
                const gross = getGrossSubtotal(inv);
                return (
                  <tr key={inv.invoice_id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 text-center font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#1E3A8A]">{inv.invoice_code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">Phòng {inv.room_number}</td>
                    <td className="py-3 px-3 text-slate-700">{inv.tenant_name}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-600">{(gross || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      {(inv.discount_amount || 0) > 0 ? `-${(inv.discount_amount || 0).toLocaleString('vi-VN')} đ` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{(inv.total_amount || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">{(inv.paid_amount || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600">{(inv.remaining_amount || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 2
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 1
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.status_text}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenPreview(inv)}
                        className="inline-flex items-center gap-1 py-1 px-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                        title="Xem chi tiết & In"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem/In
                      </button>
                      <button
                        onClick={() => handleOpenEdit(inv)}
                        className="inline-flex items-center gap-1 py-1 px-2 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold"
                        title="Điều chỉnh thông tin hóa đơn"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Điều chỉnh
                      </button>
                      {inv.remaining_amount > 0 && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="inline-flex items-center gap-1 py-1 px-2 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                          title="Thu tiền"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Thu
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CHI TIẾT HÓA ĐƠN & IN PHIẾU BÁO TIỀN */}
      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Header Modal Bar */}
            <div className="bg-[#1E3A8A] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between no-print shrink-0">
              <div className="overflow-hidden">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                  Chi tiết Hóa đơn {selectedInvoice.invoice_code} - P.{selectedInvoice.room_number}
                </h3>
                <p className="text-[11px] text-blue-200 truncate">Xem trước phiếu báo tiền, mã VietQR và in ấn chuẩn A4</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg transition-colors shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Content Container */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 print:p-0 print:overflow-visible">
              {/* Report Header */}
              <div className="text-center pb-2 border-b border-slate-200">
                <h2 className="text-base sm:text-lg font-bold text-[#1E3A8A] uppercase">PHIẾU BÁO TIỀN PHÒNG & DỊCH VỤ</h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {selectedInvoice.building_name} | Kỳ: {selectedInvoice.billing_month}/{selectedInvoice.billing_year} | Mã HĐ: {selectedInvoice.invoice_code}
                </p>
              </div>

              {/* Room & Tenant Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold">Phòng:</span> {selectedInvoice.room_number} -{' '}
                  <span className="font-semibold">Khách thuê:</span> {selectedInvoice.tenant_name} ({selectedInvoice.tenant_phone})
                </div>
                <div className="sm:text-right">
                  <span className="font-semibold">Ngày lập:</span> {selectedInvoice.issue_date} -{' '}
                  <span className="font-semibold">Hạn đóng:</span> {selectedInvoice.due_date}
                </div>
              </div>

              {/* BANNER CHỈ SỐ ĐIỆN NƯỚC (Theo yêu cầu) */}
              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs font-bold text-[#1E3A8A] flex items-center gap-2">
                <Receipt className="h-4 w-4 shrink-0 text-blue-700" />
                <span className="break-words leading-relaxed">{getMeterText(selectedInvoice)}</span>
              </div>

              {/* Grid Items Table (Without CS Cu / CS Moi as requested) */}
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-3">Khoản thu</th>
                      <th className="py-2.5 px-3 text-right">SL / Tiêu thụ</th>
                      <th className="py-2.5 px-3 text-center">ĐVT</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.details?.map((d, index) => (
                      <tr key={d.invoice_detail_id || index}>
                        <td className="py-2 px-3 text-center font-medium text-slate-500">{index + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{d.item_name}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{(d.quantity || 0).toLocaleString('vi-VN')}</td>
                        <td className="py-2 px-3 text-center text-slate-600">{d.unit_name}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{(d.unit_price || 0).toLocaleString('vi-VN')}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${(d.amount || 0) < 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {(d.amount || 0).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Totals & VietQR Transfer Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                {/* Left: VietQR box with 0501000080131 */}
                <div className="w-full max-w-sm">
                  <VietQrCanvas
                    payload={selectedInvoice.viet_qr_content || ''}
                    bankName={selectedInvoice.bank_name || 'Vietcombank - PGD An Lạc'}
                    accountNo={selectedInvoice.bank_account_no || '0501000080131'}
                    accountName={selectedInvoice.bank_account_name || 'TRAN THI MY HANH'}
                    amount={selectedInvoice.remaining_amount > 0 ? selectedInvoice.remaining_amount : selectedInvoice.total_amount}
                    content={`P${selectedInvoice.room_number} T${selectedInvoice.billing_month}/${selectedInvoice.billing_year}`}
                  />
                </div>

                {/* Right: 4 DÒNG TỔNG CHUẨN (Theo yêu cầu) */}
                <div className="space-y-2 text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-600 flex justify-between">
                    <span>Tổng cộng:</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {(getGrossSubtotal(selectedInvoice) || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  <div className="text-xs text-rose-700 flex justify-between items-baseline pt-1 border-t border-slate-200">
                    <div>
                      <span className="font-bold">Tổng cộng sau giảm trừ:</span>
                      {(selectedInvoice.discount_amount || 0) > 0 && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          (Giảm trừ: -{(selectedInvoice.discount_amount || 0).toLocaleString('vi-VN')} VNĐ)
                        </p>
                      )}
                    </div>
                    <span className="text-base font-bold text-rose-700">
                      {(selectedInvoice.total_amount || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex justify-between pt-1 border-t border-slate-200">
                    <span>Đã thanh toán:</span>
                    <span className="font-medium text-slate-800 text-sm">
                      {(selectedInvoice.paid_amount || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  <div className="text-xs text-[#1E3A8A] flex justify-between items-center pt-2 border-t-2 border-slate-300">
                    <span className="font-bold text-sm">Còn lại cần thanh toán:</span>
                    <span className="text-lg font-extrabold text-[#1E3A8A]">
                      {(selectedInvoice.remaining_amount || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-2">
                    Ghi chú: {selectedInvoice.notes || 'Vui lòng quét VietQR hoặc thanh toán trước ngày hết hạn.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-100 px-4 sm:px-6 py-3 border-t border-slate-200 flex justify-between items-center no-print shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>In Phiếu Báo Tiền (A4)</span>
                </button>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THU TIỀN */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-700 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Ghi nhận thu tiền - Phòng {selectedInvoice.room_number}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitPayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Mã Hóa đơn</label>
                <input
                  type="text"
                  disabled
                  value={selectedInvoice.invoice_code}
                  className="w-full rounded bg-slate-100 border border-slate-200 p-2 font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Số tiền thanh toán (*)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  max={selectedInvoice.remaining_amount}
                  required
                  className="w-full rounded border border-slate-300 p-2 text-sm font-bold text-emerald-700 focus:outline-none focus:border-brand-600"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tối đa: {selectedInvoice.remaining_amount.toLocaleString('vi-VN')} đ
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phương thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(parseInt(e.target.value))}
                  className="w-full rounded border border-slate-300 p-2 text-xs font-semibold text-slate-800"
                >
                  <option value={1}>Chuyển khoản ngân hàng (VietQR)</option>
                  <option value={0}>Tiền mặt</option>
                  <option value={2}>Ví điện tử</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ghi chú giao dịch</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú phiếu thu..."
                  className="w-full rounded border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold shadow"
                >
                  Xác nhận Thu tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ĐIỀU CHỈNH / TẠO MỚI HÓA ĐƠN */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl max-h-[96vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Header Modal Bar */}
            <div className="bg-[#1E3A8A] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between no-print shrink-0">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-amber-300" />
                  <span>
                    {editForm.invoice_id ? `Điều chỉnh Hóa đơn ${editForm.invoice_code || ''} - P.${editForm.room_number || ''}` : 'Lập Hóa đơn tiền nhà mới / Tùy chỉnh'}
                  </span>
                </h3>
                <p className="text-[11px] text-blue-200">
                  Cấu hình các hạng mục tiền phòng, chỉ số điện nước, phí dịch vụ phát sinh và các khoản giảm trừ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg transition-colors shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInvoiceEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* General Information Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Receipt className="h-3.5 w-3.5 text-blue-600" />
                  <span>Thông tin chung Hóa đơn</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mã Hóa đơn</label>
                    <input
                      type="text"
                      disabled={!!editForm.invoice_id}
                      value={editForm.invoice_code || ''}
                      onChange={(e) => setEditForm({ ...editForm, invoice_code: e.target.value })}
                      placeholder="HD-202610-101"
                      className="w-full rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Số phòng (*)</label>
                    <input
                      type="text"
                      required
                      value={editForm.room_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
                      placeholder="101"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tên khách thuê (*)</label>
                    <input
                      type="text"
                      required
                      value={editForm.tenant_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, tenant_name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={editForm.tenant_phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, tenant_phone: e.target.value })}
                      placeholder="0903123456"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kỳ thanh toán</label>
                    <div className="flex gap-1.5">
                      <select
                        value={editForm.billing_month || month}
                        onChange={(e) => setEditForm({ ...editForm, billing_month: parseInt(e.target.value) })}
                        className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                        ))}
                      </select>
                      <select
                        value={editForm.billing_year || year}
                        onChange={(e) => setEditForm({ ...editForm, billing_year: parseInt(e.target.value) })}
                        className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold"
                      >
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Ngày lập (*)</label>
                    <input
                      type="date"
                      required
                      value={editForm.issue_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, issue_date: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Hạn thanh toán (*)</label>
                    <input
                      type="date"
                      required
                      value={editForm.due_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Ghi chú hóa đơn</label>
                    <input
                      type="text"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Ghi chú thêm..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Service Line Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700 whitespace-nowrap">Thư viện dịch vụ:</span>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : '')}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold max-w-xs focus:ring-1 focus:ring-blue-500"
                  >
                    {serviceList.map((s) => {
                      const id = s.service_id || s.id;
                      const price = s.default_unit_price !== undefined ? Number(s.default_unit_price) : (Number(s.unit_price) || 0);
                      return (
                        <option key={id} value={id}>
                          {s.service_name} ({price.toLocaleString('vi-VN')} đ/{s.unit_name})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSelectedService}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + Thêm dịch vụ đã chọn
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomLine}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold transition shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Thêm khoản tự do
                </button>
              </div>

              {/* Editable Detail Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-2.5 text-center w-10">STT</th>
                        <th className="py-2.5 px-3 w-28">Loại mục</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Nội dung / Khoản mục</th>
                        <th className="py-2.5 px-2 text-center w-20">CS Cũ</th>
                        <th className="py-2.5 px-2 text-center w-20">CS Mới</th>
                        <th className="py-2.5 px-2 text-right w-20">SL / Tiêu thụ</th>
                        <th className="py-2.5 px-2 text-center w-16">ĐVT</th>
                        <th className="py-2.5 px-3 text-right w-28">Đơn giá (đ)</th>
                        <th className="py-2.5 px-3 text-right w-32">Thành tiền (đ)</th>
                        <th className="py-2.5 px-2 text-center w-12">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(editForm.details || []).map((row, idx) => {
                        const isMeter = row.item_type === 'ELECTRIC' || row.item_type === 'WATER';
                        const isDiscount = row.item_type === 'DISCOUNT' || row.amount < 0;

                        return (
                          <tr key={row.invoice_detail_id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-2 text-center text-slate-400 font-medium">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <select
                                value={row.item_type || 'SERVICE'}
                                onChange={(e) => handleDetailFieldChange(idx, 'item_type', e.target.value)}
                                className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs font-semibold bg-white"
                              >
                                <option value="ROOM">Tiền phòng</option>
                                <option value="ELECTRIC">Tiền điện</option>
                                <option value="WATER">Tiền nước</option>
                                <option value="SERVICE">Dịch vụ</option>
                                <option value="DISCOUNT">Giảm trừ</option>
                                <option value="OTHER">Khác</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.item_name || ''}
                                onChange={(e) => handleDetailFieldChange(idx, 'item_name', e.target.value)}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              {isMeter ? (
                                <input
                                  type="number"
                                  value={row.old_index ?? ''}
                                  onChange={(e) => handleDetailFieldChange(idx, 'old_index', e.target.value)}
                                  className="w-16 border border-slate-300 rounded px-1 py-1 text-xs text-center font-mono"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {isMeter ? (
                                <input
                                  type="number"
                                  value={row.new_index ?? ''}
                                  onChange={(e) => handleDetailFieldChange(idx, 'new_index', e.target.value)}
                                  className="w-16 border border-slate-300 rounded px-1 py-1 text-xs text-center font-mono"
                                  placeholder="0"
                                />
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                value={row.quantity ?? 1}
                                onChange={(e) => handleDetailFieldChange(idx, 'quantity', e.target.value)}
                                className="w-16 border border-slate-300 rounded px-1 py-1 text-xs text-right font-mono font-bold"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="text"
                                value={row.unit_name || ''}
                                onChange={(e) => handleDetailFieldChange(idx, 'unit_name', e.target.value)}
                                className="w-14 border border-slate-300 rounded px-1 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                value={row.unit_price ?? 0}
                                onChange={(e) => handleDetailFieldChange(idx, 'unit_price', e.target.value)}
                                className="w-24 border border-slate-300 rounded px-1.5 py-1 text-xs text-right font-mono font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              <span className={isDiscount ? 'text-emerald-700' : 'text-slate-900'}>
                                {(row.amount || 0).toLocaleString('vi-VN')} đ
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDetailLine(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Xóa dòng này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!editForm.details || editForm.details.length === 0) && (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                            Chưa có hạng mục nào. Bấm nút "+ Thêm dịch vụ đã chọn" để thêm khoản thu hoặc giảm trừ.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-time 4 Totals Box */}
              {(() => {
                const totals = getEditTotals(editForm.details, editForm.paid_amount || 0);
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>
                        Tiền phòng: <strong className="text-slate-800">{totals.room.toLocaleString('vi-VN')} đ</strong> |{' '}
                        Điện: <strong className="text-slate-800">{totals.elec.toLocaleString('vi-VN')} đ</strong> |{' '}
                        Nước: <strong className="text-slate-800">{totals.water.toLocaleString('vi-VN')} đ</strong> |{' '}
                        Dịch vụ: <strong className="text-slate-800">{totals.svc.toLocaleString('vi-VN')} đ</strong>
                      </p>
                      {totals.discount > 0 && (
                        <p className="text-emerald-700 font-semibold">
                          Giảm trừ: -{totals.discount.toLocaleString('vi-VN')} VNĐ
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-slate-500 block text-[11px]">Tổng cộng:</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {totals.gross.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="text-right border-l pl-4 border-slate-300">
                        <span className="text-rose-600 font-bold block text-[11px]">Tổng sau giảm trừ:</span>
                        <span className="font-extrabold text-rose-700 text-base">
                          {totals.total.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>

                      <div className="text-right border-l pl-4 border-slate-300">
                        <span className="text-[#1E3A8A] font-bold block text-[11px]">Còn lại cần thu:</span>
                        <span className="font-extrabold text-[#1E3A8A] text-base">
                          {totals.remaining.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingEdit ? 'Đang lưu...' : 'Lưu Hóa đơn'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

