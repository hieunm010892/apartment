-- ============================================================================
-- Apartment Management System - PostgreSQL Seed Data
-- ============================================================================

-- 1. Roles & Permissions
INSERT INTO roles (role_id, role_code, role_name, description, is_system, is_active)
VALUES
    (1, 'SUPERADMIN', 'Super Admin / Chủ nhà', 'Toàn quyền quản trị hệ thống', TRUE, TRUE),
    (2, 'MANAGER', 'Quản lý vận hành', 'Quản lý hợp đồng, phòng, thu tiền và vận hành', TRUE, TRUE),
    (3, 'TECH', 'Kỹ thuật / Bảo trì', 'Tiếp nhận và xử lý sự cố thiết bị', TRUE, TRUE),
    (4, 'ACCOUNTANT', 'Kế toán', 'Quản lý sổ quỹ thu chi, hóa đơn và báo cáo tài chính', TRUE, TRUE)
ON CONFLICT (role_code) DO NOTHING;

-- 2. Default Admin User: admin / admin123
-- Hash for 'admin123' using bcrypt or standard compatible string
INSERT INTO users (user_id, username, password_hash, full_name, email, phone, role_id, is_active)
VALUES
    (1, 'admin', '$2a$10$wT8vLqT4H4O9eFkPqD9HGei5A4R9Jc/gCjRklNlKzK4yZlqZlm6.O', 'Quản Trị Viên', 'admin@nhatro.vn', '0909123456', 1, TRUE)
ON CONFLICT (username) DO NOTHING;

-- 3. System Configs
INSERT INTO system_configs (config_key, config_value, description)
VALUES
    ('ABNORMAL_USAGE_PERCENT', '50', 'Tỷ lệ % cảnh báo tiêu thụ điện/nước bất thường so với tháng trước'),
    ('CONTRACT_EXPIRING_DAYS', '30', 'Số ngày cảnh báo trước khi hợp đồng hết hạn'),
    ('SMTP_HOST', 'smtp.gmail.com', 'Máy chủ gửi email thông báo hóa đơn'),
    ('SMTP_PORT', '587', 'Cổng SMTP'),
    ('SMTP_USER', 'billing@nhatro.vn', 'Tài khoản gửi email'),
    ('SMTP_FROM_NAME', 'Ban Quản Lý Nhà Trọ', 'Tên người gửi'),
    ('ZALO_OA_NOTE', 'Hỗ trợ copy tin nhắn và mã VietQR gửi qua Zalo', 'Ghi chú tích hợp Zalo')
ON CONFLICT (config_key) DO NOTHING;

-- 4. Building: NHÀ TRỌ CÔ NÚI with Vietcombank Account 0501000080131
INSERT INTO buildings (
    building_id, building_code, building_name, address, ward, district, city,
    residence_agency, owner_name, owner_id_number, owner_phone,
    total_floors, total_rooms, manager_user_id,
    bank_bin, bank_name, bank_account_no, bank_account_name,
    default_electric_price, default_water_price
)
VALUES (
    1, 'CS01', 'NHÀ TRỌ CÔ NÚI', '123 Đường Số 5, Linh Trung', 'Phường Linh Trung', 'TP. Thủ Đức', 'TP. Hồ Chí Minh',
    'Công an Phường Linh Trung', 'Trần Thị Mỹ Hạnh', '079185009999', '0909888999',
    3, 6, 1,
    '970436', 'Vietcombank - PGD An Lạc', '0501000080131', 'TRAN THI MY HANH',
    3500, 18000
)
ON CONFLICT (building_code) DO NOTHING;

-- 5. Room Types
INSERT INTO room_types (room_type_id, type_code, type_name, default_area, default_price, max_occupants, description)
VALUES
    (1, 'STD', 'Phòng Tiêu chuẩn', 20, 3000000, 2, 'Phòng khép kín cơ bản'),
    (2, 'LOFT', 'Phòng có Gác lửng', 25, 3800000, 3, 'Phòng có gác lửng ban công thoáng mát'),
    (3, 'STUDIO', 'Căn hộ Studio Full nội thất', 35, 5200000, 3, 'Studio cao cấp đầy đủ nội thất')
