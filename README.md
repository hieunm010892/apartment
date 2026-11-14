# APARTMENT MANAGEMENT ERP - WEB APPLICATION (NEXT.JS & POSTGRESQL)

Hệ thống Quản lý Tòa nhà & Nhà trọ thông minh toàn diện (Apartment Management ERP WebApp) được chuyển đổi từ nền tảng WinForms sang kiến trúc hiện đại Web Fullstack: **Next.js 14 App Router, TypeScript, Tailwind CSS, PostgreSQL và VietQR tiêu chuẩn NAPAS**.

Được tối ưu 100% để kết nối với **GitHub** và deploy tự động lên **Vercel**.

---

## 🚀 ĐIỂM NỔI BẬT & CÁC TÍNH NĂNG CHÍNH

1. **Sơ đồ phòng (PMS Room Rack)**:
   - Trực quan hóa toàn bộ tầng và phòng với màu sắc phân biệt trạng thái: **Đang ở**, **Phòng trống**, **Bảo trì**, **Vệ sinh**.
   - Thống kê tỷ lệ lấp đầy, doanh thu ước tính và số lượng phòng cần dọn dẹp.

2. **Quản lý Tòa nhà & Tài khoản Ngân hàng**:
   - Cấu hình Tòa nhà "NHÀ TRỌ CÔ NÚI", ban quản lý, thông tin pháp lý.
   - Số tài khoản ngân hàng thụ hưởng chính thức: **`0501000080131`** tại **Vietcombank** (Chủ TK: **TRAN THI MY HANH**, BIN: `970436`).

3. **Quản lý Khách thuê & Khai báo Cư trú (Mẫu CT01)**:
   - Hồ sơ nhân khẩu chi tiết, căn cước công dân, hộ khẩu thường trú, nơi làm việc.
   - **Bản in Mẫu CT01 (Tờ khai thay đổi thông tin cư trú)** chuẩn Bộ Công An: Có **12 ô vuông riêng biệt** cho từng số trong số CCCD, bảng kê khai người cùng chuyển đến và phần ký tên chủ hộ / người kê khai.

4. **Quản lý Hợp đồng thuê & Check-in / Check-out**:
   - Quản lý hợp đồng có thời hạn, tiền cọc bảo đảm, người đại diện.
   - Quy trình Check-out và thanh lý hợp đồng: Tự động trừ tiền điện, nước cuối kỳ và hư hỏng tài sản, tính số tiền cọc thực tế hoàn trả cho khách.

5. **Ghi chỉ số Điện & Nước hàng tháng**:
   - Nhập chỉ số cũ và mới theo từng phòng định kỳ.
   - Tự động tính số tiêu thụ (kWh điện, m³ nước).
   - Kiểm tra logic: Ngăn chặn nhập chỉ số mới < cũ, tự động gắn cảnh báo đỏ **"Đột biến cao"** khi tiêu thụ vượt ngưỡng.

6. **Hóa đơn & Thanh toán VietQR chuẩn**:
   - **Dòng thông tin chỉ số đầu hóa đơn**: `Chỉ số Điện: Cũ 120 → Mới 120 (0 kWh) | Chỉ số Nước: Cũ 15 → Mới 15 (0 m3)`.
   - **Bảng chi tiết khoản thu**: Tiền phòng, Tiền điện, Tiền nước, Phí quản lý, Rác, Wifi... Đơn giá và thành tiền định dạng dấu phẩy nghìn chuẩn (`5,640,000 đ`).
   - **4 Dòng tổng kết tài chính**:
     1. **Tổng cộng**: Tổng tiền gốc trước ưu đãi.
     2. **Tổng cộng sau giảm trừ (Giảm trừ: -...đ)**: Áp dụng các khoản chiết khấu/ưu đãi.
     3. **Đã thanh toán**: Số tiền khách đã nộp.
     4. **Còn lại cần thanh toán**: Công nợ còn lại.
   - **Mã VietQR động**: Tự động mã hóa STK `0501000080131` kèm số tiền chính xác và cú pháp chuyển khoản (`THANH TOAN HD...`), khách hàng mở bất kỳ App ngân hàng nào cũng quét được ngay.
   - Hỗ trợ in hóa đơn khổ giấy **A4 tiêu chuẩn** và xuất dữ liệu ra file **Excel (.xlsx)**.

7. **Sổ quỹ Thu - Chi & Báo cáo Dòng tiền**:
   - Quản lý phiếu thu tiền nhà/cọc và phiếu chi sửa chữa, bảo trì, tiền điện/nước tổng.
   - Cân đối tồn quỹ thực tế (Doanh thu - Chi phí).

8. **Tài sản & Sự cố bảo trì**:
   - Quản lý danh mục trang thiết bị (máy lạnh, tủ lạnh, khóa thông minh...) theo từng phòng.
   - Tiếp nhận báo hỏng, phân công thợ sửa và hạch toán chi phí vật tư, công thợ.

9. **Phân quyền người dùng & Nhật ký Audit Log**:
   - Phân quyền RBAC: SuperAdmin (Chủ nhà), Quản lý vận hành (Manager), Kỹ thuật (Technician).
   - Audit trail ghi nhận lịch sử thay đổi giá, phát hành hóa đơn, thu tiền, kèm thời gian và địa chỉ IP.

---

## 🗄️ THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL

