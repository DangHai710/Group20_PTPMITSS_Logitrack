import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LogiTrack B2B - Hệ thống Phân bổ Logistics Tối ưu",
  description: "Giải pháp tối ưu hóa phân bổ chuỗi cung ứng nhập khẩu B2B và đối soát kho tích hợp dành cho doanh nghiệp logistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-800">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

