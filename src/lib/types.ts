export interface Building {
  building_id: number;
  building_code: string;
  building_name: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  residence_agency?: string;
  owner_name?: string;
  owner_id_number?: string;
  owner_phone?: string;
  total_floors: number;
  total_rooms: number;
  manager_user_id?: number;
  bank_bin: string;
  bank_name: string;
  bank_account_no: string;
  bank_account_name: string;
  default_electric_price: number;
  default_water_price: number;
  notes?: string;
  is_active: boolean;
  is_deleted?: boolean;
}

export interface RoomType {
  room_type_id: number;
  type_code: string;
  type_name: string;
  default_area: number;
  default_price: number;
  max_occupants: number;
  description?: string;
  is_active: boolean;
}

export interface Room {
  room_id: number;
  building_id: number;
  building_name?: string;
  room_type_id?: number;
  room_type_name?: string;
  room_code: string;
  room_number: string;
  floor_number: number;
  area: number;
  base_price: number;
  max_occupants: number;
  status: number; // 0: Trong, 1: Dat coc, 2: Dang o, 3: Bao tri
  status_text?: string;
  cleaning_status: number; // 0: Sach se, 1: Chua don, 2: Dang don
  cleaning_status_text?: string;
  notes?: string;
  tenant_name?: string;
  tenant_phone?: string;
  contract_end_date?: string;
}

export interface Asset {
  asset_id: number;
  asset_code: string;
  asset_name: string;
  category?: string;
  building_id?: number;
  building_name?: string;
  room_id?: number;
  room_number?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price: number;
  warranty_months: number;
  quantity: number;
  condition_status: number; // 0: Moi, 1: Tot, 2: Binh thuong, 3: Hu hong, 4: Thanh ly
  condition_status_text?: string;
  notes?: string;
}

export interface ServiceItem {
  service_id: number;
  service_code: string;
  service_name: string;
  unit_name: string;
  pricing_type: number; // 0: Co dinh/phong, 1: Theo dau nguoi, 2: Theo dong ho, 3: Theo dang ky, 4: Giam tru
  pricing_type_text?: string;
  default_unit_price: number;
  is_system_meter: boolean;
  description?: string;
  is_active: boolean;
}

export interface RoomService {
  room_service_id: number;
  room_id: number;
  service_id: number;
  service_name?: string;
  unit_name?: string;
  pricing_type?: number;
  custom_unit_price?: number;
  quantity: number;
  is_active: boolean;
}

export interface Tenant {
  tenant_id: number;
  tenant_code: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  id_card_number: string;
  id_card_issue_date?: string;
  id_card_issue_place?: string;
  phone?: string;
  email?: string;
  permanent_address?: string;
  hometown?: string;
  ethnicity?: string;
  nationality?: string;
  occupation?: string;
  workplace?: string;
  vehicle_plate?: string;
  default_relationship_with_head?: string;
  guardian_name?: string;
  guardian_id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  residence_reg_status: number; // 0: Chua dang ky, 1: Da dang ky, 2: Sap het han
  residence_reg_status_text?: string;
  residence_reg_date?: string;
  residence_expiry_date?: string;
  notes?: string;
  current_room?: string;
}

export interface ContractTenant {
  contract_tenant_id: number;
  contract_id: number;
  tenant_id: number;
  full_name?: string;
  phone?: string;
  id_card_number?: string;
  is_primary_tenant: boolean;
  relationship_with_head?: string;
  ct01_request_content?: string;
  move_in_date: string;
  move_out_date?: string;
  is_active: boolean;
}

export interface Contract {
  contract_id: number;
  contract_code: string;
  building_id: number;
  building_name?: string;
  room_id: number;
  room_number?: string;
  primary_tenant_id: number;
  primary_tenant_name?: string;
  primary_tenant_phone?: string;
  start_date: string;
  end_date: string;
  rent_price: number;
  deposit_amount: number;
  deposit_paid: number;
  deposit_refund_policy?: string;
  billing_day: number;
  payment_term_days: number;
  initial_electric_index: number;
  initial_water_index: number;
  status: number; // 0: Nhap, 1: Dang hieu luc, 2: Sap het han, 3: Da thanh ly, 4: Da huy
  status_text?: string;
  check_in_note?: string;
  check_out_date?: string;
  check_out_electric_index?: number;
  check_out_water_index?: number;
  deduction_amount: number;
  refund_amount: number;
  settlement_note?: string;
  occupants?: ContractTenant[];
}