ON CONFLICT (type_code) DO NOTHING;

-- 6. Rooms
INSERT INTO rooms (room_id, building_id, room_type_id, room_code, room_number, floor_number, area, base_price, max_occupants, status, cleaning_status)
VALUES
    (1, 1, 1, 'CS01-P101', '101', 1, 20, 3000000, 2, 2, 0), -- Đang ở
    (2, 1, 1, 'CS01-P102', '102', 1, 20, 3000000, 2, 0, 0), -- Trống
    (3, 1, 2, 'CS01-P201', '201', 2, 25, 3800000, 3, 2, 0), -- Đang ở
    (4, 1, 2, 'CS01-P202', '202', 2, 25, 3800000, 3, 1, 0), -- Đặt cọc
    (5, 1, 3, 'CS01-P301', '301', 3, 35, 5200000, 3, 0, 1), -- Trống, chưa dọn
    (6, 1, 3, 'CS01-P302', '302', 3, 35, 5200000, 3, 3, 0)  -- Đang bảo trì
ON CONFLICT (building_id, room_number) DO NOTHING;

-- 7. Services
INSERT INTO services (service_id, service_code, service_name, unit_name, pricing_type, default_unit_price, is_system_meter, description)
VALUES
    (1, 'ELECTRIC', 'Tiền điện', 'kWh', 2, 3500, TRUE, 'Điện sinh hoạt theo chỉ số công tơ'),
    (2, 'WATER', 'Tiền nước', 'm3', 2, 18000, TRUE, 'Nước sạch theo chỉ số đồng hồ'),
    (3, 'WIFI', 'Internet / Wifi', 'Tháng', 0, 100000, FALSE, 'Internet cáp quang tốc độ cao cố định'),
    (4, 'PARKING', 'Gửi xe máy', 'Chiếc', 3, 100000, FALSE, 'Phí giữ xe máy theo chiếc'),
    (5, 'CLEANING', 'Vệ sinh / Rác', 'Tháng', 0, 30000, FALSE, 'Thu gom rác và vệ sinh khu vực chung'),
    (6, 'MGMT', 'Phí quản lý', 'Người', 1, 50000, FALSE, 'Phí vận hành thang máy, bảo vệ theo đầu người'),
    (7, 'DISCOUNT', 'Giảm trừ / Khấu trừ', 'Tháng', 4, -200000, FALSE, 'Khoản giảm giá / hỗ trợ tiền phòng')
ON CONFLICT (service_code) DO NOTHING;

-- 8. Assets
INSERT INTO assets (asset_code, asset_name, category, building_id, room_id, purchase_price, condition_status)
VALUES
    ('TS-ML-01', 'Máy lạnh Daikin Inverter 1.5HP', 'Điện lạnh', 1, 1, 8500000, 1),
    ('TS-TL-01', 'Tủ lạnh Panasonic 180L', 'Gia dụng', 1, 1, 5200000, 1),
    ('TS-ML-02', 'Máy lạnh Panasonic 1.5HP', 'Điện lạnh', 1, 3, 8900000, 1),
    ('TS-NL-01', 'Máy nước nóng Ariston 30L', 'Thiết bị vệ sinh', 1, 3, 3200000, 1),
    ('TS-KT-01', 'Khóa vân tay thông minh Kaadas', 'An ninh', 1, 3, 4500000, 1)
ON CONFLICT (asset_code) DO NOTHING;

