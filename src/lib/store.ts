import {
  Building, Room, RoomType, Asset, ServiceItem, Tenant,
  Contract, MeterReading, Invoice, InvoiceDetail, Payment,
  CashTransaction, MaintenanceTicket, User, AuditLog
} from './types';
import { getDbPool, query } from './db';
import { buildVietQrPayload } from './vietqr';

// In-memory demo dataset mirroring the SQL Server / PostgreSQL seed data
let memoryBuildings: Building[] = [
  {
    building_id: 1,
    building_code: 'CS01',
    building_name: 'NHÀ TRỌ CÔ NÚI',
    address: '123 Đường Số 5, Linh Trung',
    ward: 'Phường Linh Trung',
    district: 'TP. Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    residence_agency: 'Công an Phường Linh Trung',
    owner_name: 'Trần Thị Mỹ Hạnh',
    owner_id_number: '079185009999',
    owner_phone: '0909888999',
    total_floors: 3,
    total_rooms: 6,
    bank_bin: '970436',
    bank_name: 'Vietcombank - PGD An Lạc',
    bank_account_no: '0501000080131',
    bank_account_name: 'TRAN THI MY HANH',
    default_electric_price: 3500,
    default_water_price: 18000,
    is_active: true
  }
];

let memoryRooms: Room[] = [
  {
    room_id: 1, building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_type_id: 1, room_type_name: 'Phòng Tiêu chuẩn',
    room_code: 'CS01-P101', room_number: '101', floor_number: 1,
    area: 20, base_price: 3000000, max_occupants: 2,
    status: 2, status_text: 'Đang ở', cleaning_status: 0, cleaning_status_text: 'Sạch sẽ',
    tenant_name: 'Nguyễn Thị Hoa', tenant_phone: '0912345678', contract_end_date: '31/12/2026'
  },
  {
    room_id: 2, building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_type_id: 1, room_type_name: 'Phòng Tiêu chuẩn',
    room_code: 'CS01-P102', room_number: '102', floor_number: 1,
    area: 20, base_price: 3000000, max_occupants: 2,
    status: 0, status_text: 'Phòng trống', cleaning_status: 0, cleaning_status_text: 'Sạch sẽ'
  },
  {
    room_id: 3, building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_type_id: 2, room_type_name: 'Phòng có Gác lửng',
    room_code: 'CS01-P201', room_number: '201', floor_number: 2,
    area: 25, base_price: 3800000, max_occupants: 3,
    status: 2, status_text: 'Đang ở', cleaning_status: 0, cleaning_status_text: 'Sạch sẽ',
    tenant_name: 'Trần Văn Minh', tenant_phone: '0909123456', contract_end_date: '31/12/2026'
  },
  {
    room_id: 4, building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_type_id: 2, room_type_name: 'Phòng có Gác lửng',
    room_code: 'CS01-P202', room_number: '202', floor_number: 2,
    area: 25, base_price: 3800000, max_occupants: 3,
    status: 1, status_text: 'Đặt cọc', cleaning_status: 0, cleaning_status_text: 'Sạch sẽ'
  },
  {
    room_id: 5, building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_type_id: 3, room_type_name: 'Studio Full NT',
    room_code: 'CS01-P301', room_number: '301', floor_number: 3,
    area: 35, base_price: 5200000, max_occupants: 3,
    status: 0, status_text: 'Phòng trống', cleaning_status: 1, cleaning_status_text: 'Chưa dọn'
  },
  {
    room_id: 6, building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_type_id: 3, room_type_name: 'Studio Full NT',
    room_code: 'CS01-P302', room_number: '302', floor_number: 3,
    area: 35, base_price: 5200000, max_occupants: 3,
    status: 3, status_text: 'Bảo trì', cleaning_status: 0, cleaning_status_text: 'Sạch sẽ'
  }
];

