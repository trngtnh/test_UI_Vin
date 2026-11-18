import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/common/Toast';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

export const metadata: Metadata = {
  title: 'VinFast O2O Advisor · Hệ thống Tư vấn Chọn xe & Dự toán Chi phí Trực tuyến',
  description: 'AI Agent Tư vấn chọn xe ô tô điện VinFast theo nhu cầu & ngân sách toàn quốc (VFO2O-01)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full overflow-hidden`}>
      <body className={`${beVietnamPro.className} h-full flex flex-col overflow-hidden bg-[#eef2f6] text-slate-900 selection:bg-brand-accent selection:text-white`}>
        <Header />
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
        <Toast />
      </body>
    </html>
  );
}
