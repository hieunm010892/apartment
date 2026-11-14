-- ============================================================================
-- Apartment Management System (Quản lý Nhà trọ & Căn hộ Dịch vụ)
-- PostgreSQL Database Schema Script
-- Compatible with PostgreSQL 12+, Supabase, Neon, and Vercel Postgres
-- ============================================================================

-- Create tables if not exists
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    permission_name VARCHAR(200) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    can_export BOOLEAN NOT NULL DEFAULT FALSE,
    can_print BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    role_id INT NOT NULL REFERENCES roles(role_id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(2000),
    description VARCHAR(500),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),
    module_name VARCHAR(100) NOT NULL,
    action_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(100),
    summary VARCHAR(500),
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module_name, action_name);

-- Property & Asset Management
CREATE TABLE IF NOT EXISTS buildings (
    building_id SERIAL PRIMARY KEY,
    building_code VARCHAR(50) NOT NULL UNIQUE,
    building_name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    ward VARCHAR(150),
    district VARCHAR(150),
    city VARCHAR(150),
    residence_agency VARCHAR(250), -- Mục (1) mẫu CT01: Cơ quan đăng ký cư trú
    owner_name VARCHAR(150),       -- Mục (5)(8) mẫu CT01: Chủ sở hữu chỗ ở hợp pháp
    owner_id_number VARCHAR(30),   -- Mục (8) mẫu CT01: Số định danh chủ hộ
    owner_phone VARCHAR(30),
    total_floors INT NOT NULL DEFAULT 1,
    total_rooms INT NOT NULL DEFAULT 0,
    manager_user_id INT REFERENCES users(user_id),
    bank_bin VARCHAR(20) DEFAULT '970436', -- Vietcombank BIN
    bank_name VARCHAR(150) DEFAULT 'Vietcombank - PGD An Lạc',
    bank_account_no VARCHAR(50) DEFAULT '0501000080131',
    bank_account_name VARCHAR(150) DEFAULT 'TRAN THI MY HANH',
    default_electric_price NUMERIC(14, 0) NOT NULL DEFAULT 3500,
    default_water_price NUMERIC(14, 0) NOT NULL DEFAULT 18000,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS room_types (
    room_type_id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(150) NOT NULL,
    default_area NUMERIC(10, 2) NOT NULL DEFAULT 20,
    default_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    max_occupants INT NOT NULL DEFAULT 2,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES buildings(building_id),
    room_type_id INT REFERENCES room_types(room_type_id),
    room_code VARCHAR(50) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL DEFAULT 1,
    area NUMERIC(10, 2) NOT NULL DEFAULT 0,
    base_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    max_occupants INT NOT NULL DEFAULT 2,
    status INT NOT NULL DEFAULT 0, -- 0: Trống, 1: Đặt cọc, 2: Đang ở, 3: Bảo trì
    cleaning_status INT NOT NULL DEFAULT 0, -- 0: Sạch sẽ, 1: Chưa dọn, 2: Đang dọn
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_rooms_building_number UNIQUE (building_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_rooms_building_status ON rooms(building_id, status) WHERE is_deleted = FALSE;

CREATE TABLE IF NOT EXISTS assets (
    asset_id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    asset_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    building_id INT REFERENCES buildings(building_id),
    room_id INT REFERENCES rooms(room_id),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    warranty_months INT NOT NULL DEFAULT 0,
    quantity INT NOT NULL DEFAULT 1,
    condition_status INT NOT NULL DEFAULT 1, -- 0: Mới, 1: Tốt, 2: Bình thường, 3: Hư hỏng, 4: Thanh lý
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE,
    service_name VARCHAR(150) NOT NULL,
    unit_name VARCHAR(50) NOT NULL,
    pricing_type INT NOT NULL DEFAULT 0, -- 0: Cố định/phòng, 1: Theo đầu người, 2: Theo đồng hồ, 3: Theo số lượng, 4: Giảm trừ
    default_unit_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    is_system_meter BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_services (
    room_service_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id),
    custom_unit_price NUMERIC(14, 0),
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_room_services_room_service UNIQUE (room_id, service_id)
);

-- Tenants & Leases
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id SERIAL PRIMARY KEY,
    tenant_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL, -- Mục 1 CT01
    date_of_birth DATE,              -- Mục 2 CT01
    gender VARCHAR(20),              -- Mục 3 CT01: Nam / Nữ
    id_card_number VARCHAR(30) NOT NULL, -- Mục 4 CT01: Số ĐDCN / CCCD
    id_card_issue_date DATE,
    id_card_issue_place VARCHAR(200),
    phone VARCHAR(30),               -- Mục 5 CT01
    email VARCHAR(150),              -- Mục 6 CT01
    permanent_address VARCHAR(500),  -- Mục 7 CT01: Nơi thường trú
    hometown VARCHAR(250),
    ethnicity VARCHAR(50) DEFAULT 'Kinh',
    nationality VARCHAR(50) DEFAULT 'Việt Nam',
    occupation VARCHAR(150),
    workplace VARCHAR(250),
    vehicle_plate VARCHAR(50),
    default_relationship_with_head VARCHAR(100) DEFAULT 'Người thuê trọ', -- Mục 8 & 11 CT01
    guardian_name VARCHAR(150),      -- Mục (6)(8) CT01
    guardian_id_number VARCHAR(30),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    residence_reg_status INT NOT NULL DEFAULT 0, -- 0: Chưa đăng ký, 1: Đã đăng ký, 2: Sắp hết hạn
    residence_reg_date DATE,
    residence_expiry_date DATE,
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tenants_id_card ON tenants(id_card_number) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_tenants_phone ON tenants(phone) WHERE is_deleted = FALSE;

CREATE TABLE IF NOT EXISTS contracts (
    contract_id SERIAL PRIMARY KEY,
    contract_code VARCHAR(50) NOT NULL UNIQUE,
    building_id INT NOT NULL REFERENCES buildings(building_id),
    room_id INT NOT NULL REFERENCES rooms(room_id),
    primary_tenant_id INT NOT NULL REFERENCES tenants(tenant_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_price NUMERIC(14, 0) NOT NULL,
    deposit_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    deposit_paid NUMERIC(14, 0) NOT NULL DEFAULT 0,
    deposit_refund_policy VARCHAR(1000),
    billing_day INT NOT NULL DEFAULT 5,
    payment_term_days INT NOT NULL DEFAULT 5,
    initial_electric_index NUMERIC(10, 2) NOT NULL DEFAULT 0,
    initial_water_index NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 1, -- 0: Nháp, 1: Đang hiệu lực, 2: Sắp hết hạn, 3: Đã thanh lý, 4: Đã hủy
    check_in_note TEXT,
    check_out_date DATE,
    check_out_electric_index NUMERIC(10, 2),
    check_out_water_index NUMERIC(10, 2),
    deduction_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    refund_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    settlement_note TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contract_tenants (
    contract_tenant_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES contracts(contract_id) ON DELETE CASCADE,
    tenant_id INT NOT NULL REFERENCES tenants(tenant_id),
    is_primary_tenant BOOLEAN NOT NULL DEFAULT FALSE,
    relationship_with_head VARCHAR(100) DEFAULT 'Người thuê trọ',
    ct01_request_content VARCHAR(500),
    move_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    move_out_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Meter Readings & Invoices
CREATE TABLE IF NOT EXISTS meter_readings (
    reading_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES rooms(room_id),
    billing_month INT NOT NULL,
    billing_year INT NOT NULL,
    electric_old NUMERIC(10, 2) NOT NULL DEFAULT 0,
    electric_new NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_electric_reset BOOLEAN NOT NULL DEFAULT FALSE,
    electric_usage NUMERIC(10, 2) NOT NULL DEFAULT 0,
    electric_unit_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    water_old NUMERIC(10, 2) NOT NULL DEFAULT 0,
    water_new NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_water_reset BOOLEAN NOT NULL DEFAULT FALSE,
    water_usage NUMERIC(10, 2) NOT NULL DEFAULT 0,
    water_unit_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    is_abnormal_warning BOOLEAN NOT NULL DEFAULT FALSE,
    warning_note VARCHAR(500),
    is_billed BOOLEAN NOT NULL DEFAULT FALSE,
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by INT REFERENCES users(user_id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_meter_readings_room_period UNIQUE (room_id, billing_year, billing_month)
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
    contract_id INT NOT NULL REFERENCES contracts(contract_id),
    room_id INT NOT NULL REFERENCES rooms(room_id),
    tenant_id INT NOT NULL REFERENCES tenants(tenant_id),
    reading_id INT REFERENCES meter_readings(reading_id),
    billing_month INT NOT NULL,
    billing_year INT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    room_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    electric_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    water_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    service_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    other_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(14, 0) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status INT NOT NULL DEFAULT 0, -- 0: Chưa TT, 1: TT một phần, 2: Đã TT đủ, 3: Quá hạn, 4: Đã hủy
    viet_qr_content TEXT,
    notes TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice_details (
    invoice_detail_id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    service_id INT REFERENCES services(service_id),
    item_type VARCHAR(50) NOT NULL, -- ROOM, ELECTRIC, WATER, SERVICE, DISCOUNT, OTHER
    item_name VARCHAR(200) NOT NULL,
    old_index NUMERIC(10, 2),
    new_index NUMERIC(10, 2),
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_name VARCHAR(50),
    unit_price NUMERIC(14, 0) NOT NULL DEFAULT 0,
    amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    notes VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    payment_code VARCHAR(50) NOT NULL UNIQUE,
    invoice_id INT NOT NULL REFERENCES invoices(invoice_id),
    contract_id INT NOT NULL REFERENCES contracts(contract_id),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount NUMERIC(14, 0) NOT NULL,
    payment_method INT NOT NULL DEFAULT 0, -- 0: Tiền mặt, 1: Chuyển khoản, 2: Ví điện tử
    reference_no VARCHAR(100),
    bank_account VARCHAR(100),
    notes VARCHAR(500),
    received_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cash_transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(50) NOT NULL UNIQUE,
    building_id INT REFERENCES buildings(building_id),
    transaction_type INT NOT NULL, -- 0: Thu (Income), 1: Chi (Expense)
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 0) NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method INT NOT NULL DEFAULT 0,
    reference_type VARCHAR(50),
    reference_id INT,
    description TEXT,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    ticket_id SERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    building_id INT NOT NULL REFERENCES buildings(building_id),
    room_id INT REFERENCES rooms(room_id),
    asset_id INT REFERENCES assets(asset_id),
    reported_by_tenant_id INT REFERENCES tenants(tenant_id),
    title VARCHAR(250) NOT NULL,
    description TEXT,
    priority INT NOT NULL DEFAULT 1, -- 0: Thấp, 1: Bình thường, 2: Cao, 3: Khẩn cấp
    status INT NOT NULL DEFAULT 0,   -- 0: Mới, 1: Đã phân công, 2: Đang xử lý, 3: Hoàn thành, 4: Đã hủy
    assigned_user_id INT REFERENCES users(user_id),
    vendor_name VARCHAR(200),
    material_cost NUMERIC(14, 0) NOT NULL DEFAULT 0,
    labor_cost NUMERIC(14, 0) NOT NULL DEFAULT 0,
    total_cost NUMERIC(14, 0) GENERATED ALWAYS AS (material_cost + labor_cost) STORED,
    recorded_to_cashbook BOOLEAN NOT NULL DEFAULT FALSE,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    resolution_note TEXT,
    created_by INT REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(building_id),
    room_id INT REFERENCES rooms(room_id),
    tenant_id INT REFERENCES tenants(tenant_id),
    channel VARCHAR(30) NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    recipient_address VARCHAR(250),
    status INT NOT NULL DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