let memoryTenants: Tenant[] = [
  {
    tenant_id: 1, tenant_code: 'KH001', full_name: 'Nguyễn Thị Hoa',
    date_of_birth: '1995-06-15', gender: 'Nữ',
    id_card_number: '079195001234', id_card_issue_date: '2021-05-10',
    id_card_issue_place: 'Cục Cảnh sát QLHC về TTXH',
    phone: '0912345678', email: 'hoanguyen@gmail.com',
    permanent_address: 'Xã Hòa Phú, Huyện Củ Chi, TP. Hồ Chí Minh',
    vehicle_plate: '59Y1-123.45', default_relationship_with_head: 'Người thuê trọ',
    residence_reg_status: 1, residence_reg_status_text: 'Đã đăng ký tạm trú',
    current_room: '101 - NHÀ TRỌ CÔ NÚI'
  },
  {
    tenant_id: 2, tenant_code: 'KH002', full_name: 'Trần Văn Minh',
    date_of_birth: '1990-10-20', gender: 'Nam',
    id_card_number: '079090005678', id_card_issue_date: '2021-08-15',
    id_card_issue_place: 'Cục Cảnh sát QLHC về TTXH',
    phone: '0909123456', email: 'tranvanminh@gmail.com',
    permanent_address: '124 Phố Lê Lợi, TP. Nam Định, Tỉnh Nam Định',
    vehicle_plate: '29B1-888.88', default_relationship_with_head: 'Chủ hộ phòng trọ',
    residence_reg_status: 1, residence_reg_status_text: 'Đã đăng ký tạm trú',
    current_room: '201 - NHÀ TRỌ CÔ NÚI'
  },
  {
    tenant_id: 3, tenant_code: 'KH003', full_name: 'Lê Thị Thu',
    date_of_birth: '1992-03-12', gender: 'Nữ',
    id_card_number: '079192003456', id_card_issue_date: '2022-01-20',
    id_card_issue_place: 'Cục Cảnh sát QLHC về TTXH',
    phone: '0988776655', email: 'lethithu@gmail.com',
    permanent_address: '124 Phố Lê Lợi, TP. Nam Định, Tỉnh Nam Định',
    vehicle_plate: '29B1-999.99', default_relationship_with_head: 'Vợ',
    residence_reg_status: 1, residence_reg_status_text: 'Đã đăng ký tạm trú',
    current_room: '201 - NHÀ TRỌ CÔ NÚI'
  },
  {
    tenant_id: 4, tenant_code: 'KH004', full_name: 'Trần Bảo An',
    date_of_birth: '2018-09-05', gender: 'Nam',
    id_card_number: '079218007890', id_card_issue_date: '2023-04-12',
    id_card_issue_place: 'Cục Cảnh sát QLHC về TTXH',
    phone: '', email: '',
    permanent_address: '124 Phố Lê Lợi, TP. Nam Định, Tỉnh Nam Định',
    default_relationship_with_head: 'Con',
    residence_reg_status: 1, residence_reg_status_text: 'Đã đăng ký tạm trú',
    current_room: '201 - NHÀ TRỌ CÔ NÚI'
  }
];

let memoryContracts: Contract[] = [
  {
    contract_id: 1, contract_code: 'HD2026-P101',
    building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_id: 1, room_number: '101',
    primary_tenant_id: 1, primary_tenant_name: 'Nguyễn Thị Hoa', primary_tenant_phone: '0912345678',
    start_date: '2026-01-01', end_date: '2026-12-31',
    rent_price: 3000000, deposit_amount: 3000000, deposit_paid: 3000000,
    billing_day: 5, payment_term_days: 5,
    initial_electric_index: 100, initial_water_index: 12,
    status: 1, status_text: 'Đang hiệu lực',
    deduction_amount: 0, refund_amount: 0,
    occupants: [
      {
        contract_tenant_id: 1, contract_id: 1, tenant_id: 1,
        full_name: 'Nguyễn Thị Hoa', phone: '0912345678', id_card_number: '079195001234',
        is_primary_tenant: true, relationship_with_head: 'Người thuê trọ', move_in_date: '2026-01-01', is_active: true
      }
    ]
  },
  {
    contract_id: 2, contract_code: 'HD2026-P201',
    building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_id: 3, room_number: '201',
    primary_tenant_id: 2, primary_tenant_name: 'Trần Văn Minh', primary_tenant_phone: '0909123456',
    start_date: '2026-01-01', end_date: '2026-12-31',
    rent_price: 3800000, deposit_amount: 3800000, deposit_paid: 3800000,
    billing_day: 5, payment_term_days: 5,
    initial_electric_index: 120, initial_water_index: 15,
    status: 1, status_text: 'Đang hiệu lực',
    deduction_amount: 0, refund_amount: 0,
    occupants: [
      {
        contract_tenant_id: 2, contract_id: 2, tenant_id: 2,
        full_name: 'Trần Văn Minh', phone: '0909123456', id_card_number: '079090005678',
        is_primary_tenant: true, relationship_with_head: 'Chủ hộ phòng trọ', move_in_date: '2026-01-01', is_active: true
      },
      {
        contract_tenant_id: 3, contract_id: 2, tenant_id: 3,
        full_name: 'Lê Thị Thu', phone: '0988776655', id_card_number: '079192003456',
        is_primary_tenant: false, relationship_with_head: 'Vợ', move_in_date: '2026-01-01', is_active: true
      },
      {
        contract_tenant_id: 4, contract_id: 2, tenant_id: 4,
        full_name: 'Trần Bảo An', phone: '', id_card_number: '079218007890',
        is_primary_tenant: false, relationship_with_head: 'Con', move_in_date: '2026-01-01', is_active: true
      }
    ]
  }
];