Cơ sở dữ liệu được chuẩn hóa tại thư mục `database/`:
- **`database/schema.sql`**: Chứa toàn bộ cấu trúc bảng DDL PostgreSQL 12+:
  - `roles`, `users`, `system_configs`, `buildings`, `room_types`, `rooms`, `services`, `room_services`, `assets`, `tenants`, `roommates`, `contracts`, `contract_services`, `meter_readings`, `invoices`, `invoice_details`, `payments`, `cash_transactions`, `maintenance_tickets`, `announcements`, `audit_logs`...
  - Sử dụng các cột tự động tính toán chuẩn PostgreSQL: `remaining_amount GENERATED ALWAYS AS (final_amount - paid_amount) STORED`.
- **`database/seed.sql`**: Chứa toàn bộ dữ liệu mẫu khởi tạo (Tòa nhà Cô Núi, STK Vietcombank, phòng 101 - 302, chỉ số điện nước và hóa đơn mẫu tháng 10/2026).

---

## 💻 CÔNG NGHỆ ÁP DỤNG

- **Framework**: Next.js 14 (App Router)
- **Ngôn ngữ**: TypeScript 5, React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Cơ sở dữ liệu**: PostgreSQL (`pg` Connection Pool)
- **Thanh toán**: VietQR Standard NAPAS Payload Generator & Canvas
- **Xuất dữ liệu**: SheetJS (`xlsx`)

> **Cơ chế Dual-Mode thông minh:**
> Hệ thống được thiết kế với cơ chế Fallback tự động:
> - Khi cấu hình biến môi trường `DATABASE_URL`, hệ thống sẽ truy vấn trực tiếp vào PostgreSQL.
> - Khi chưa có Database (chạy demo hoặc preview tức thì trên Vercel), hệ thống tự động phục vụ bằng **In-Memory Mock Store** với toàn bộ dữ liệu mẫu đầy đủ, giúp website có thể chạy ngay lập tức mà không bao giờ bị lỗi kết nối!

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL

### 1. Yêu cầu môi trường
- Node.js version 18.x trở lên
- npm version 9.x trở lên
- (Tùy chọn) PostgreSQL Server nếu muốn lưu dữ liệu DB thực tế

### 2. Cài đặt các gói phụ thuộc
```bash
cd D:\NBC\SourceCode\SC_ERP_GIT_Dev20_1_AI\apartment_management_webapp
npm install
```

### 3. Cấu hình biến môi trường (Tùy chọn)
Tạo file `.env.local` từ mẫu `.env.example`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ApartmentManagement?sslmode=disable
NEXTAUTH_SECRET=your_super_secret_jwt_key
PORT=3000
```

### 4. Khởi tạo Database PostgreSQL (Nếu dùng DB thực tế)
```bash
# Tạo database
createdb -U postgres ApartmentManagement

# Chạy DDL Schema
psql -U postgres -d ApartmentManagement -f database/schema.sql

# Nạp dữ liệu mẫu Seed Data
psql -U postgres -d ApartmentManagement -f database/seed.sql
```

### 5. Khởi chạy Server phát triển
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`
- **Tài khoản**: `admin`
- **Mật khẩu**: `admin123`

### 6. Build bản Production
```bash
npm run build
npm run start
```

---

## ☁️ HƯỚNG DẪN DEPLOY LÊN VERCEL QUA GITHUB

Vercel là nền tảng điện toán đám mây tối ưu nhất cho Next.js, hỗ trợ tự động build và cấp phát SSL HTTPS miễn phí.

### Bước 1: Khởi tạo Git và Push code lên GitHub
Mở Terminal trong thư mục `apartment_management_webapp`:
```bash
cd D:\NBC\SourceCode\SC_ERP_GIT_Dev20_1_AI\apartment_management_webapp

# 1. Khởi tạo git repository
git init

# 2. Thêm tất cả file
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Initial commit Apartment Management ERP WebApp"

# 4. Đổi tên branch chính thành main
git branch -M main

# 5. Liên kết với repository GitHub của bạn (thay bằng URL GitHub của bạn)
git remote add origin https://github.com/<your-username>/apartment-management-webapp.git

# 6. Đẩy code lên GitHub
git push -u origin main
```

### Bước 2: Kết nối và Deploy trên Vercel
1. Đăng nhập vào [Vercel](https://vercel.com) (bằng tài khoản GitHub của bạn).
2. Nhấn nút **"Add New..."** ➔ Chọn **"Project"**.
3. Trong danh sách repositories GitHub, tìm repository `apartment-management-webapp` và nhấn **"Import"**.
4. Cấu hình cấu hình dự án:
   - **Framework Preset**: `Next.js` (Vercel tự động nhận diện).
   - **Root Directory**: `./` (để mặc định).
   - **Build Command**: `next build` (để mặc định).
   - **Output Directory**: `.next` (để mặc định).
5. **Cấu hình Environment Variables (Tùy chọn)**:
   - Nếu bạn dùng Cloud PostgreSQL (ví dụ **Vercel Postgres**, **Supabase**, hoặc **Neon**):
     - Thêm biến `DATABASE_URL`: `postgres://user:password@host:port/dbname?sslmode=require`.
   - Nếu chưa cấu hình `DATABASE_URL`, hệ thống sẽ tự động chạy chế độ **Embedded Demo Mode**, cho phép người dùng trải nghiệm đầy đủ tất cả các tính năng!
6. Nhấn nút **"Deploy"**.
7. Quá trình build sẽ hoàn tất trong khoảng 1-2 phút. Bạn sẽ nhận được đường link website chính thức dạng: `https://apartment-management-webapp.vercel.app`.