export interface MeterReading {
  reading_id: number;
  room_id: number;
  room_number?: string;
  building_id?: number;
  building_name?: string;
  billing_month: number;
  billing_year: number;
  electric_old: number;
  electric_new: number;
  electric_usage: number;
  electric_unit_price: number;
  water_old: number;
  water_new: number;
  water_usage: number;
  water_unit_price: number;
  is_abnormal_warning: boolean;
  warning_note?: string;
  is_billed: boolean;
  reading_date: string;
}

export interface InvoiceDetail {
  invoice_detail_id: number;
  invoice_id: number;
  service_id?: number;
  item_type: string; // ROOM, ELECTRIC, WATER, SERVICE, DISCOUNT, OTHER
  item_name: string;
  old_index?: number;
  new_index?: number;
  quantity: number;
  unit_name?: string;
  unit_price: number;
  amount: number;
  notes?: string;
}

export interface Invoice {
  invoice_id: number;
  invoice_code: string;
  contract_id: number;
  contract_code?: string;
  building_id?: number;
  building_name?: string;
  room_id: number;
  room_number: string;
  tenant_id: number;
  tenant_name: string;
  tenant_phone?: string;
  tenant_email?: string;
  reading_id?: number;
  billing_month: number;
  billing_year: number;
  issue_date: string;
  due_date: string;
  room_amount: number;
  electric_amount: number;
  water_amount: number;
  service_amount: number;
  other_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: number; // 0: Chua TT, 1: TT mot phan, 2: Da TT du, 3: Qua han, 4: Da huy
  status_text?: string;
  bank_bin?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_account_name?: string;
  viet_qr_content?: string;
  notes?: string;
  details?: InvoiceDetail[];
}

export interface Payment {
  payment_id: number;
  payment_code: string;
  invoice_id: number;
  invoice_code?: string;
  contract_id: number;
  room_number?: string;
  tenant_name?: string;
  payment_date: string;
  amount: number;
  payment_method: number; // 0: Tien mat, 1: Chuyen khoan, 2: Vi dien tu
  payment_method_text?: string;
  reference_no?: string;
  bank_account?: string;
  notes?: string;
}

export interface CashTransaction {
  transaction_id: number;
  transaction_code: string;
  building_id?: number;
  building_name?: string;
  transaction_type: number; // 0: Thu, 1: Chi
  category: string;
  amount: number;
  transaction_date: string;
  payment_method: number;
  reference_type?: string;
  reference_id?: number;
  description?: string;
}

export interface MaintenanceTicket {
  ticket_id: number;
  ticket_code: string;
  building_id: number;
  building_name?: string;
  room_id?: number;
  room_number?: string;
  asset_id?: number;
  asset_name?: string;
  reported_by_tenant_id?: number;
  tenant_name?: string;
  title: string;
  description?: string;
  priority: number; // 0: Thap, 1: Binh thuong, 2: Cao, 3: Khan cap
  priority_text?: string;
  status: number; // 0: Moi, 1: Da phan cong, 2: Dang xu ly, 3: Hoan thanh, 4: Da huy
  status_text?: string;
  assigned_user_id?: number;
  assigned_user_name?: string;
  vendor_name?: string;
  material_cost: number;
  labor_cost: number;
  total_cost: number;
  reported_at: string;
  completed_at?: string;
  resolution_note?: string;
}

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  role_id: number;
  role_name?: string;
  is_active: boolean;
}

export interface AuditLog {
  log_id: number;
  username?: string;
  module_name: string;
  action_name: string;
  record_id?: string;
  summary?: string;
  created_at: string;
}