-- 9. Sample Tenants (with full CT01 fields)
INSERT INTO tenants (
    tenant_id, tenant_code, full_name, date_of_birth, gender,
    id_card_number, id_card_issue_date, id_card_issue_place, phone, email,
    permanent_address, hometown, ethnicity, nationality, occupation, vehicle_plate,
    default_relationship_with_head, residence_reg_status
)
VALUES
    (1, 'KH001', 'Nguyễn Thị Hoa', '1995-06-15', 'Nữ', '079195001234', '2021-05-10', 'Cục Cảnh sát QLHC về TTXH', '0912345678', 'hoanguyen@gmail.com', 'Xã Hòa Phú, Huyện Củ Chi, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Việt Nam', 'Nhân viên văn phòng', '59Y1-123.45', 'Người thuê trọ', 1),
    (2, 'KH002', 'Trần Văn Minh', '1990-10-20', 'Nam', '079090005678', '2021-08-15', 'Cục Cảnh sát QLHC về TTXH', '0909123456', 'tranvanminh@gmail.com', '124 Phố Lê Lợi, TP. Nam Định, Tỉnh Nam Định', 'Nam Định', 'Kinh', 'Việt Nam', 'Kỹ sư phần mềm', '29B1-888.88', 'Chủ hộ phòng trọ', 1),
    (3, 'KH003', 'Lê Thị Thu', '1992-03-12', 'Nữ', '079192003456', '2022-01-20', 'Cục Cảnh sát QLHC về TTXH', '0988776655', 'lethithu@gmail.com', '124 Phố Lê Lợi, TP. Nam Định, Tỉnh Nam Định', 'Nam Định', 'Kinh', 'Việt Nam', 'Kế toán viên', '29B1-999.99', 'Vợ', 1),
    (4, 'KH004', 'Trần Bảo An', '2018-09-05', 'Nam', '079218007890', '2023-04-12', 'Cục Cảnh sát QLHC về TTXH', '', '', '124 Phố Lê Lợi, TP. Nam Định, Tỉnh Nam Định', 'Nam Định', 'Kinh', 'Việt Nam', 'Học sinh', '', 'Con', 1)
ON CONFLICT (tenant_code) DO NOTHING;

-- 10. Sample Contracts
INSERT INTO contracts (
    contract_id, contract_code, building_id, room_id, primary_tenant_id,
    start_date, end_date, rent_price, deposit_amount, deposit_paid,
    initial_electric_index, initial_water_index, status
)
VALUES
    (1, 'HD2026-P101', 1, 1, 1, '2026-01-01', '2026-12-31', 3000000, 3000000, 3000000, 100, 12, 1),
    (2, 'HD2026-P201', 1, 3, 2, '2026-01-01', '2026-12-31', 3800000, 3800000, 3800000, 120, 15, 1)
ON CONFLICT (contract_code) DO NOTHING;

-- Roommates in Contract 2 (Family of 3 in Room 201)
INSERT INTO contract_tenants (contract_id, tenant_id, is_primary_tenant, relationship_with_head)
VALUES
    (2, 2, TRUE, 'Chủ hộ phòng trọ'),
    (2, 3, FALSE, 'Vợ'),
    (2, 4, FALSE, 'Con')
ON CONFLICT DO NOTHING;

-- 11. Sample Meter Readings
INSERT INTO meter_readings (
    reading_id, room_id, billing_month, billing_year,
    electric_old, electric_new, electric_usage, electric_unit_price,
    water_old, water_new, water_usage, water_unit_price, is_billed
)
VALUES
    (1, 1, 10, 2026, 100, 185, 85, 3500, 12, 18, 6, 18000, TRUE),
    (2, 3, 10, 2026, 120, 120, 0, 3500, 15, 15, 0, 18000, TRUE)
ON CONFLICT (room_id, billing_year, billing_month) DO NOTHING;

