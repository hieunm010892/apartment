'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Plus, Search, Printer, Download, Eye, Edit3, Trash2, CheckCircle2, Shield, UserPlus, Phone, Home, FileText, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Tenant {
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
  status?: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCt01Modal, setShowCt01Modal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Tenant>>({
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
        setTenants(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách khách thuê:', err);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchSearch =
      (t.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.id_card || '').includes(searchTerm) ||
      (t.phone || '').includes(searchTerm) ||
      (t.room_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
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
      current_address: '123 Đường Số 5, P. Tân Phong, Quận 7, TP.HCM',
      job: '',
      workplace: '',
      id_card_date: '2021-01-01',
      id_card_place: 'Cục Cảnh sát QLHC về TTXH',
    });
    setShowEditModal(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setIsEditing(true);
    setFormData({ ...tenant });
    setShowEditModal(true);
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { ...formData, id: formData.id } : formData;
      const res = await fetch('/api/tenants', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchTenants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCt01 = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowCt01Modal(true);
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD, số điện thoại, số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-medium text-slate-500">
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

        {/* Modal In Mẫu CT01 */}
        {showCt01Modal && selectedTenant && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between no-print">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                  <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shrink-0">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-xs sm:text-base truncate">MẪU CT01: TỜ KHAI CƯ TRÚ</h3>
                    <p className="text-[11px] text-slate-300 truncate">{selectedTenant.full_name} - {selectedTenant.room_code || 'P.101'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">In Tờ Khai (A4)</span>
                    <span className="sm:hidden">In</span>
                  </button>
                  <button
                    onClick={() => setShowCt01Modal(false)}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* CT01 Printable Document Content */}
              <div className="p-4 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 bg-white" id="printable-ct01">
                {/* Header Tiêu Ngữ */}
                <div className="grid grid-cols-2 text-center mb-6">
                  <div>
                    <p className="text-xs uppercase font-semibold">BỘ CÔNG AN</p>
                    <p className="text-xs uppercase font-bold underline">CÔNG AN PHƯỜNG TÂN PHONG, Q.7</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-xs font-bold">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-xs text-slate-400 tracking-tighter">------------------------</p>
                    <p className="text-[10px] text-right italic font-mono pr-4">Mẫu CT01 (Ban hành theo TT 56/2021/TT-BCA)</p>
                  </div>
                </div>

                {/* Form Title */}
                <div className="text-center my-6">
                  <h2 className="text-lg font-bold uppercase tracking-wide">TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ</h2>
                  <p className="text-xs italic text-slate-600 mt-1">(Dùng cho công dân đăng ký tạm trú / khai báo cư trú)</p>
                </div>

                {/* Body Content */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Kính gửi:</span>
                    <span className="border-b border-dotted border-slate-400 flex-1 font-semibold">Công an Phường Tân Phong, Quận 7, Thành phố Hồ Chí Minh</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold whitespace-nowrap">1. Họ, chữ đệm và tên:</span>
                      <span className="font-bold uppercase text-blue-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">{selectedTenant.full_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">2. Ngày sinh:</span>
                        <span className="font-mono border-b border-dotted border-slate-400">{selectedTenant.date_of_birth || '15/05/1995'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">3. Giới tính:</span>
                        <span className="border-b border-dotted border-slate-400">{selectedTenant.gender || 'Nam'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CCCD with Digit Boxes */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                    <span className="font-semibold whitespace-nowrap">4. Số ĐDCN / Số CMND / Số CCCD:</span>
                    <div className="flex items-center gap-3">
                      {renderCccdDigits(selectedTenant.id_card)}
                      <span className="text-[10px] text-slate-500 italic">(12 ô số chuẩn)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">5. Dân tộc:</span>
                      <span className="border-b border-dotted border-slate-400 flex-1">{selectedTenant.ethnicity || 'Kinh'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">6. Tôn giáo:</span>
                      <span className="border-b border-dotted border-slate-400 flex-1">{selectedTenant.religion || 'Không'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">7. Quốc tịch:</span>
                      <span className="border-b border-dotted border-slate-400 flex-1">{selectedTenant.nationality || 'Việt Nam'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold whitespace-nowrap">8. Số điện thoại liên hệ:</span>
                    <span className="font-mono font-bold border-b border-dotted border-slate-400 flex-1">{selectedTenant.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold whitespace-nowrap">9. Nơi thường trú:</span>
                    <span className="border-b border-dotted border-slate-400 flex-1">{selectedTenant.permanent_address || 'Số 12, Ấp Đông, Xã Thới Tam Thôn, Hóc Môn, TP.HCM'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold whitespace-nowrap">10. Nơi ở hiện tại:</span>
                    <span className="border-b border-dotted border-slate-400 flex-1 font-semibold">
                      Phòng {selectedTenant.room_code || '101'}, Tòa nhà Cô Núi, Số 123 Đường Số 5, P. Tân Phong, Quận 7, TP.HCM
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold whitespace-nowrap">11. Nghề nghiệp, nơi làm việc:</span>
                      <span className="border-b border-dotted border-slate-400 flex-1">{selectedTenant.job || 'Kỹ sư phần mềm'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold whitespace-nowrap">12. Quan hệ với chủ hộ:</span>
                      <span className="border-b border-dotted border-slate-400 flex-1 font-medium">Khách thuê phòng trọ</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="font-semibold mb-1">13. Nội dung đề nghị:</div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 italic">
                      Đăng ký tạm trú có thời hạn tại địa chỉ: Phòng {selectedTenant.room_code || '101'}, Nhà trọ Cô Núi, 123 Đường Số 5, P. Tân Phong, Quận 7, TP.HCM theo Hợp đồng thuê nhà.
                    </div>
                  </div>

                  {/* Table members in same residence */}
                  <div className="pt-2">
                    <div className="font-semibold mb-1">14. Những người cùng thay đổi thông tin cư trú (người ở cùng phòng):</div>
                    <table className="w-full border-collapse border border-slate-300 text-[11px] text-center">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 py-1.5 px-1 w-8">STT</th>
                          <th className="border border-slate-300 py-1.5 px-2">Họ, chữ đệm và tên</th>
                          <th className="border border-slate-300 py-1.5 px-2">Ngày, tháng, năm sinh</th>
                          <th className="border border-slate-300 py-1.5 px-2">Giới tính</th>
                          <th className="border border-slate-300 py-1.5 px-2">Số CCCD / ĐDCN</th>
                          <th className="border border-slate-300 py-1.5 px-2">Quan hệ với người khai</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 py-2">1</td>
                          <td className="border border-slate-300 py-2 font-medium">Trần Thị Mai Phương</td>
                          <td className="border border-slate-300 py-2">20/08/1997</td>
                          <td className="border border-slate-300 py-2">Nữ</td>
                          <td className="border border-slate-300 py-2 font-mono">079197003456</td>
                          <td className="border border-slate-300 py-2">Vợ</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 py-2">2</td>
                          <td className="border border-slate-300 py-2 font-medium">Nguyễn Minh Quân</td>
                          <td className="border border-slate-300 py-2">12/10/2022</td>
                          <td className="border border-slate-300 py-2">Nam</td>
                          <td className="border border-slate-300 py-2 font-mono">079222019888</td>
                          <td className="border border-slate-300 py-2">Con</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signature Section */}
                  <div className="pt-6 grid grid-cols-3 text-center text-xs">
                    <div>
                      <p className="font-bold">Ý KIẾN CỦA CHỦ HỘ</p>
                      <p className="text-[10px] italic">(Đồng ý cho đăng ký tạm trú)</p>
                      <div className="h-20"></div>
                      <p className="font-bold">Trần Thị Mỹ Hạnh</p>
                    </div>
                    <div>
                      <p className="font-bold">Ý KIẾN CỦA CHỦ SỞ HỮU</p>
                      <p className="text-[10px] italic">(Hoặc người đại diện hợp pháp)</p>
                      <div className="h-20"></div>
                      <p className="font-bold">Trần Thị Mỹ Hạnh</p>
                    </div>
                    <div>
                      <p className="italic text-[11px]">Ngày .... tháng .... năm 2026</p>
                      <p className="font-bold uppercase">NGƯỜI KÊ KHAI</p>
                      <p className="text-[10px] italic">(Ký, ghi rõ họ tên)</p>
                      <div className="h-20"></div>
                      <p className="font-bold uppercase">{selectedTenant.full_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Thêm / Sửa khách thuê */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">
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
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

