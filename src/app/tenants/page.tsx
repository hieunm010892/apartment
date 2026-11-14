'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Plus, Search, Printer, Download, Eye, Edit3, Trash2, CheckCircle2, Shield, UserPlus, Phone, Home, FileText, X, Sliders, FileDown, Loader2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TenantItem {
  id: number;
  full_name: string;
  id_card: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  hometown?: string;
  permanent_address?: string;
  current_address?: string;
  ethnicity?: string;
  nationality?: string;
  religion?: string;
  job?: string;
  workplace?: string;
  id_card_date?: string;
  id_card_place?: string;
  room_code?: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCt01Modal, setShowCt01Modal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // CT01 Dynamic Configuration States
  const [ct01Version, setCt01Version] = useState<'TT116_2026' | 'CUSTOM'>('TT116_2026');
  const [ct01Agency, setCt01Agency] = useState('Công an Phường Tân Phong, Quận 7, TP. Hồ Chí Minh');
  const [ct01RequestContent, setCt01RequestContent] = useState('');
  const [ct01HeadName, setCt01HeadName] = useState('');
  const [ct01HeadRelationship, setCt01HeadRelationship] = useState('Chủ hộ / Đại diện thuê');
  const [ct01HeadIdCard, setCt01HeadIdCard] = useState('');
  const [ct01OwnerName, setCt01OwnerName] = useState('Trần Thị Mỹ Hạnh');
  const [ct01OwnerIdCard, setCt01OwnerIdCard] = useState('079195001234');
  const [ct01Location, setCt01Location] = useState('TP. Hồ Chí Minh');
  const [ct01Date, setCt01Date] = useState(new Date().toISOString().slice(0, 10));
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<TenantItem>>({
    full_name: '',
    id_card: '',
    phone: '',
    email: '',
    gender: 'Nam',
    date_of_birth: '1995-05-15',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    permanent_address: '',
    current_address: '',
    job: 'Nhân viên văn phòng',
    workplace: '',
    id_card_date: '2021-04-10',
    id_card_place: 'Cục Cảnh sát QLHC về TTXH',
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((t: any, idx: number) => ({
          id: t.tenant_id || t.id || (idx + 1),
          full_name: t.full_name || '',
          id_card: t.id_card_number || t.id_card || '',
          phone: t.phone || '',
          email: t.email || '',
          date_of_birth: t.date_of_birth || '1995-01-01',
          gender: t.gender || 'Nam',
          hometown: t.hometown || '',
          permanent_address: t.permanent_address || '',
          current_address: t.current_address || '123 Đường Số 5, Linh Trung, TP. Thủ Đức, TP.HCM',
          ethnicity: t.ethnicity || 'Kinh',
          nationality: t.nationality || 'Việt Nam',
          religion: t.religion || 'Không',
          job: t.occupation || t.job || '',
          workplace: t.workplace || '',
          id_card_date: t.id_card_issue_date || t.id_card_date || '2021-01-01',
          id_card_place: t.id_card_issue_place || t.id_card_place || 'Cục Cảnh sát QLHC về TTXH',
          room_code: t.current_room || t.room_code || '101',
        }));
        setTenants(normalized);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách khách thuê:', err);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const sTerm = searchTerm.toLowerCase();
    const matchSearch =
      (t.full_name || '').toLowerCase().includes(sTerm) ||
      (t.id_card || '').includes(sTerm) ||
      (t.phone || '').includes(sTerm) ||
      (t.room_code || '').toLowerCase().includes(sTerm);
    return matchSearch;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: Date.now(),
      full_name: '',
      id_card: '',
      phone: '',
      email: '',
      gender: 'Nam',
      date_of_birth: '1995-01-01',
      ethnicity: 'Kinh',
      nationality: 'Việt Nam',
      religion: 'Không',
      permanent_address: '',
      current_address: '123 Đường Số 5, Phường Linh Trung, TP. Thủ Đức, TP.HCM',
      job: '',
      workplace: '',
      id_card_date: '2021-01-01',
      id_card_place: 'Cục Cảnh sát QLHC về TTXH',
      room_code: '101',
    });
    setShowEditModal(true);
  };

  const handleOpenEdit = (tenant: TenantItem) => {
    setIsEditing(true);
    setFormData({ ...tenant });
    setShowEditModal(true);
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) return;

    if (isEditing) {
      setTenants(prev => prev.map(t => t.id === formData.id ? { ...t, ...formData } as TenantItem : t));
    } else {
      const newItem: TenantItem = {
        id: Date.now(),
        full_name: formData.full_name || '',
        id_card: formData.id_card || '',
        phone: formData.phone || '',
        email: formData.email || '',
        date_of_birth: formData.date_of_birth || '1995-01-01',
        gender: formData.gender || 'Nam',
        permanent_address: formData.permanent_address || '',
        current_address: formData.current_address || '',
        job: formData.job || '',
        room_code: formData.room_code || '101',
        ethnicity: formData.ethnicity || 'Kinh',
        nationality: formData.nationality || 'Việt Nam',
        religion: formData.religion || 'Không',
      };
      setTenants([newItem, ...tenants]);
    }
    setShowEditModal(false);
  };

  const formatDob = (dob?: string) => {
    if (!dob) return '../../....';
    if (dob.includes('-')) {
      const parts = dob.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dob;
  };

  const handleOpenCt01 = (tenant: TenantItem) => {
    setSelectedTenant(tenant);
    setCt01HeadName(tenant.full_name);
    setCt01HeadIdCard(tenant.id_card || '');
    setCt01HeadRelationship('Chủ hộ / Đại diện thuê');
    setCt01Agency('Công an Phường Tân Phong, Quận 7, TP. Hồ Chí Minh');
    setCt01RequestContent(
      `Đăng ký tạm trú tại địa chỉ: 123 Đường Số 5, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh, Phòng ${tenant.room_code || '101'}. Thời hạn từ 01/10/2026 đến 30/09/2027.`
    );
    setShowCt01Modal(true);
  };

  const handleDownloadCt01Docx = async () => {
    if (!selectedTenant) return;
    try {
      setDownloadingDocx(true);
      const res = await fetch('/api/ct01/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: selectedTenant.full_name,
          dateOfBirth: selectedTenant.date_of_birth,
          gender: selectedTenant.gender,
          idCard: selectedTenant.id_card,
          phone: selectedTenant.phone,
          email: selectedTenant.email,
          headName: ct01HeadName || selectedTenant.full_name,
          relationship: ct01HeadRelationship || 'Chủ hộ',
          headIdCard: ct01HeadIdCard || selectedTenant.id_card,
          agency: ct01Agency,
          requestContent: ct01RequestContent,
          ownerName: ct01OwnerName,
          ownerIdCard: ct01OwnerIdCard,
          location: ct01Location,
          declarationDate: ct01Date,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ máy chủ khi tạo file Word');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `To_Khai_CT01_${selectedTenant.full_name.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Không thể tải file Word: ' + err.message);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleExportExcel = () => {
    const data = filteredTenants.map((t, idx) => ({
      STT: idx + 1,
      'Họ và tên': t.full_name,
      'Số CCCD / ĐDCN': t.id_card,
      'Điện thoại': t.phone,
      'Phòng': t.room_code || 'Chưa nhận phòng',
      'Giới tính': t.gender || '',
      'Ngày sinh': t.date_of_birth || '',
      'Quê quán / HKTT': t.permanent_address || '',
      'Địa chỉ hiện tại': t.current_address || '',
      'Nghề nghiệp': t.job || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KhachThue');
    XLSX.writeFile(wb, `Danh_Sach_Khach_Thue_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Split CCCD into 12 single character boxes
  const renderCccdDigits = (cccd?: string) => {
    const digits = (cccd || '').replace(/\D/g, '').padEnd(12, ' ').slice(0, 12).split('');
    return (
      <div className="flex gap-0.5 sm:gap-1 items-center overflow-x-auto max-w-full py-0.5">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-4 h-5 sm:w-5 sm:h-6 shrink-0 border border-slate-700 flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs bg-white text-slate-900"
          >
            {d !== ' ' ? d : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout title="Quản lý Khách thuê & Khai báo Cư trú" subtitle="Quản lý hồ sơ nhân khẩu, CCCD và in Tờ khai CT01">
      <div className="space-y-4 sm:space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600 shrink-0" size={24} />
              <span>Khách thuê & Mẫu CT01</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý hồ sơ cư trú và in Mẫu CT01 theo quy chuẩn Bộ Công An
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
              <UserPlus size={15} />
              Thêm mới
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD, số điện thoại, số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-medium text-slate-500 shrink-0">
            Tổng số: <span className="text-blue-600 font-bold text-sm">{filteredTenants.length}</span> người thuê
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Số CCCD / ĐDCN</th>
                  <th className="py-3 px-4">Điện thoại</th>
                  <th className="py-3 px-4">Phòng trọ</th>
                  <th className="py-3 px-4">Địa chỉ thường trú</th>
                  <th className="py-3 px-4">Nghề nghiệp</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant, index) => (
                  <tr key={tenant.id} className="hover:bg-blue-50/40 transition group">
                    <td className="py-3 px-3 text-center font-medium text-slate-400">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                        {tenant.full_name}
                        {tenant.gender === 'Nam' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-normal">Nam</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-50 text-pink-600 font-normal">Nữ</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">Sinh: {tenant.date_of_birth || '---'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {tenant.id_card}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {tenant.phone}
                    </td>
                    <td className="py-3 px-4">
                      {tenant.room_code ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-xs border border-emerald-200">
                          {tenant.room_code}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa ghép phòng</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={tenant.permanent_address}>
                      {tenant.permanent_address || '---'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tenant.job || '---'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenCt01(tenant)}
                          title="In Mẫu CT01 Khai báo cư trú"
                          className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white rounded flex items-center gap-1 transition"
                        >
                          <Printer size={13} />
                          Mẫu CT01
                        </button>
                        <button
                          onClick={() => handleOpenEdit(tenant)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition"
                          title="Sửa thông tin"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTenants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Không tìm thấy khách thuê phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal In Mẫu CT01 (Theo chuẩn mau-CT01_1607161041.docx - Thông tư 116/2026/TT-BCA) */}
        {showCt01Modal && selectedTenant && (() => {
          const parsedDate = new Date(ct01Date || Date.now());
          const ct01Day = String(parsedDate.getDate()).padStart(2, '0');
          const ct01Month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const ct01Year = String(parsedDate.getFullYear());

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
                {/* Modal Header (no-print) */}
                <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shrink-0">
                      <FileText size={18} className="text-white" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-xs sm:text-base truncate">MẪU CT01: TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ</h3>
                      <p className="text-[11px] text-slate-300 truncate">
                        {selectedTenant.full_name} - Phòng {selectedTenant.room_code || '101'} (TT 116/2026/TT-BCA)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleDownloadCt01Docx}
                      disabled={downloadingDocx}
                      className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                      title="Tải file Word chuẩn điền sẵn thông tin"
                    >
                      {downloadingDocx ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                      <span className="hidden sm:inline">Tải file Word (.docx)</span>
                      <span className="sm:hidden">Word</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                    >
                      <Printer size={14} />
                      <span className="hidden sm:inline">In Tờ Khai (A4)</span>
                      <span className="sm:hidden">In</span>
                    </button>
                    <button
                      onClick={() => setShowCt01Modal(false)}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Sub-header / Template Version & Config Bar (no-print) */}
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Phiên bản biểu mẫu:</span>
                    <select
                      value={ct01Version}
                      onChange={(e) => setCt01Version(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-blue-700 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="TT116_2026">Mẫu CT01 (TT 116/2026/TT-BCA - mau-CT01_1607161041.docx)</option>
                      <option value="CUSTOM">Mẫu cập nhật tương lai (Sẵn sàng nạp bổ sung)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowConfigPanel(!showConfigPanel)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 font-medium flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Sliders size={13} />
                    <span>{showConfigPanel ? 'Đóng cấu hình' : 'Điều chỉnh thông tin tờ khai'}</span>
                  </button>
                </div>

                {/* Collapsible Configuration Panel (no-print) */}
                {showConfigPanel && (
                  <div className="p-4 bg-blue-50/70 border-b border-blue-200 text-xs no-print animate-in fade-in">
                    <div className="flex items-start gap-2 mb-3 text-blue-900 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                      <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Mẫu CT01 chuẩn hóa theo Thông tư 116/2026/TT-BCA của Bộ trưởng Bộ Công an</div>
                        <div className="text-[11px] text-slate-600">
                          Hệ thống hỗ trợ in ấn trực tiếp chuẩn khổ A4 và xuất file Word (.docx) điền sẵn theo mẫu <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">mau-CT01_1607161041.docx</code>. Nếu có mẫu văn bản mới, chỉ cần cập nhật file mẫu vào hệ thống.
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Kính gửi (Cơ quan đăng ký cư trú):</label>
                        <input
                          type="text"
                          value={ct01Agency}
                          onChange={(e) => setCt01Agency(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          placeholder="Ví dụ: Công an Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nơi làm tờ khai & Ngày ký:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ct01Location}
                            onChange={(e) => setCt01Location(e.target.value)}
                            className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                            placeholder="TP. Hồ Chí Minh"
                          />
                          <input
                            type="date"
                            value={ct01Date}
                            onChange={(e) => setCt01Date(e.target.value)}
                            className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block font-semibold text-slate-700 mb-1">10. Nội dung đề nghị:</label>
                        <textarea
                          rows={2}
                          value={ct01RequestContent}
                          onChange={(e) => setCt01RequestContent(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          placeholder="Nội dung đề nghị đăng ký tạm trú..."
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Chủ hộ (Mục 7 & Ký tên):</label>
                        <input
                          type="text"
                          value={ct01HeadName}
                          onChange={(e) => setCt01HeadName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Mối quan hệ với chủ hộ (Mục 8):</label>
                        <input
                          type="text"
                          value={ct01HeadRelationship}
                          onChange={(e) => setCt01HeadRelationship(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Số CCCD chủ hộ (Mục 9):</label>
                        <input
                          type="text"
                          value={ct01HeadIdCard}
                          onChange={(e) => setCt01HeadIdCard(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Chủ sở hữu chỗ ở hợp pháp (Mục 8 chữ ký):</label>
                        <input
                          type="text"
                          value={ct01OwnerName}
                          onChange={(e) => setCt01OwnerName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Số CCCD chủ sở hữu chỗ ở:</label>
                        <input
                          type="text"
                          value={ct01OwnerIdCard}
                          onChange={(e) => setCt01OwnerIdCard(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CT01 Printable Document Content */}
                <div
                  className="p-6 sm:p-10 overflow-y-auto print:p-0 print:overflow-visible text-black bg-white font-['Times_New_Roman',serif] text-[13px] leading-relaxed selection:bg-blue-100"
                  id="printable-ct01"
                >
                  {/* Top Header: Mẫu CT01 theo TT 116/2026/TT-BCA */}
                  <div className="text-right text-[11px] leading-snug mb-3">
                    <p className="font-semibold">Mẫu CT01 ban hành kèm theo Thông tư số 116/2026/TT-BCA</p>
                    <p className="italic">ngày 29 tháng 6 năm 2026 của Bộ trưởng Bộ Công an</p>
                  </div>

                  {/* Quốc hiệu & Tiêu ngữ */}
                  <div className="text-center mb-6">
                    <p className="text-[13px] font-bold uppercase tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-[13px] font-bold">Độc lập – Tự do – Hạnh phúc</p>
                    <div className="w-44 h-0.5 bg-black mx-auto mt-1 mb-4"></div>

                    <h2 className="text-[16px] font-bold uppercase tracking-wider mt-4">
                      TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ
                    </h2>
                  </div>

                  {/* Kính gửi */}
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="font-semibold whitespace-nowrap">
                      Kính gửi <sup>(1)</sup>:
                    </span>
                    <span className="flex-1 font-semibold border-b border-dotted border-black pb-0.5">
                      {ct01Agency}
                    </span>
                  </div>

                  {/* Mục 1 -> 10 */}
                  <div className="space-y-2.5">
                    {/* Mục 1 */}
                    <div className="flex items-baseline gap-2">
                      <span className="whitespace-nowrap font-semibold">1. Họ, chữ đệm và tên khai sinh:</span>
                      <span className="font-bold uppercase tracking-wide flex-1 border-b border-dotted border-black pb-0.5">
                        {selectedTenant.full_name}
                      </span>
                    </div>

                    {/* Mục 2 & 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">2. Ngày, tháng, năm sinh:</span>
                        <span className="flex-1 font-semibold border-b border-dotted border-black pb-0.5">
                          {formatDob(selectedTenant.date_of_birth)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">3. Giới tính:</span>
                        <span className="flex-1 border-b border-dotted border-black pb-0.5">
                          {selectedTenant.gender || 'Nam'}
                        </span>
                      </div>
                    </div>

                    {/* Mục 4 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-0.5">
                      <span className="whitespace-nowrap font-semibold">4. Số định danh cá nhân:</span>
                      <div className="flex items-center gap-2">
                        {renderCccdDigits(selectedTenant.id_card)}
                      </div>
                    </div>

                    {/* Mục 5 & 6 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">5. Số điện thoại liên hệ:</span>
                        <span className="flex-1 font-semibold font-mono border-b border-dotted border-black pb-0.5">
                          {selectedTenant.phone}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">6. Email:</span>
                        <span className="flex-1 font-mono border-b border-dotted border-black pb-0.5">
                          {selectedTenant.email || '........................................'}
                        </span>
                      </div>
                    </div>

                    {/* Mục 7 & 8 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">
                          7. Họ, chữ đệm và tên chủ hộ <sup>(2)</sup>:
                        </span>
                        <span className="flex-1 font-semibold border-b border-dotted border-black pb-0.5">
                          {ct01HeadName || selectedTenant.full_name}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">8. Mối quan hệ với chủ hộ:</span>
                        <span className="flex-1 border-b border-dotted border-black pb-0.5">
                          {ct01HeadRelationship || 'Chủ hộ'}
                        </span>
                      </div>
                    </div>

                    {/* Mục 9 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-0.5">
                      <span className="whitespace-nowrap font-semibold">9. Số định danh cá nhân của chủ hộ:</span>
                      <div className="flex items-center gap-2">
                        {renderCccdDigits(ct01HeadIdCard || selectedTenant.id_card)}
                      </div>
                    </div>

                    {/* Mục 10 */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap font-semibold">
                          10. Nội dung đề nghị <sup>(3)</sup>:
                        </span>
                        <span className="flex-1 border-b border-dotted border-black pb-0.5 font-semibold">
                          {ct01RequestContent}
                        </span>
                      </div>
                    </div>

                    {/* Mục 11 */}
                    <div className="pt-2">
                      <div className="font-semibold mb-1">
                        11. Những người cùng thay đổi mối quan hệ cư trú:
                      </div>
                      <table className="w-full border-collapse border border-black text-[12px] my-2 text-center">
                        <thead>
                          <tr className="bg-slate-50 font-bold">
                            <th className="border border-black p-1 w-10">TT</th>
                            <th className="border border-black p-1">Họ, chữ đệm và tên</th>
                            <th className="border border-black p-1 w-28">Ngày, tháng, năm sinh</th>
                            <th className="border border-black p-1 w-16">Giới tính</th>
                            <th className="border border-black p-1 w-36">Số định danh cá nhân</th>
                            <th className="border border-black p-1 w-32">Mối quan hệ với chủ hộ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-black p-1.5">1</td>
                            <td className="border border-black p-1.5 font-medium text-left">Trần Thị Mai Phương</td>
                            <td className="border border-black p-1.5">20/08/1997</td>
                            <td className="border border-black p-1.5">Nữ</td>
                            <td className="border border-black p-1.5 font-mono">079197003456</td>
                            <td className="border border-black p-1.5">Vợ</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5">2</td>
                            <td className="border border-black p-1.5 font-medium text-left">Nguyễn Minh Quân</td>
                            <td className="border border-black p-1.5">12/10/2022</td>
                            <td className="border border-black p-1.5">Nam</td>
                            <td className="border border-black p-1.5 font-mono">079222019888</td>
                            <td className="border border-black p-1.5">Con</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5 text-slate-300">3</td>
                            <td className="border border-black p-1.5 text-slate-300 text-left">...</td>
                            <td className="border border-black p-1.5 text-slate-300">...</td>
                            <td className="border border-black p-1.5 text-slate-300">...</td>
                            <td className="border border-black p-1.5 text-slate-300">...</td>
                            <td className="border border-black p-1.5 text-slate-300">...</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Khối chữ ký 4 cột */}
                    <div className="pt-6 pb-2">
                      <table className="w-full text-center text-[12px] border-none">
                        <tbody>
                          <tr className="align-top font-bold">
                            <td className="w-1/4 p-1">
                              <div>Ý KIẾN CỦA CHỦ HỘ <sup>(4)</sup></div>
                              <div className="font-normal italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                              <div className="h-20"></div>
                              <div className="font-bold">{ct01HeadName || selectedTenant.full_name}</div>
                            </td>
                            <td className="w-1/4 p-1">
                              <div>Ý KIẾN CỦA CHỦ SỞ HỮU CHỖ Ở HỢP PHÁP <sup>(5)</sup></div>
                              <div className="font-normal italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                              <div className="h-14"></div>
                              <div className="text-left font-normal text-[11px] space-y-0.5">
                                <div><sup>(8)</sup> Họ và tên: <span className="font-semibold">{ct01OwnerName}</span></div>
                                <div><sup>(8)</sup> Số định danh cá nhân: <span className="font-mono font-semibold">{ct01OwnerIdCard}</span></div>
                              </div>
                            </td>
                            <td className="w-1/4 p-1">
                              <div>Ý KIẾN CỦA CHA HOẶC MẸ HOẶC NGƯỜI GIÁM HỘ <sup>(6)</sup></div>
                              <div className="font-normal italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                              <div className="h-20"></div>
                            </td>
                            <td className="w-1/4 p-1">
                              <div className="font-normal italic text-[11px] mb-1">
                                {ct01Location}, ngày {ct01Day} tháng {ct01Month} năm {ct01Year}
                              </div>
                              <div>NGƯỜI KÊ KHAI <sup>(7)</sup></div>
                              <div className="font-normal italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                              <div className="h-20"></div>
                              <div className="font-bold uppercase">{selectedTenant.full_name}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Chú thích 8 điều theo Thông tư 116/2026/TT-BCA */}
                    <div className="mt-4 pt-3 border-t border-black text-[10px] leading-relaxed text-black italic space-y-0.5">
                      <div className="font-bold not-italic">Chú thích:</div>
                      <div>(1) Cơ quan đăng ký cư trú.</div>
                      <div>(2) Ghi rõ họ, chữ đệm và tên của chủ hộ nơi công dân đăng ký cư trú (nếu có).</div>
                      <div>(3) Ghi rõ nội dung đề nghị (ví dụ: đăng ký thường trú; đăng ký tạm trú; điều chỉnh thông tin về cư trú...).</div>
                      <div>(4) Áp dụng đối với các trường hợp quy định tại điểm a khoản 2 Điều 20; điểm a khoản 1 Điều 27 Luật Cư trú năm 2020.</div>
                      <div>(5) Áp dụng đối với các trường hợp quy định tại điểm a, b khoản 2 Điều 20; điểm a, b khoản 1 Điều 27 Luật Cư trú năm 2020.</div>
                      <div>(6) Áp dụng đối với trường hợp người chưa thành niên, người bị hạn chế năng lực hành vi dân sự, người mất năng lực hành vi dân sự, người có khó khăn trong nhận thức, làm chủ hành vi theo quy định của pháp luật.</div>
                      <div>(7) Người kê khai ký, ghi rõ họ tên. Trường hợp người chưa thành niên, người mất năng lực hành vi dân sự, người có khó khăn trong nhận thức, làm chủ hành vi thì cha, mẹ hoặc người giám hộ kê khai, ký, ghi rõ họ tên và mối quan hệ.</div>
                      <div>(8) Trường hợp chủ sở hữu chỗ ở hợp pháp là cá nhân thì ghi họ, chữ đệm và tên, số định danh cá nhân. Trường hợp chủ sở hữu chỗ ở hợp pháp là tổ chức thì ghi tên tổ chức và họ tên, chức vụ, số định danh cá nhân của người đại diện hợp pháp của tổ chức.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal Thêm / Sửa khách thuê */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {isEditing ? 'Sửa thông tin khách thuê' : 'Thêm khách thuê mới'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số CCCD / ĐDCN * (12 chữ số)</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={formData.id_card || ''}
                      onChange={(e) => setFormData({ ...formData, id_card: e.target.value })}
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Giới tính</label>
                    <select
                      value={formData.gender || 'Nam'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nơi thường trú (Hộ khẩu)</label>
                    <input
                      type="text"
                      value={formData.permanent_address || ''}
                      onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                      placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nghề nghiệp</label>
                    <input
                      type="text"
                      value={formData.job || ''}
                      onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                      placeholder="Kỹ sư, buôn bán..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
                  >
                    Lưu thông tin
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
