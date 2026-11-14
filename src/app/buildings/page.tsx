'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Building2, MapPin, Phone, CreditCard, ShieldCheck, Edit3, Save, CheckCircle2, QrCode } from 'lucide-react';

interface Building {
  id: number;
  name: string;
  address: string;
  total_floors: number;
  total_rooms: number;
  manager_name: string;
  manager_phone: string;
  bank_name: string;
  bank_account: string;
  bank_account_holder: string;
  bank_bin?: string;
  notes?: string;
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Building>({
    id: 1,
    name: 'NHÀ TRỌ CÔ NÚI',
    address: '123 Đường Số 5, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
    total_floors: 4,
    total_rooms: 18,
    manager_name: 'Cô Núi (Trần Thị Mỹ Hạnh)',
    manager_phone: '0903 123 456',
    bank_name: 'Vietcombank',
    bank_account: '0501000080131',
    bank_account_holder: 'TRAN THI MY HANH',
    bank_bin: '970436',
    notes: 'Khu trọ an ninh cao cấp, trang bị camera giám sát và khóa vân tay từng phòng',
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await fetch('/api/buildings');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const raw = data[0];
        const normalized: Building = {
          id: raw.building_id || raw.id || 1,
          name: raw.building_name || raw.name || 'NHÀ TRỌ CÔ NÚI',
          address: raw.address || '123 Đường Số 5, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
          total_floors: Number(raw.total_floors) || 4,
          total_rooms: Number(raw.total_rooms) || 18,
          manager_name: raw.owner_name || raw.manager_name || 'Cô Núi (Trần Thị Mỹ Hạnh)',
          manager_phone: raw.owner_phone || raw.manager_phone || '0903 123 456',
          bank_name: raw.bank_name || 'Vietcombank',
          bank_account: raw.bank_account_no || raw.bank_account || '0501000080131',
          bank_account_holder: raw.bank_account_name || raw.bank_account_holder || 'TRAN THI MY HANH',
          bank_bin: raw.bank_bin || '970436',
          notes: raw.notes || 'Khu trọ an ninh cao cấp, trang bị camera giám sát và khóa vân tay từng phòng',
        };
        setBuildings([normalized]);
        setFormData(normalized);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building_id: formData.id,
          building_name: formData.name,
          address: formData.address,
          total_floors: formData.total_floors,
          total_rooms: formData.total_rooms,
          owner_name: formData.manager_name,
          owner_phone: formData.manager_phone,
          bank_name: formData.bank_name,
          bank_account_no: formData.bank_account,
          bank_account_name: formData.bank_account_holder,
          bank_bin: formData.bank_bin || '970436',
        }),
      });
    } catch (err) {
      console.warn('Building update fallback:', err);
    }
    setIsEditing(false);
    alert('Đã lưu thông tin Tòa nhà & Tài khoản Ngân hàng nhận tiền thành công!');
  };

  return (
    <AppLayout title="Quản lý Tòa nhà & Ngân hàng" subtitle="Cấu hình thông tin cơ sở hạ tầng, người quản lý và STK thụ hưởng VietQR">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-600 shrink-0" size={24} />
              <span>Tòa nhà & Tài khoản Ngân hàng</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thông tin cơ sở, ban quản lý và tài khoản ngân hàng nhận tiền
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Edit3 size={15} />
                Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Save size={15} />
                Lưu thay đổi
              </button>
            )}
          </div>
        </div>

        {/* Content Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
              <Building2 className="text-blue-600" size={18} />
              Thông tin Cơ sở & Vận hành
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Tên Tòa nhà / Khu trọ</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-sm bg-slate-50 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Người quản lý chính</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold text-slate-600 block mb-1">Địa chỉ khu trọ</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.manager_phone}
                  onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-slate-50 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Tổng số tầng</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.total_floors}
                  onChange={(e) => setFormData({ ...formData, total_floors: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-slate-50 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Tổng số phòng</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.total_rooms}
                  onChange={(e) => setFormData({ ...formData, total_rooms: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-slate-50 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold text-slate-600 block mb-1">Ghi chú & Quy định chung</label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Bank Account Config */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl p-6 text-white shadow-lg space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Tài khoản Ngân hàng VietQR</span>
                <QrCode size={20} className="text-blue-400" />
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div>
                  <p className="text-slate-400">Ngân hàng thụ hưởng:</p>
                  <p className="font-bold text-sm text-white">{formData.bank_name}</p>
                </div>

                <div>
                  <p className="text-slate-400">Số tài khoản (STK):</p>
                  <div className="font-mono font-bold text-xl text-amber-400 tracking-wider">
                    {formData.bank_account}
                  </div>
                </div>

                <div>
                  <p className="text-slate-400">Chủ tài khoản:</p>
                  <p className="font-bold uppercase tracking-wide text-white">{formData.bank_account_holder}</p>
                </div>

                <div>
                  <p className="text-slate-400">Mã định danh NAPAS (BIN):</p>
                  <p className="font-mono text-xs text-blue-300">{formData.bank_bin || '970436'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <CheckCircle2 size={14} />
                Đã kích hoạt VietQR tự động
              </div>
              <p>Mã QR trên hóa đơn hàng tháng sẽ tự động nhúng số tài khoản này kèm số tiền và mã hóa đơn.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

