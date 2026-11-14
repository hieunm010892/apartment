import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apartment Management ERP - Hệ thống Quản lý Nhà trọ & Căn hộ',
  description: 'Hệ thống Quản lý Nhà trọ & Căn hộ Dịch vụ Chuyên nghiệp với PostgreSQL và Vercel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
