// File: src/app/(dashboard)/receipts/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import apiService from '@/services/api';

interface ReceiptLineState {
  maHang: string;
  tenHang: string;
  soLuongDat: number;
  soLuongThucNhan: number;
  ketQuaKiemNhan: string;
  donViTinh: string;
}

export default function POReceiptAdjustment() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const id = params.id as string;

  const [poHeader, setPoHeader] = useState<any>(null);
  const [lines, setLines] = useState<ReceiptLineState[]>([]);
  const [ghiChuChenhLech, setGhiChuChenhLech] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('userRole'));
    async function loadPODetails() {
      try {
        const data = await apiService.getPODetails(id);
        setPoHeader(data);
        
        // Khởi tạo các dòng đối soát với giá trị thực nhận mặc định bằng số lượng đặt
        const initialLines = data.items.map((item: any) => ({
          maHang: item.maHang,
          tenHang: item.tenHang,
          soLuongDat: item.soLuongDat,
          soLuongThucNhan: item.soLuongDat, // Mặc định bằng số lượng đặt
          ketQuaKiemNhan: 'Đủ hàng',         // Mặc định là đủ hàng
          donViTinh: item.donViTinh,
        }));
        setLines(initialLines);
      } catch (err) {
        console.error('Lỗi tải chi tiết PO:', err);
        toast('Không tìm thấy đơn hàng PO này!', 'error');
        router.push('/dashboard/receipts');
      } finally {
        setLoading(false);
      }
    }
    loadPODetails();
  }, [id, router, toast]);

  // Cập nhật giá trị dòng
  const handleUpdateLine = (index: number, field: keyof ReceiptLineState, value: any) => {
    const updated = [...lines];
    if (field === 'soLuongThucNhan') {
      (updated[index] as any)[field] = Math.max(0, parseInt(value) || 0);
      
      // Tự động suy luận kết quả kiểm nhận dựa trên số lượng nhập vào
      const dat = updated[index].soLuongDat;
      const thuc = (updated[index] as any)[field];
      if (thuc === dat) {
        updated[index].ketQuaKiemNhan = 'Đủ hàng';
      } else if (thuc < dat) {
        updated[index].ketQuaKiemNhan = 'Thiếu hàng';
      } else {
        updated[index].ketQuaKiemNhan = 'Đủ hàng'; // Hoặc Sai hàng
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra chênh lệch và bắt buộc nhập ghi chú giải trình (UC014)
    const hasDiscrepancy = lines.some(l => l.soLuongThucNhan !== l.soLuongDat);
    if (hasDiscrepancy && !ghiChuChenhLech.trim()) {
      toast('Phát hiện có sự chênh lệch số lượng hàng hóa! Vui lòng nhập ghi chú giải trình chênh lệch trước khi xác nhận nhập kho.', 'error');
      return;
    }

    setSubmitting(true);
    toast('Đang đồng bộ dữ liệu đối soát sang hệ thống kho ngoài...', 'info');

    try {
      // Gọi API POST /api/receipts/confirm lên Backend
      const response = await apiService.confirmReceipt({
        maPO: id,
        ghiChuChenhLech: ghiChuChenhLech.trim(),
        items: lines.map(l => ({
          maHang: l.maHang,
          soLuongThucNhan: l.soLuongThucNhan,
          ketQuaKiemNhan: l.ketQuaKiemNhan,
        }))
      });

      toast(response.message || 'Đối soát kiểm nhận nhập kho hoàn tất!', 'success');
      setTimeout(() => {
        router.push('/dashboard/receipts');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Gặp sự cố kết nối máy chủ Backend!';
      
      // Bắn thông báo toast lỗi màu đỏ nếu xảy ra rollback
      toast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const checkResultOptions = [
    { value: 'Đủ hàng', label: 'Đủ hàng (Khớp 100%)' },
    { value: 'Thiếu hàng', label: 'Thiếu hàng (Shortage)' },
    { value: 'Sai hàng', label: 'Sai mặt hàng (Wrong SKU)' },
    { value: 'Hàng lỗi', label: 'Hàng hỏng/Lỗi (Damaged)' },
  ];

  if (loading) {
    return (
      <div className="flex h-[55vh] w-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!poHeader) return null;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/receipts')} className="p-2.5 rounded-xl border border-slate-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {role === 'INVENTORY' ? 'Đối soát kiểm nhận nhập kho' : 'Chi tiết Đơn đặt hàng PO'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'INVENTORY'
              ? 'Đếm số lượng thực tế nhận được tại cửa kho và đối chiếu với vận đơn gốc.'
              : 'Thông tin mặt hàng đặt, tồn kho đối tác và trạng thái vận chuyển PO ngoại nhập.'}
          </p>
        </div>
      </div>

      {/* 1. Header PO Document Info Card */}
      <Card className="border-slate-200/50 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Thông tin Vận đơn gốc PO: {poHeader.maPO}</CardTitle>
            {getStatusBadge(poHeader.trangThaiPo)}
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-4 px-8 pb-8 pt-2">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Site cung cấp hàng</span>
            <span className="text-sm font-extrabold text-slate-700 block mt-1">{poHeader.tenSite}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Ngày đặt vận đơn</span>
            <span className="text-sm font-semibold text-slate-600 block mt-1">
              {new Date(poHeader.ngayDat).toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Phương thức vận tải</span>
            <span className="mt-1 block">
              {getStatusBadge(poHeader.phuongTienVanChuyen)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Mã đối tác site</span>
            <span className="text-sm font-mono font-bold text-slate-500 block mt-1">{poHeader.maSite}</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Main interactive check table */}
      <Card className="border-slate-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            {role === 'INVENTORY' ? 'Bảng nhập liệu đối soát hàng hóa thực tế' : 'Chi tiết danh sách hàng hóa đặt nhập khẩu'}
          </CardTitle>
          <CardDescription>
            {role === 'INVENTORY'
              ? 'Nhân viên kho điền số lượng đếm được thực tế và chọn kết luận dòng hàng. Giá trị mặc định là khớp 100%.'
              : 'Chi tiết danh sách sản phẩm, số lượng đặt hàng từ Site cung cấp ngoại nhập.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-8">Mã SKU</TableHead>
                  <TableHead>Tên Vật Tư</TableHead>
                  <TableHead className="text-center">Số lượng đặt hệ thống</TableHead>
                  <TableHead className="text-center w-40">Số lượng thực nhận</TableHead>
                  <TableHead className="w-64">Kết quả kiểm nhận</TableHead>
                  <TableHead className="pr-8 text-right">Đơn vị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={line.maHang}>
                    <TableCell className="pl-8 font-bold text-slate-800">{line.maHang}</TableCell>
                    <TableCell className="max-w-[12rem] truncate">{line.tenHang}</TableCell>
                    <TableCell className="text-center font-extrabold text-slate-500">{line.soLuongDat}</TableCell>
                    
                    {/* Input cell: soLuongThucNhan */}
                    <TableCell className="text-center">
                      <input
                        type="number"
                        min={0}
                        value={line.soLuongThucNhan}
                        disabled={role !== 'INVENTORY' || poHeader.trangThaiPo !== 'DANG_GIAO'}
                        onChange={(e) => handleUpdateLine(index, 'soLuongThucNhan', e.target.value)}
                        className="w-24 text-center bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 px-3 py-1.5 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:bg-white transition-all"
                      />
                    </TableCell>

                    {/* Dropdown cell: checkResult */}
                    <TableCell>
                      <Select
                        id={`check-${line.maHang}`}
                        options={checkResultOptions}
                        value={line.ketQuaKiemNhan}
                        disabled={role !== 'INVENTORY' || poHeader.trangThaiPo !== 'DANG_GIAO'}
                        onChange={(e) => handleUpdateLine(index, 'ketQuaKiemNhan', e.target.value)}
                        className="py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200"
                      />
                    </TableCell>

                    <TableCell className="pr-8 text-right">
                      <Badge variant="secondary">{line.donViTinh}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Notes & Test explanation */}
            <div className="p-6 border-t border-slate-100 space-y-4">
              <Textarea
                id="notes"
                label={role === 'INVENTORY' ? "Ghi chú chênh lệch (Giải trình chi tiết nếu có chênh lệch/lỗi hàng)" : "Ghi chú chênh lệch giải trình"}
                placeholder="Giải trình lý do thiếu hụt số lượng, hàng lỗi hỏng hoặc rách bao bì khi nhận hàng..."
                value={ghiChuChenhLech}
                disabled={role !== 'INVENTORY' || poHeader.trangThaiPo !== 'DANG_GIAO'}
                onChange={(e) => setGhiChuChenhLech(e.target.value)}
              />

              {/* Crucial help box for rollback testing */}
              {poHeader.trangThaiPo === 'DANG_GIAO' && role === 'INVENTORY' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 leading-relaxed font-semibold">
                  💡 <span className="text-amber-900 uppercase font-extrabold mr-1">Để kiểm thử cơ chế Transaction Rollback (Dương):</span> 
                  Hãy viết từ khóa <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 border border-amber-200 font-mono">sập mạng</span> hoặc 
                  <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 border border-amber-200 font-mono ml-1">trigger_error</span> vào ô ghi chú ở trên, sau đó nhấn nút Xác nhận. 
                  Proxy Client sẽ ném lỗi kết nối mạng. Bạn sẽ quan sát thấy giao dịch kho nội bộ được rollback nguyên trạng, trạng thái đơn PO không bị thay đổi rác trên database!
                </div>
              )}
            </div>

            {/* Submit Action Footer */}
            {poHeader.trangThaiPo === 'DANG_GIAO' && role === 'INVENTORY' && (
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/receipts')} className="font-semibold">
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  className="bg-indigo-950 hover:bg-slate-900 px-8 font-bold shadow-lg shadow-slate-950/20"
                >
                  Xác nhận nhập kho
                </Button>
              </div>
            )}

            {!(poHeader.trangThaiPo === 'DANG_GIAO' && role === 'INVENTORY') && (
              <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/receipts')} className="font-semibold px-6">
                  Quay lại danh sách
                </Button>
              </div>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