-- 12. Sample Invoices for October 2026
-- Invoice 1: Room 101 with 200k discount, Paid
INSERT INTO invoices (
    invoice_id, invoice_code, contract_id, room_id, tenant_id, reading_id,
    billing_month, billing_year, issue_date, due_date,
    room_amount, electric_amount, water_amount, service_amount, other_amount, discount_amount,
    total_amount, paid_amount, status, notes
)
VALUES (
    1, 'HD202610-101', 1, 1, 1, 1,
    10, 2026, '2026-10-28', '2026-11-05',
    3000000, 297500, 108000, 180000, 0, 200000,
    3385500, 3385500, 2, 'Đã thanh toán đủ chuyển khoản'
)
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO invoice_details (invoice_id, item_type, item_name, quantity, unit_name, unit_price, amount)
VALUES
    (1, 'ROOM', 'Tiền thuê phòng 101 (Tháng 10/2026)', 1, 'Tháng', 3000000, 3000000),
    (1, 'ELECTRIC', 'Tiền điện', 85, 'kWh', 3500, 297500),
    (1, 'WATER', 'Tiền nước', 6, 'm3', 18000, 108000),
    (1, 'SERVICE', 'Internet / Wifi', 1, 'Tháng', 100000, 100000),
    (1, 'SERVICE', 'Phí quản lý', 1, 'Người', 50000, 50000),
    (1, 'SERVICE', 'Vệ sinh / Rác', 1, 'Tháng', 30000, 30000),
    (1, 'DISCOUNT', 'Giảm trừ / Hỗ trợ tiền phòng', 1, 'Tháng', -200000, -200000)
ON CONFLICT DO NOTHING;

-- Invoice 2: Room 201 with 250k discount, Unpaid (as requested in demo)
INSERT INTO invoices (
    invoice_id, invoice_code, contract_id, room_id, tenant_id, reading_id,
    billing_month, billing_year, issue_date, due_date,
    room_amount, electric_amount, water_amount, service_amount, other_amount, discount_amount,
    total_amount, paid_amount, status, notes
)
VALUES (
    2, 'HD202610-201', 2, 3, 2, 2,
    10, 2026, '2026-10-28', '2026-11-05',
    3800000, 0, 0, 480000, 0, 250000,
    4030000, 0, 0, 'Chờ thanh toán chuyển khoản VietQR'
)
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO invoice_details (invoice_id, item_type, item_name, old_index, new_index, quantity, unit_name, unit_price, amount)
VALUES
    (2, 'ROOM', 'Tiền thuê phòng 201 (Tháng 10/2026)', NULL, NULL, 1, 'Tháng', 3800000, 3800000),
    (2, 'ELECTRIC', 'Tiền điện', 120, 120, 0, 'kWh', 3500, 0),
    (2, 'WATER', 'Tiền nước', 15, 15, 0, 'm3', 18000, 0),
    (2, 'SERVICE', 'Gửi xe máy (2 xe)', NULL, NULL, 2, 'Chiếc', 100000, 200000),
    (2, 'SERVICE', 'Internet / Wifi', NULL, NULL, 1, 'Tháng', 100000, 100000),
    (2, 'SERVICE', 'Phí quản lý (3 người)', NULL, NULL, 3, 'Người', 50000, 150000),
    (2, 'SERVICE', 'Vệ sinh / Rác', NULL, NULL, 1, 'Tháng', 30000, 30000),
    (2, 'DISCOUNT', 'Giảm trừ', NULL, NULL, 1, 'Tháng', -250000, -250000)
ON CONFLICT DO NOTHING;

-- Update sequences to avoid primary key conflicts
SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('buildings_building_id_seq', (SELECT MAX(building_id) FROM buildings));
SELECT setval('room_types_room_type_id_seq', (SELECT MAX(room_type_id) FROM room_types));
SELECT setval('rooms_room_id_seq', (SELECT MAX(room_id) FROM rooms));
SELECT setval('services_service_id_seq', (SELECT MAX(service_id) FROM services));
SELECT setval('assets_asset_id_seq', (SELECT MAX(asset_id) FROM assets));
SELECT setval('tenants_tenant_id_seq', (SELECT MAX(tenant_id) FROM tenants));
SELECT setval('contracts_contract_id_seq', (SELECT MAX(contract_id) FROM contracts));
SELECT setval('meter_readings_reading_id_seq', (SELECT MAX(reading_id) FROM meter_readings));
SELECT setval('invoices_invoice_id_seq', (SELECT MAX(invoice_id) FROM invoices));
