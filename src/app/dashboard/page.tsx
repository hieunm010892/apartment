'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Room, Building } from '@/lib/types';
import {
  Building2, Users, DollarSign, CheckCircle2,
  Clock, AlertTriangle, FileText, Gauge, ChevronRight,
  TrendingUp, Home, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, rRes] = await Promise.all([
          fetch('/api/buildings'),
          fetch(`/api/rooms?buildingId=${selectedBuildingId}`)
        ]);
        const bData = await bRes.json();
        const rData = await rRes.json();
        setBuildings(bData);
        setRooms(rData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedBuildingId]);

  // Counts
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 2).length;
  const vacantCount = rooms.filter(r => r.status === 0).length;
  const depositCount = rooms.filter(r => r.status === 1).length;
  const maintenanceCount = rooms.filter(r => r.status === 3).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  const filteredRooms = statusFilter === 'all'
    ? rooms
    : rooms.filter(r => r.status === statusFilter);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Đang ở</span>;
      case 0:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">Phòng trống</span>;
      case 1:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Đặt cọc</span>;
      case 3:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">Bảo trì</span>;
      default:
        return null;
    }
  };

  const getStatusTopStripe = (status: number) => {
    switch (status) {
      case 2: return 'bg-emerald-500';
      case 0: return 'bg-slate-400';
      case 1: return 'bg-amber-500';
      case 3: return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <AppLayout title="Sơ đồ phòng (PMS Room Rack)" subtitle="Quản lý hiện trạng phòng, giá thuê, hợp đồng và khách ở">
      {/* Top Controls: Building Selector & Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase">Tòa nhà:</label>
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(parseInt(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-sm focus:border-brand-600 focus:outline-none"
          >
            {buildings.map((b) => (
              <option key={b.building_id} value={b.building_id}>
                {b.building_code} - {b.building_name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả ({totalRooms})
          </button>
          <button
            onClick={() => setStatusFilter(2)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 2
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Đang ở ({occupiedCount})
          </button>
          <button
            onClick={() => setStatusFilter(0)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 0
                ? 'bg-slate-700 text-white shadow'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            Phòng trống ({vacantCount})
          </button>
          <button
            onClick={() => setStatusFilter(1)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 1
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Đặt cọc ({depositCount})
          </button>
          <button
            onClick={() => setStatusFilter(3)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              statusFilter === 3
                ? 'bg-rose-600 text-white shadow'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Bảo trì ({maintenanceCount})
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tỷ lệ lấp đầy</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{occupancyRate}%</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {occupiedCount}/{totalRooms} phòng đang có khách
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Home className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Doanh thu dự kiến T10</p>
            <p className="text-xl font-bold text-brand-900 mt-0.5">7,415,500 đ</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">2 hóa đơn phát hành</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Đã thanh toán</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">3,385,500 đ</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">P101 chuyển khoản đủ</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Còn lại cần thu</p>
            <p className="text-xl font-bold text-rose-600 mt-0.5">4,030,000 đ</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">P201 chờ VietQR</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Room Grid (Interactive PMS Rack) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room.room_id}
            className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            {/* Status Top Stripe */}
            <div className={`h-1.5 w-full ${getStatusTopStripe(room.status)}`} />

            <div className="p-4 flex-1">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Phòng {room.room_number}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Tầng {room.floor_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{room.room_type_name} • {room.area} m²</p>
                </div>
                {getStatusBadge(room.status)}
              </div>

              {/* Price */}
              <div className="mt-3">
                <span className="text-sm font-bold text-[#1E3A8A]">
                  {room.base_price.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs text-slate-400"> / tháng</span>
              </div>

              {/* Tenant info if occupied */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                {room.status === 2 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400">Khách thuê:</span>
                      <span className="font-semibold text-slate-900">{room.tenant_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400">Điện thoại:</span>
                      <span>{room.tenant_phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400">Hạn hợp đồng:</span>
                      <span className="text-slate-600 font-medium">{room.contract_end_date}</span>
                    </div>
                  </div>
                ) : room.status === 1 ? (
                  <p className="text-amber-700 font-medium italic">Đã nhận cọc giữ chỗ</p>
                ) : room.status === 3 ? (
                  <p className="text-rose-600 font-medium italic">Đang kiểm tra bảo trì thiết bị</p>
                ) : (
                  <p className="text-slate-400 italic">Sẵn sàng đón khách mới</p>
                )}
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px] font-semibold">
              <Link
                href="/rooms"
                className="py-1 px-2 text-slate-600 hover:text-blue-700 rounded transition-colors"
              >
                Chi tiết
              </Link>
              <Link
                href="/contracts"
                className="py-1 px-2 text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                {room.status === 2 ? 'Hợp đồng' : 'Check-in'}
              </Link>
              <Link
                href="/meter-readings"
                className="py-1 px-2 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
              >
                Ghi Đ/N
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