let memoryServices: ServiceItem[] = [
  { service_id: 1, service_code: 'ELECTRIC', service_name: 'Tiền điện', unit_name: 'kWh', pricing_type: 2, pricing_type_text: 'Theo đồng hồ', default_unit_price: 3500, is_system_meter: true, is_active: true },
  { service_id: 2, service_code: 'WATER', service_name: 'Tiền nước', unit_name: 'm3', pricing_type: 2, pricing_type_text: 'Theo đồng hồ', default_unit_price: 18000, is_system_meter: true, is_active: true },
  { service_id: 3, service_code: 'WIFI', service_name: 'Internet / Wifi', unit_name: 'Tháng', pricing_type: 0, pricing_type_text: 'Cố định/phòng', default_unit_price: 100000, is_system_meter: false, is_active: true },
  { service_id: 4, service_code: 'PARKING', service_name: 'Gửi xe máy', unit_name: 'Chiếc', pricing_type: 3, pricing_type_text: 'Theo số lượng', default_unit_price: 100000, is_system_meter: false, is_active: true },
  { service_id: 5, service_code: 'CLEANING', service_name: 'Vệ sinh / Rác', unit_name: 'Tháng', pricing_type: 0, pricing_type_text: 'Cố định/phòng', default_unit_price: 30000, is_system_meter: false, is_active: true },
  { service_id: 6, service_code: 'MGMT', service_name: 'Phí quản lý', unit_name: 'Người', pricing_type: 1, pricing_type_text: 'Theo đầu người', default_unit_price: 50000, is_system_meter: false, is_active: true },
  { service_id: 7, service_code: 'DISCOUNT', service_name: 'Giảm trừ', unit_name: 'Tháng', pricing_type: 4, pricing_type_text: 'Giảm trừ', default_unit_price: -250000, is_system_meter: false, is_active: true }
];

let memoryMeterReadings: MeterReading[] = [
  {
    reading_id: 1, room_id: 1, room_number: '101', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    billing_month: 10, billing_year: 2026,
    electric_old: 100, electric_new: 185, electric_usage: 85, electric_unit_price: 3500,
    water_old: 12, water_new: 18, water_usage: 6, water_unit_price: 18000,
    is_abnormal_warning: false, is_billed: true, reading_date: '2026-10-25'
  },
  {
    reading_id: 2, room_id: 3, room_number: '201', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    billing_month: 10, billing_year: 2026,
    electric_old: 120, electric_new: 120, electric_usage: 0, electric_unit_price: 3500,
    water_old: 15, water_new: 15, water_usage: 0, water_unit_price: 18000,
    is_abnormal_warning: false, is_billed: true, reading_date: '2026-10-25'
  }
];

