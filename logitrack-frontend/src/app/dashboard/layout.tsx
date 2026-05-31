// File: src/app/(dashboard)/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: ('SALES' | 'ORDER' | 'INVENTORY')[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'SALES' | 'ORDER' | 'INVENTORY' | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Đọc thông tin từ LocalStorage
    const userRole = localStorage.getItem('userRole') as 'SALES' | 'ORDER' | 'INVENTORY';
    const userEmail = localStorage.getItem('userEmail');

    if (!userRole || !userEmail) {
      toast('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.', 'warning');
      router.push('/');
    } else {
      setRole(userRole);
      setEmail(userEmail);
      setLoading(false);
    }
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    toast('Đã đăng xuất khỏi hệ thống.', 'info');
    router.push('/');
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Tổng quan Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      roles: ['SALES', 'ORDER', 'INVENTORY'],
    },
    // PHÂN HỆ SALES
    {
      title: 'Danh mục Mặt hàng',
      path: '/dashboard/inventory',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['SALES'],
    },
    {
      title: 'Khai báo Vật tư mới',
      path: '/dashboard/inventory/add',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      roles: ['SALES'],
    },
    {
      title: 'Lập Yêu cầu đặt hàng',
      path: '/dashboard/inventory/add-request',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: ['SALES'],
    },
    // DÙNG CHUNG CỦA SALES VÀ ORDER (Hải)
    {
      title: 'Yêu cầu Đặt hàng',
      path: '/dashboard/orders',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      roles: ['SALES', 'ORDER'],
    },
    // PHÂN HỆ ORDER DEPT (Hải)
    {
      title: 'Quản lý Site Đối tác',
      path: '/dashboard/orders/site-config',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      roles: ['ORDER'],
    },
    // PHÂN HỆ KHO (Dương)
    {
      title: 'Danh sách PO đến kho',
      path: '/dashboard/receipts',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      roles: ['SALES', 'ORDER', 'INVENTORY'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => role && item.roles.includes(role));

  const getRoleBadgeVariant = (userRole: string) => {
    switch (userRole) {
      case 'SALES': return 'primary';
      case 'ORDER': return 'purple';
      case 'INVENTORY': return 'info';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (userRole: string) => {
    switch (userRole) {
      case 'SALES': return 'Bộ phận Bán hàng';
      case 'ORDER': return 'Đặt hàng Quốc tế';
      case 'INVENTORY': return 'Quản lý Kho bãi';
      default: return userRole;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu phiên làm việc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* 1. Sidebar Container */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        {/* Header Logo */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold text-slate-800 tracking-tight block">LogiTrack B2B</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Enterprise Hub</span>
          </div>
        </div>

        {/* User profile section */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản làm việc</span>
            <span className="text-sm font-bold text-slate-700 truncate">{email}</span>
            {role && (
              <Badge variant={getRoleBadgeVariant(role)} className="w-fit mt-1">
                {getRoleDisplayName(role)}
              </Badge>
            )}
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          <span className="block px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chức năng</span>
          {filteredMenuItems.map((item) => {
            const isActive = (() => {
              if (pathname === item.path) return true;
              if (item.path === '/dashboard/orders') {
                return pathname.startsWith('/dashboard/orders/') && !pathname.startsWith('/dashboard/orders/site-config');
              }
              if (item.path === '/dashboard/orders/site-config') {
                return pathname.startsWith('/dashboard/orders/site-config/');
              }
              if (item.path === '/dashboard/receipts') {
                return pathname.startsWith('/dashboard/receipts/');
              }
              if (item.path.startsWith('/dashboard/inventory')) {
                return false;
              }
              return pathname.startsWith(item.path) && item.path !== '/dashboard';
            })();
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.path === '/dashboard/receipts'
                  ? (role === 'INVENTORY' ? 'Danh sách PO đến kho' : 'Theo dõi đơn hàng PO')
                  : item.title}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
          >
            <span className="text-slate-400 group-hover:text-rose-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Đăng xuất hệ thống
          </button>
        </div>
      </aside>

      {/* 2. Main Layout Content Area */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Header bar */}
        <header className="flex h-20 items-center justify-between bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
            {pathname === '/dashboard' && 'Inventory Dashboard'}
            {pathname.includes('/inventory') && 'Quản lý Kho & Vật tư'}
            {pathname.includes('/orders') && 'Quản lý Đơn đặt hàng PO'}
            {pathname.includes('/receipts') && 'Đối soát Kiểm nhận nhập kho'}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            Hệ thống chạy trên port: 8080 (API) / 3000 (UI)
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
