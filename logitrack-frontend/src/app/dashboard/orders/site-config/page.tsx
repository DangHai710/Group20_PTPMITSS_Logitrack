// File: src/app/(dashboard)/orders/site-config/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ImportSite } from '@/types';
import apiService from '@/services/api';

export default function ImportSitesCatalog() {
  const [sites, setSites] = useState<ImportSite[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSites() {
      try {
        const data = await apiService.getSites();
        setSites(data);
      } catch (err) {
        console.error('Lỗi tải danh mục Site:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSites();
  }, []);

  const filteredSites = sites.filter(
    (site) =>
      site.maSite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.tenSite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Quản lý Sites Đối tác Nước ngoài</h2>
        <p className="text-sm text-slate-500 mt-1">Lưu trữ và cấu hình Lead-time vận chuyển quốc tế của các kho/đối tác cung ứng.</p>
      </div>

      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-slate-800">Thông tin Tuyến đường logistics</CardTitle>
          <div className="mt-4 flex max-w-md w-full">
            <Input
              id="search-site"
              type="text"
              placeholder="Nhập mã Site đối tác hoặc tên hub..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {filteredSites.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400 font-semibold bg-slate-50/50 mx-6 rounded-2xl border border-dashed border-slate-200">
              Không tìm thấy đối tác nào phù hợp!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-8">Mã Site</TableHead>
                  <TableHead>Tên Hub Đối Tác</TableHead>
                  <TableHead className="text-center">Thời gian đi Tàu (Ship)</TableHead>
                  <TableHead className="text-center">Thời gian đi Máy bay (Air)</TableHead>
                  <TableHead className="pr-8 text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site) => (
                  <TableRow key={site.maSite}>
                    <TableCell className="pl-8 font-bold text-slate-800 tracking-tight">{site.maSite}</TableCell>
                    <TableCell>{site.tenSite}</TableCell>
                    <TableCell className="text-center font-semibold text-emerald-600 bg-emerald-50 rounded-xl px-2.5 py-1.5 mx-auto w-fit">
                      {site.soNgayDiTau} ngày
                    </TableCell>
                    <TableCell className="text-center font-semibold text-amber-600 bg-amber-50 rounded-xl px-2.5 py-1.5 mx-auto w-fit">
                      {site.soNgayDiMayBay} ngày
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/orders/site-config/${site.maSite}`)}
                        className="font-bold flex items-center gap-1.5 ml-auto"
                      >
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cập nhật tuyến
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