let memoryInvoices: Invoice[] = [
  {
    invoice_id: 1, invoice_code: 'HD202610-101',
    contract_id: 1, contract_code: 'HD2026-P101',
    building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_id: 1, room_number: '101',
    tenant_id: 1, tenant_name: 'Nguyễn Thị Hoa', tenant_phone: '0912345678', tenant_email: 'hoanguyen@gmail.com',
    reading_id: 1, billing_month: 10, billing_year: 2026,
    issue_date: '2026-10-28', due_date: '2026-11-05',
    room_amount: 3000000, electric_amount: 297500, water_amount: 108000, service_amount: 180000, other_amount: 0, discount_amount: 200000,
    total_amount: 3385500, paid_amount: 3385500, remaining_amount: 0,
    status: 2, status_text: 'Đã thanh toán',
    bank_bin: '970436', bank_name: 'Vietcombank - PGD An Lạc', bank_account_no: '0501000080131', bank_account_name: 'TRAN THI MY HANH',
    viet_qr_content: buildVietQrPayload('970436', '0501000080131', 3385500, 'P101 T10/2026'),
    notes: 'Đã thanh toán đủ chuyển khoản',
    details: [
      { invoice_detail_id: 1, invoice_id: 1, item_type: 'ROOM', item_name: 'Tiền thuê phòng 101 (Tháng 10/2026)', quantity: 1, unit_name: 'Tháng', unit_price: 3000000, amount: 3000000 },
      { invoice_detail_id: 2, invoice_id: 1, item_type: 'ELECTRIC', item_name: 'Tiền điện', old_index: 100, new_index: 185, quantity: 85, unit_name: 'kWh', unit_price: 3500, amount: 297500 },
      { invoice_detail_id: 3, invoice_id: 1, item_type: 'WATER', item_name: 'Tiền nước', old_index: 12, new_index: 18, quantity: 6, unit_name: 'm3', unit_price: 18000, amount: 108000 },
      { invoice_detail_id: 4, invoice_id: 1, item_type: 'SERVICE', item_name: 'Internet / Wifi', quantity: 1, unit_name: 'Tháng', unit_price: 100000, amount: 100000 },
      { invoice_detail_id: 5, invoice_id: 1, item_type: 'SERVICE', item_name: 'Phí quản lý', quantity: 1, unit_name: 'Người', unit_price: 50000, amount: 50000 },
      { invoice_detail_id: 6, invoice_id: 1, item_type: 'SERVICE', item_name: 'Vệ sinh / Rác', quantity: 1, unit_name: 'Tháng', unit_price: 30000, amount: 30000 },
      { invoice_detail_id: 7, invoice_id: 1, item_type: 'DISCOUNT', item_name: 'Giảm trừ', quantity: 1, unit_name: 'Tháng', unit_price: -200000, amount: -200000 }
    ]
  },
  {
    invoice_id: 2, invoice_code: 'HD202610-201',
    contract_id: 2, contract_code: 'HD2026-P201',
    building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_id: 3, room_number: '201',
    tenant_id: 2, tenant_name: 'Trần Văn Minh', tenant_phone: '0909123456', tenant_email: 'tranvanminh@gmail.com',
    reading_id: 2, billing_month: 10, billing_year: 2026,
    issue_date: '2026-10-28', due_date: '2026-11-05',
    room_amount: 3800000, electric_amount: 0, water_amount: 0, service_amount: 480000, other_amount: 0, discount_amount: 250000,
    total_amount: 4030000, paid_amount: 0, remaining_amount: 4030000,
    status: 0, status_text: 'Chưa thanh toán',
    bank_bin: '970436', bank_name: 'Vietcombank - PGD An Lạc', bank_account_no: '0501000080131', bank_account_name: 'TRAN THI MY HANH',
    viet_qr_content: buildVietQrPayload('970436', '0501000080131', 4030000, 'P201 T10/2026'),
    notes: 'Chờ thanh toán chuyển khoản VietQR',
    details: [
      { invoice_detail_id: 8, invoice_id: 2, item_type: 'ROOM', item_name: 'Tiền thuê phòng 201 (Tháng 10/2026)', quantity: 1, unit_name: 'Tháng', unit_price: 3800000, amount: 3800000 },
      { invoice_detail_id: 9, invoice_id: 2, item_type: 'ELECTRIC', item_name: 'Tiền điện', old_index: 120, new_index: 120, quantity: 0, unit_name: 'kWh', unit_price: 3500, amount: 0 },
      { invoice_detail_id: 10, invoice_id: 2, item_type: 'WATER', item_name: 'Tiền nước', old_index: 15, new_index: 15, quantity: 0, unit_name: 'm3', unit_price: 18000, amount: 0 },
      { invoice_detail_id: 11, invoice_id: 2, item_type: 'SERVICE', item_name: 'Gửi xe máy (2 xe)', quantity: 2, unit_name: 'Chiếc', unit_price: 100000, amount: 200000 },
      { invoice_detail_id: 12, invoice_id: 2, item_type: 'SERVICE', item_name: 'Internet / Wifi', quantity: 1, unit_name: 'Tháng', unit_price: 100000, amount: 100000 },
      { invoice_detail_id: 13, invoice_id: 2, item_type: 'SERVICE', item_name: 'Phí quản lý (3 người)', quantity: 3, unit_name: 'Người', unit_price: 50000, amount: 150000 },
      { invoice_detail_id: 14, invoice_id: 2, item_type: 'SERVICE', item_name: 'Vệ sinh / Rác', quantity: 1, unit_name: 'Tháng', unit_price: 30000, amount: 30000 },
      { invoice_detail_id: 15, invoice_id: 2, item_type: 'DISCOUNT', item_name: 'Giảm trừ', quantity: 1, unit_name: 'Tháng', unit_price: -250000, amount: -250000 }
    ]
  }
];

let memoryCashTransactions: CashTransaction[] = [
  {
    transaction_id: 1, transaction_code: 'PT261103-P101', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    transaction_type: 0, category: 'Tiền phòng', amount: 3385500,
    transaction_date: '2026-11-03 10:15:00', payment_method: 1,
    description: 'Thu tiền hóa đơn HD202610-101 - Phòng 101 (Nguyễn Thị Hoa)'
  },
  {
    transaction_id: 2, transaction_code: 'PC261020-01', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    transaction_type: 1, category: 'Bảo trì', amount: 450000,
    transaction_date: '2026-10-20 14:00:00', payment_method: 0,
    description: 'Thay bóng đèn và vòi xịt vệ sinh phòng 302'
  }
];

