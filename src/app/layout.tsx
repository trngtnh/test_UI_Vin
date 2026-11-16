import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'VinFast O2O Advisor — Hệ thống Tư vấn Chọn xe & Dự toán Chi phí Trực tuyến',
  description: 'AI Agent Tư vấn chọn xe ô tô điện VinFast theo nhu cầu & ngân sách tại Hà Nội (VFO2O-01)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full overflow-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex flex-col overflow-hidden bg-slate-50 text-slate-900 selection:bg-brand-accent selection:text-white">
        <Header />
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
        <Toast />
      </body>
    </html>
  );
}
