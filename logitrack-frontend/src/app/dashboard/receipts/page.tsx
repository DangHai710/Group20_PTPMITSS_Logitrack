// File: src/app/(dashboard)/receipts/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, getStatusBadge } from '@/components/ui/Badge';
import { DonDatHang } from '@/types';
import apiService from '@/services/api';

export default function POInboundList() {
  const [pos, setPos] = useState<DonDatHang[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPOs() {
      try {
        const data = await apiService.getPOs();
        setPos(data);
      } catch (err) {
        console.error('Lỗi tải danh sách đơn PO:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPOs();
  }, []);

  const filteredPOs = pos.filter((po) =>
    po.maPo.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Đơn đặt hàng PO giao tới kho</h2>
        <p className="text-sm text-slate-500 mt-1">Theo dõi các lô hàng nhập khẩu đang trên đường vận chuyển để chuẩn bị kiểm đếm và nhận hàng.</p>
      </div>

      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-slate-800">Bộ lọc & Tra cứu</CardTitle>
          <div className="mt-4 flex max-w-md w-full">
            <Input
              id="search-po"
              type="text"
              placeholder="Nhập mã vận đơn PO cần kiểm kho..."
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
          {filteredPOs.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400 font-semibold bg-slate-50/50 mx-6 rounded-2xl border border-dashed border-slate-200">
              Không tìm thấy đơn đặt hàng PO nào!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-8">Mã PO</TableHead>
                  <TableHead>Site Cung Cấp</TableHead>
                  <TableHead>Phương Tiện Vận Chuyển</TableHead>
                  <TableHead>Ngày Đặt Hàng</TableHead>
                  <TableHead>Trạng Thái Đơn</TableHead>
                  <TableHead className="pr-8 text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.map((po) => (
                  <TableRow key={po.maPo}>
                    <TableCell className="pl-8 font-bold text-slate-800 tracking-tight">{po.maPo}</TableCell>
                    <TableCell>{po.importSite?.tenSite || po.maSite}</TableCell>
                    <TableCell>
                      {getStatusBadge(po.phuongTienVanChuyen)}
                    </TableCell>
                    <TableCell>{new Date(po.ngayDat).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      {getStatusBadge(po.trangThaiPo)}
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      {po.trangThaiPo === 'DANG_GIAO' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/dashboard/receipts/${po.maPo}`)}
                          className="bg-indigo-950 hover:bg-slate-900 shadow-sm shadow-slate-950/20 font-bold"
                        >
                          Kiểm nhận hàng
                          <svg className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/dashboard/receipts/${po.maPo}`)}
                          className="font-bold"
                        >
                          Xem đối soát
                        </Button>
                      )}
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