let memoryAssets: Asset[] = [
  { asset_id: 1, asset_code: 'TS-ML-01', asset_name: 'Máy lạnh Daikin Inverter 1.5HP', category: 'Điện lạnh', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI', room_id: 1, room_number: '101', purchase_price: 8500000, warranty_months: 24, quantity: 1, condition_status: 1, condition_status_text: 'Tốt' },
  { asset_id: 2, asset_code: 'TS-TL-01', asset_name: 'Tủ lạnh Panasonic 180L', category: 'Gia dụng', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI', room_id: 1, room_number: '101', purchase_price: 5200000, warranty_months: 12, quantity: 1, condition_status: 1, condition_status_text: 'Tốt' },
  { asset_id: 3, asset_code: 'TS-ML-02', asset_name: 'Máy lạnh Panasonic 1.5HP', category: 'Điện lạnh', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI', room_id: 3, room_number: '201', purchase_price: 8900000, warranty_months: 24, quantity: 1, condition_status: 1, condition_status_text: 'Tốt' },
  { asset_id: 4, asset_code: 'TS-NL-01', asset_name: 'Máy nước nóng Ariston 30L', category: 'Thiết bị vệ sinh', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI', room_id: 3, room_number: '201', purchase_price: 3200000, warranty_months: 12, quantity: 1, condition_status: 1, condition_status_text: 'Tốt' }
];

let memoryTickets: MaintenanceTicket[] = [
  {
    ticket_id: 1, ticket_code: 'SC261015-01', building_id: 1, building_name: 'NHÀ TRỌ CÔ NÚI',
    room_id: 6, room_number: '302', title: 'Hỏng vòi sen và rò rỉ nước', description: 'Nước chảy yếu và nhỏ giọt liên tục',
    priority: 1, priority_text: 'Bình thường', status: 1, status_text: 'Đang xử lý',
    material_cost: 250000, labor_cost: 200000, total_cost: 450000, reported_at: '2026-10-15 08:30:00'
  }
];

let memoryUsers: User[] = [
  { user_id: 1, username: 'admin', full_name: 'Quản Trị Viên', email: 'admin@nhatro.vn', phone: '0909123456', role_id: 1, role_name: 'Super Admin', is_active: true }
];

let memoryAuditLogs: AuditLog[] = [
  { log_id: 1, username: 'admin', module_name: 'Hệ thống', action_name: 'Khởi tạo', summary: 'Khởi tạo hệ thống quản lý nhà trọ', created_at: '2026-10-28 08:00:00' },
  { log_id: 2, username: 'admin', module_name: 'Hóa đơn', action_name: 'Phát hành hóa đơn', summary: 'Phát hành HD202610-201 (4,030,000 đ)', created_at: '2026-10-28 10:00:00' }
];

// Helper to determine if we should use PostgreSQL
const hasPg = () => !!process.env.DATABASE_URL;

// ========================== BUILDINGS ==========================
export async function getBuildings(): Promise<Building[]> {
  if (hasPg()) {
    try {
      const rows = await query<any>('SELECT * FROM buildings WHERE is_deleted = FALSE ORDER BY building_code');
      return rows;
    } catch (e) {
      console.warn('Postgres query failed, falling back to memory:', e);
    }
  }
  return [...memoryBuildings];
}

export async function saveBuilding(b: Partial<Building>): Promise<Building> {
  if (b.building_id && b.building_id > 0) {
    if (hasPg()) {
      try {
        await query(
          `UPDATE buildings SET
            building_name=$1, address=$2, ward=$3, district=$4, city=$5,
            residence_agency=$6, owner_name=$7, owner_id_number=$8, owner_phone=$9,
            total_floors=$10, total_rooms=$11, bank_name=$12, bank_account_no=$13,
            bank_account_name=$14, default_electric_price=$15, default_water_price=$16, updated_at=NOW()
           WHERE building_id=$17`,
          [b.building_name, b.address, b.ward, b.district, b.city,
           b.residence_agency, b.owner_name, b.owner_id_number, b.owner_phone,
           b.total_floors, b.total_rooms, b.bank_name, b.bank_account_no,
           b.bank_account_name, b.default_electric_price, b.default_water_price, b.building_id]
        );
      } catch (e) { console.warn('PG update error:', e); }
    }
    const idx = memoryBuildings.findIndex(x => x.building_id === b.building_id);
    if (idx >= 0) memoryBuildings[idx] = { ...memoryBuildings[idx], ...b };
    return memoryBuildings[idx];
  } else {
    const newId = memoryBuildings.length + 1;
    const item: Building = {
      building_id: newId,
      building_code: b.building_code || `CS${String(newId).padStart(2, '0')}`,
      building_name: b.building_name || 'Tòa nhà mới',
      address: b.address || '',
      ward: b.ward, district: b.district, city: b.city,
      residence_agency: b.residence_agency || 'Công an Phường',
      owner_name: b.owner_name || 'Chủ trọ',
      owner_id_number: b.owner_id_number,
      owner_phone: b.owner_phone,
      total_floors: b.total_floors || 1,
      total_rooms: b.total_rooms || 1,
      bank_bin: b.bank_bin || '970436',
      bank_name: b.bank_name || 'Vietcombank - PGD An Lạc',
      bank_account_no: b.bank_account_no || '0501000080131',
      bank_account_name: b.bank_account_name || 'TRAN THI MY HANH',
      default_electric_price: b.default_electric_price || 3500,
      default_water_price: b.default_water_price || 18000,
      is_active: true
    };
    memoryBuildings.push(item);
    return item;
  }
}

// ========================== ROOMS ==========================
export async function getRooms(buildingId?: number): Promise<Room[]> {
  if (hasPg()) {
    try {
      const q = buildingId
        ? 'SELECT r.*, b.building_name, t.full_name as tenant_name, t.phone as tenant_phone FROM rooms r JOIN buildings b ON r.building_id=b.building_id LEFT JOIN contracts c ON r.room_id=c.room_id AND c.status=1 LEFT JOIN tenants t ON c.primary_tenant_id=t.tenant_id WHERE r.building_id=$1 AND r.is_deleted=FALSE ORDER BY r.room_number'
        : 'SELECT r.*, b.building_name, t.full_name as tenant_name, t.phone as tenant_phone FROM rooms r JOIN buildings b ON r.building_id=b.building_id LEFT JOIN contracts c ON r.room_id=c.room_id AND c.status=1 LEFT JOIN tenants t ON c.primary_tenant_id=t.tenant_id WHERE r.is_deleted=FALSE ORDER BY r.room_number';
      return await query<Room>(q, buildingId ? [buildingId] : []);
    } catch (e) { console.warn('PG getRooms error:', e); }
  }
  return buildingId ? memoryRooms.filter(r => r.building_id === buildingId) : [...memoryRooms];
}

export async function saveRoom(r: Partial<Room>): Promise<Room> {
  const statusTexts: Record<number, string> = { 0: 'Phòng trống', 1: 'Đặt cọc', 2: 'Đang ở', 3: 'Bảo trì' };
  const cleanTexts: Record<number, string> = { 0: 'Sạch sẽ', 1: 'Chưa dọn', 2: 'Đang dọn' };

  if (r.room_id && r.room_id > 0) {
    const idx = memoryRooms.findIndex(x => x.room_id === r.room_id);
    if (idx >= 0) {
      memoryRooms[idx] = {
        ...memoryRooms[idx],
        ...r,
        status_text: statusTexts[r.status ?? memoryRooms[idx].status],
        cleaning_status_text: cleanTexts[r.cleaning_status ?? memoryRooms[idx].cleaning_status]
      };
      return memoryRooms[idx];
    }
  }

  const newId = memoryRooms.length + 1;
  const b = memoryBuildings.find(x => x.building_id === (r.building_id || 1));
  const item: Room = {
    room_id: newId,
    building_id: r.building_id || 1,
    building_name: b?.building_name || 'NHÀ TRỌ CÔ NÚI',
    room_type_id: r.room_type_id || 1,
    room_type_name: r.room_type_name || 'Tiêu chuẩn',
    room_code: r.room_code || `P${r.room_number}`,
    room_number: r.room_number || String(100 + newId),
    floor_number: r.floor_number || 1,
    area: r.area || 20,
    base_price: r.base_price || 3000000,
    max_occupants: r.max_occupants || 2,
    status: r.status ?? 0,
    status_text: statusTexts[r.status ?? 0],
    cleaning_status: r.cleaning_status ?? 0,
    cleaning_status_text: cleanTexts[r.cleaning_status ?? 0],
    notes: r.notes
  };
  memoryRooms.push(item);
  return item;
}

// ========================== TENANTS ==========================
export async function getTenants(): Promise<Tenant[]> {
  if (hasPg()) {
    try {
      return await query<Tenant>('SELECT * FROM tenants WHERE is_deleted=FALSE ORDER BY tenant_id');
    } catch (e) { console.warn('PG getTenants error:', e); }
  }
  return [...memoryTenants];
}

export async function saveTenant(t: Partial<Tenant>): Promise<Tenant> {
  if (t.tenant_id && t.tenant_id > 0) {
    const idx = memoryTenants.findIndex(x => x.tenant_id === t.tenant_id);
    if (idx >= 0) {
      memoryTenants[idx] = { ...memoryTenants[idx], ...t };
      return memoryTenants[idx];
    }
  }
  const newId = memoryTenants.length + 1;
  const item: Tenant = {
    tenant_id: newId,
    tenant_code: t.tenant_code || `KH${String(newId).padStart(3, '0')}`,
    full_name: t.full_name || '',
    date_of_birth: t.date_of_birth,
    gender: t.gender || 'Nam',
    id_card_number: t.id_card_number || '',
    id_card_issue_date: t.id_card_issue_date,
    id_card_issue_place: t.id_card_issue_place,
    phone: t.phone || '',
    email: t.email,
    permanent_address: t.permanent_address,
    vehicle_plate: t.vehicle_plate,
    default_relationship_with_head: t.default_relationship_with_head || 'Người thuê trọ',
    residence_reg_status: t.residence_reg_status || 0,
    residence_reg_status_text: t.residence_reg_status === 1 ? 'Đã đăng ký tạm trú' : 'Chưa đăng ký'
  };
  memoryTenants.push(item);
  return item;
}

// ========================== CONTRACTS ==========================
export async function getContracts(): Promise<Contract[]> {
  if (hasPg()) {
    try {
      return await query<Contract>(`
        SELECT c.*, b.building_name, r.room_number, t.full_name as primary_tenant_name, t.phone as primary_tenant_phone
        FROM contracts c
        JOIN buildings b ON c.building_id=b.building_id
        JOIN rooms r ON c.room_id=r.room_id
        JOIN tenants t ON c.primary_tenant_id=t.tenant_id
        WHERE c.is_deleted=FALSE ORDER BY c.contract_id DESC
      `);
    } catch (e) { console.warn('PG getContracts error:', e); }
  }
  return [...memoryContracts];
}

export async function saveContract(c: Partial<Contract>): Promise<Contract> {
  const newId = memoryContracts.length + 1;
  const b = memoryBuildings.find(x => x.building_id === c.building_id) || memoryBuildings[0];
  const r = memoryRooms.find(x => x.room_id === c.room_id) || memoryRooms[0];
  const t = memoryTenants.find(x => x.tenant_id === c.primary_tenant_id) || memoryTenants[0];

  const item: Contract = {
    contract_id: newId,
    contract_code: c.contract_code || `HD${new Date().getFullYear()}-P${r.room_number}`,
    building_id: b.building_id,
    building_name: b.building_name,
    room_id: r.room_id,
    room_number: r.room_number,
    primary_tenant_id: t.tenant_id,
    primary_tenant_name: t.full_name,
    primary_tenant_phone: t.phone,
    start_date: c.start_date || new Date().toISOString().split('T')[0],
    end_date: c.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    rent_price: c.rent_price || r.base_price,
    deposit_amount: c.deposit_amount || r.base_price,
    deposit_paid: c.deposit_paid || r.base_price,
    billing_day: c.billing_day || 5,
    payment_term_days: c.payment_term_days || 5,
    initial_electric_index: c.initial_electric_index || 0,
    initial_water_index: c.initial_water_index || 0,
    status: 1,
    status_text: 'Đang hiệu lực',
    deduction_amount: 0,
    refund_amount: 0,
    occupants: c.occupants || [
      {
        contract_tenant_id: 1,
        contract_id: newId,
        tenant_id: t.tenant_id,
        full_name: t.full_name,
        phone: t.phone,
        id_card_number: t.id_card_number,
        is_primary_tenant: true,
        relationship_with_head: 'Chủ hộ phòng trọ',
        move_in_date: c.start_date || new Date().toISOString().split('T')[0],
        is_active: true
      }
    ]
  };

  // Update room status to Occupied
  const roomIdx = memoryRooms.findIndex(x => x.room_id === r.room_id);
  if (roomIdx >= 0) {
    memoryRooms[roomIdx].status = 2;
    memoryRooms[roomIdx].status_text = 'Đang ở';
    memoryRooms[roomIdx].tenant_name = t.full_name;
    memoryRooms[roomIdx].tenant_phone = t.phone;
  }

  memoryContracts.unshift(item);
  return item;
}

// ========================== METER READINGS ==========================
export async function getMeterReadings(month?: number, year?: number): Promise<MeterReading[]> {
  let list = [...memoryMeterReadings];
  if (month) list = list.filter(x => x.billing_month === month);
  if (year) list = list.filter(x => x.billing_year === year);
  return list;
}

export async function saveMeterReading(r: Partial<MeterReading>): Promise<MeterReading> {
  const usageE = Math.max(0, (r.electric_new ?? 0) - (r.electric_old ?? 0));
  const usageW = Math.max(0, (r.water_new ?? 0) - (r.water_old ?? 0));
  const isAbnormal = usageE > 300 || usageW > 25;

  const item: MeterReading = {
    reading_id: r.reading_id || memoryMeterReadings.length + 1,
    room_id: r.room_id || 1,
    room_number: r.room_number || '101',
    building_id: 1,
    building_name: 'NHÀ TRỌ CÔ NÚI',
    billing_month: r.billing_month || 10,
    billing_year: r.billing_year || 2026,
    electric_old: r.electric_old ?? 0,
    electric_new: r.electric_new ?? 0,
    electric_usage: usageE,
    electric_unit_price: r.electric_unit_price || 3500,
    water_old: r.water_old ?? 0,
    water_new: r.water_new ?? 0,
    water_usage: usageW,
    water_unit_price: r.water_unit_price || 18000,
    is_abnormal_warning: isAbnormal,
    warning_note: isAbnormal ? 'Sản lượng tiêu thụ tăng bất thường' : undefined,
    is_billed: r.is_billed ?? false,
    reading_date: r.reading_date || new Date().toISOString().split('T')[0]
  };

  const idx = memoryMeterReadings.findIndex(x => x.reading_id === item.reading_id);
  if (idx >= 0) memoryMeterReadings[idx] = item;
  else memoryMeterReadings.push(item);
  return item;
}

// ========================== INVOICES ==========================
export async function getInvoices(month?: number, year?: number): Promise<Invoice[]> {
  let list = [...memoryInvoices];
  if (month) list = list.filter(x => x.billing_month === month);
  if (year) list = list.filter(x => x.billing_year === year);
  return list;
}

export async function getInvoiceById(id: number): Promise<Invoice | undefined> {
  return memoryInvoices.find(x => x.invoice_id === id);
}

export async function recordPayment(invoiceId: number, amount: number, method: number, notes?: string): Promise<Invoice> {
  const inv = memoryInvoices.find(x => x.invoice_id === invoiceId);
  if (!inv) throw new Error('Invoice not found');

  inv.paid_amount += amount;
  inv.remaining_amount = Math.max(0, inv.total_amount - inv.paid_amount);
  inv.status = inv.remaining_amount === 0 ? 2 : 1;
  inv.status_text = inv.status === 2 ? 'Đã thanh toán' : 'TT một phần';

  // Add to payments
  memoryCashTransactions.push({
    transaction_id: memoryCashTransactions.length + 1,
    transaction_code: `PT${Date.now().toString().slice(-6)}`,
    building_id: inv.building_id,
    building_name: inv.building_name,
    transaction_type: 0,
    category: 'Tiền phòng',
    amount: amount,
    transaction_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
    payment_method: method,
    description: `Thu tiền hóa đơn ${inv.invoice_code} - P${inv.room_number}`
  });

  return inv;
}

// ========================== SERVICES ==========================
export async function getServices(): Promise<ServiceItem[]> {
  return [...memoryServices];
}

// ========================== ASSETS ==========================
export async function getAssets(): Promise<Asset[]> {
  return [...memoryAssets];
}

// ========================== CASH TRANSACTIONS ==========================
export async function getCashTransactions(): Promise<CashTransaction[]> {
  return [...memoryCashTransactions];
}

export async function saveCashTransaction(t: Partial<CashTransaction>): Promise<CashTransaction> {
  const item: CashTransaction = {
    transaction_id: memoryCashTransactions.length + 1,
    transaction_code: t.transaction_code || `CT${Date.now().toString().slice(-6)}`,
    building_id: t.building_id || 1,
    building_name: t.building_name || 'NHÀ TRỌ CÔ NÚI',
    transaction_type: t.transaction_type ?? 0,
    category: t.category || 'Khác',
    amount: t.amount || 0,
    transaction_date: t.transaction_date || new Date().toISOString().replace('T', ' ').slice(0, 19),
    payment_method: t.payment_method ?? 0,
    description: t.description
  };
  memoryCashTransactions.unshift(item);
  return item;
}

// ========================== MAINTENANCE ==========================
export async function getMaintenanceTickets(): Promise<MaintenanceTicket[]> {
  return [...memoryTickets];
}

// ========================== USERS & AUDIT ==========================
export async function getUsers(): Promise<User[]> {
  return [...memoryUsers];
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return [...memoryAuditLogs];
}
