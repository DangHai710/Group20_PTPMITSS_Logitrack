// File: src/app/(dashboard)/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import apiService from '@/services/api';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingRequests: 0,
    activePOs: 0,
    totalSites: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentPOs, setRecentPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [items, requests, pos, sites] = await Promise.all([
          apiService.getItems(),
          apiService.getRequests(),
          apiService.getPOs(),
          apiService.getSites()
        ]);

        setStats({
          totalItems: items.length,
          pendingRequests: requests.filter(r => r.trangThai === 'CHO_XU_LY').length,
          activePOs: pos.filter(p => p.trangThaiPo === 'DANG_GIAO').length,
          totalSites: sites.length,
        });

        setRecentRequests(requests.slice(0, 4));
        setRecentPOs(pos.slice(0, 4));
      } catch (err) {
        console.error('Lỗi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Xin chào, Chào mừng quay trở lại!</h2>
          <p className="text-sm text-slate-500 mt-1">Dưới đây là thông số vận hành tổng quan của hệ thống LogiTrack hôm nay.</p>
        </div>
        <div className="text-sm font-semibold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100">
          Ngày làm việc: 30/05/2026
        </div>
      </div>

      {/* 1. KPI Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục Vật tư</CardTitle>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-extrabold text-slate-800">{stats.totalItems}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Vật tư hoạt động</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yêu cầu chờ xử lý</CardTitle>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-extrabold text-slate-800">{stats.pendingRequests}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Cần phân bổ tối ưu</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn hàng PO Inbound</CardTitle>
            <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-extrabold text-slate-800">{stats.activePOs}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Đang giao từ Sites ngoài</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sites Đối tác</CardTitle>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-extrabold text-slate-800">{stats.totalSites}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Đối tác Logistics cung ứng</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Content Sections - Split Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Section: Recent requests */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Hoạt động Yêu cầu gần đây</CardTitle>
            <CardDescription>Các yêu cầu đặt hàng mới nhất được tạo bởi Bộ phận Bán hàng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 font-semibold">Chưa có yêu cầu đặt hàng nào.</div>
            ) : (
              recentRequests.map((req) => (
                <div key={req.maYc} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-700 block">{req.maYc}</span>
                    <span className="text-xs text-slate-400 font-semibold block">Tạo bởi: {req.nguoiTao}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs text-slate-400 font-semibold">{new Date(req.ngayTao).toLocaleDateString('vi-VN')}</span>
                    {req.trangThai === 'CHO_XU_LY' ? (
                      <Badge variant="warning">Chờ xử lý</Badge>
                    ) : (
                      <Badge variant="success">Đã xử lý</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Section: Recent POs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Vận tải PO Inbound</CardTitle>
            <CardDescription>Các đơn đặt hàng PO xuất khẩu đang được vận chuyển.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPOs.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 font-semibold">Chưa có đơn hàng PO nào.</div>
            ) : (
              recentPOs.map((po) => (
                <div key={po.maPo} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-700 block">{po.maPo}</span>
                    <span className="text-xs text-slate-400 font-semibold block">Site: {po.importSite?.tenSite || po.maSite}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={po.phuongTienVanChuyen === 'ship delivery' ? 'success' : 'warning'}>
                      {po.phuongTienVanChuyen === 'ship delivery' ? 'Tàu thủy' : 'Máy bay'}
                    </Badge>
                    {po.trangThaiPo === 'DANG_GIAO' ? (
                      <Badge variant="info">Đang giao</Badge>
                    ) : po.trangThaiPo === 'HOAN_THANH' ? (
                      <Badge variant="success">Hoàn thành</Badge>
                    ) : (
                      <Badge variant="danger">Có chênh lệch</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
