// File: src/app/(dashboard)/orders/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { YeuCauDatHang, AllocationDetail } from '@/types';
import apiService from '@/services/api';

export default function RequestDetailAndAllocation() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const id = params.id as string;

  const [request, setRequest] = useState<YeuCauDatHang | null>(null);
  const [allocationDetails, setAllocationDetails] = useState<AllocationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [computed, setComputed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('userRole'));

    async function loadRequest() {
      try {
        const data = await apiService.getRequest(id);
        setRequest(data);
      } catch (err) {
        console.error('Lỗi tải chi tiết yêu cầu:', err);
        toast('Không tìm thấy phiếu yêu cầu đặt hàng này!', 'error');
        router.push('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [id, router, toast]);

  // Kích hoạt thuật toán phân bổ tối ưu của Hải
  const handleTriggerAllocation = async () => {
    setComputing(true);
    setErrorMessage(null);
    setAllocationDetails([]);
    
    try {
      // Gọi API POST /api/allocation/process/${id} chạy thuật toán lõi
      const response = await apiService.simulateAllocation(id);
      
      setAllocationDetails(response.details);
      setComputed(true);
      toast('Thuật toán phân bổ tối ưu chạy thành công! Đã tìm thấy phương án tối ưu.', 'success');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể đạt được số lượng nhập khẩu như yêu cầu!';
      setErrorMessage(errMsg);
      toast('Thuật toán phân bổ gặp sự cố hoặc đối tác không đủ tồn kho cung ứng!', 'error');
    } finally {
      setComputing(false);
    }
  };

  // Thêm một dòng phân bổ mới cho một SKU để tách Site thủ công
  const handleAddRow = (maHang: string) => {
    const template = allocationDetails.find(d => d.maHang === maHang);
    if (!template) {
      // Nếu không tìm thấy template mặc định, lấy từ chi tiết yêu cầu để tạo dòng nháp trắng
      const requestItem = request?.chiTietYeuCaus?.find(ct => (ct.maHang || ct.mathHang?.maHang) === maHang);
      if (!requestItem) return;
      
      const newRow: AllocationDetail = {
        maHang: maHang,
        tenHang: requestItem.mathHang?.tenHang || requestItem.maHang || maHang,
        soLuongYeuCau: requestItem.soLuong,
        maSite: '',
        tenSite: '',
        soLuongPhanBo: 0,
        phuongTienVanChuyen: 'ship delivery',
        soNgayVanChuyen: 0,
        feasibleSites: []
      };
      setAllocationDetails([...allocationDetails, newRow]);
      return;
    }
    
    const defaultSite = template.feasibleSites?.[0];
    
    const newRow: AllocationDetail = {
      maHang: template.maHang,
      tenHang: template.tenHang,
      soLuongYeuCau: template.soLuongYeuCau,
      maSite: defaultSite?.maSite || '',
      tenSite: defaultSite?.tenSite || '',
      soLuongPhanBo: 0,
      phuongTienVanChuyen: defaultSite?.phuongTienVanChuyen || 'ship delivery',
      soNgayVanChuyen: defaultSite?.soNgayVanChuyen || 0,
      feasibleSites: template.feasibleSites
    };
    
    setAllocationDetails([...allocationDetails, newRow]);
  };

  // Xóa một dòng phân bổ
  const handleRemoveRow = (idx: number) => {
    const updated = [...allocationDetails];
    updated.splice(idx, 1);
    setAllocationDetails(updated);
  };

  // Cập nhật Site cho một dòng phân bổ
  const handleSiteChange = (idx: number, compositeVal: string) => {
    const [maSite, phuongTien] = compositeVal.split('|');
    const updated = [...allocationDetails];
    const row = updated[idx];
    
    const foundSite = row.feasibleSites?.find(
      s => s.maSite === maSite && s.phuongTienVanChuyen === phuongTien
    );
    
    if (foundSite) {
      row.maSite = foundSite.maSite;
      row.tenSite = foundSite.tenSite;
      row.phuongTienVanChuyen = foundSite.phuongTienVanChuyen;
      row.soNgayVanChuyen = foundSite.soNgayVanChuyen;
    }
    
    setAllocationDetails(updated);
  };

  // Cập nhật số lượng phân bổ cho một dòng
  const handleQuantityChange = (idx: number, qty: number) => {
    const updated = [...allocationDetails];
    updated[idx].soLuongPhanBo = qty;
    setAllocationDetails(updated);
  };

  const getAllocatedSumForSku = (maHang: string) => {
    return allocationDetails
      .filter(d => d.maHang === maHang)
      .reduce((sum, d) => sum + Number(d.soLuongPhanBo || 0), 0);
  };

  // Xác nhận lưu chính thức đơn PO
  const handleConfirmAllocation = async () => {
    // 1. Kiểm tra khớp số lượng cho từng mặt hàng
    const skuGroups: { [sku: string]: { requested: number; allocated: number } } = {};
    for (const d of allocationDetails) {
      if (!skuGroups[d.maHang]) {
        skuGroups[d.maHang] = { requested: d.soLuongYeuCau, allocated: 0 };
      }
      skuGroups[d.maHang].allocated += Number(d.soLuongPhanBo || 0);
      
      // 2. Kiểm tra tồn kho của Site đối tác được chọn
      const selectedSiteInfo = d.feasibleSites?.find(
        s => s.maSite === d.maSite && s.phuongTienVanChuyen === d.phuongTienVanChuyen
      );
      if (selectedSiteInfo && Number(d.soLuongPhanBo || 0) > selectedSiteInfo.soLuongTon) {
        toast(`Số lượng phân bổ cho SKU ${d.maHang} tại ${d.tenSite} (${d.soLuongPhanBo}) vượt quá tồn kho khả dụng (${selectedSiteInfo.soLuongTon})!`, 'error');
        return;
      }
    }
    
    for (const sku in skuGroups) {
      const group = skuGroups[sku];
      if (group.allocated !== group.requested) {
        toast(`Tổng số lượng phân bổ cho SKU ${sku} (${group.allocated}) không khớp với yêu cầu (${group.requested})! Vui lòng điều chỉnh lại.`, 'error');
        return;
      }
    }

    setConfirming(true);
    try {
      await apiService.confirmAllocation(id, allocationDetails);
      toast('Xác nhận & Sinh các đơn PO thành công! Dữ liệu kho đối tác đã được cập nhật.', 'success');
      setTimeout(() => {
        router.push('/dashboard/orders');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Lưu đơn PO thất bại!';
      toast(errMsg, 'error');
    } finally {
      setConfirming(false);
    }
  };

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

  if (!request) return null;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/orders')} className="p-2.5 rounded-xl border border-slate-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Chi tiết phiếu & Xử lý đặt hàng</h2>
          <p className="text-sm text-slate-500 mt-1">Duyệt thông tin sản phẩm yêu cầu và chạy thuật toán tối ưu chuỗi cung ứng.</p>
        </div>
      </div>

      {/* 1. Request Info Overview Card */}
      <Card className="border-slate-200/50 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Thông tin Phiếu yêu cầu {request.maYc}</CardTitle>
            {getStatusBadge(request.trangThai)}
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-4 px-8 pb-8 pt-2">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Ngày lập yêu cầu</span>
            <span className="text-sm font-semibold text-slate-700 block mt-1">
              {new Date(request.ngayTao).toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Nhân viên tạo phiếu</span>
            <span className="text-sm font-semibold text-slate-700 block mt-1 truncate">{request.nguoiTao}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-xs text-slate-400 font-bold uppercase block">Chi tiết mặt hàng yêu cầu</span>
            <div className="mt-2 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">
              {request.chiTietYeuCaus?.map((ct) => {
                const ctMaHang = ct.maHang || ct.mathHang?.maHang || '';
                return (
                  <div key={ctMaHang} className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{ct.mathHang?.tenHang || ctMaHang}</span>
                    <span className="text-slate-800">Số lượng: {ct.soLuong} | Hạn: {new Date(ct.ngayNhanMongMuon).toLocaleDateString('vi-VN')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Core action Trigger Section */}
      {request.trangThai === 'DANG_CHO_PHAN_HOI' && role === 'ORDER' && (
        <Card className="border-slate-200/50 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50/50">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <svg className={`h-7 w-7 ${computing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {computing ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                )}
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Bộ máy Tối ưu hóa Logistics LogiTrack</h3>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed font-semibold">
                Quét tồn kho đối tác toàn cầu, lọc phương tiện giao hàng (Tàu biển/Máy bay) kịp tiến độ, sắp xếp tồn kho và phân chia đối tác tối thiểu tự động bằng thuật toán Hải Code.
              </p>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleTriggerAllocation}
              loading={computing}
              className="px-8 shadow-xl shadow-blue-500/20 font-bold"
            >
              Kích hoạt phân bổ tối ưu
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 3. Error Popup Simulation */}
      {errorMessage && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4 text-rose-700 animate-slide-in">
          <div className="bg-rose-500 text-white rounded-xl p-2 mt-0.5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider">Không thể đạt được số lượng nhập khẩu yêu cầu</h4>
            <p className="text-xs text-rose-600 mt-1 font-semibold leading-relaxed">{errorMessage}</p>
            <p className="text-[10px] text-rose-500 mt-2 font-bold uppercase">Toàn bộ tiến trình gom hàng nháp đã được Rollback an toàn.</p>
          </div>
        </div>
      )}

      {/* 4. Grid Allocation Result dự kiến */}
      {computed && allocationDetails.length > 0 && (
        <Card className="border-slate-200/50 shadow-lg animate-slide-in">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Phương án Phân bổ Đơn đặt hàng Dự kiến & Điều chỉnh Thủ công</CardTitle>
            <CardDescription>
              Giải thuật phân bổ Greedy đã gợi ý phương án tối ưu. Bạn có thể thay đổi Site, phương tiện vận chuyển và phân chia lại số lượng phân bổ trước khi xuất đơn PO chính thức.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-8">Mã hàng / Chi tiết</TableHead>
                  <TableHead>Tên Sản Phẩm</TableHead>
                  <TableHead className="text-center">Số lượng yêu cầu</TableHead>
                  <TableHead>Site & Phương Tiện Phân Bổ</TableHead>
                  <TableHead className="text-center">Số lượng phân bổ</TableHead>
                  <TableHead>Phương tiện</TableHead>
                  <TableHead className="pr-8 text-right">Lead-time & Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.chiTietYeuCaus?.map((item) => {
                  const itemMaHang = item.maHang || item.mathHang?.maHang || '';
                  const skuRows = allocationDetails.filter(d => d.maHang === itemMaHang);
                  const allocatedSum = getAllocatedSumForSku(itemMaHang);
                  const isMatched = allocatedSum === item.soLuong;
                  
                  return (
                    <React.Fragment key={itemMaHang}>
                      {/* Group Header for SKU */}
                      <TableRow className="bg-slate-50/70 border-b border-slate-200/60 font-semibold">
                        <TableCell colSpan={7} className="pl-8 py-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 text-sm tracking-tight">{item.mathHang?.tenHang || itemMaHang}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-600 font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">{itemMaHang}</span>
                            </div>
                            <div className="flex items-center gap-4 pr-4">
                              <span className="text-xs font-bold text-slate-500">
                                Yêu cầu: <span className="text-slate-800 font-extrabold">{item.soLuong} chiếc</span>
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                Đã phân bổ: <span className={isMatched ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold"}>{allocatedSum} / {item.soLuong} chiếc</span>
                              </span>
                              {isMatched ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                                  ✓ Khớp
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider">
                                  ⚠ Lệch
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddRow(itemMaHang)}
                                className="font-bold text-xs py-1.5 px-3 rounded-xl border-blue-200 hover:bg-blue-50 text-blue-600 flex items-center gap-1 shadow-sm"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                Tách Site
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Allocation detail lines */}
                      {skuRows.map((line) => {
                        const masterIdx = allocationDetails.findIndex(d => d === line);
                        
                        return (
                          <TableRow key={masterIdx} className="hover:bg-slate-50/20 transition-colors duration-150">
                            <TableCell className="pl-12 py-3 text-slate-400 font-bold text-xs">
                              <span className="inline-block w-3 h-3 border-l-2 border-b-2 border-slate-300 mr-2 -mt-1 rounded-bl-sm"></span>
                              Phân bổ
                            </TableCell>
                            <TableCell className="py-3 text-slate-500 font-semibold text-xs max-w-[12rem] truncate">
                              {line.tenHang}
                            </TableCell>
                            <TableCell className="text-center py-3 text-slate-400 font-semibold text-xs">
                              {line.soLuongYeuCau}
                            </TableCell>
                            
                            {/* Interactive Site Dropdown Selector */}
                            <TableCell className="py-2 min-w-[20rem]">
                              <select
                                value={`${line.maSite}|${line.phuongTienVanChuyen}`}
                                onChange={(e) => handleSiteChange(masterIdx, e.target.value)}
                                className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all shadow-sm"
                              >
                                {line.feasibleSites && line.feasibleSites.length > 0 ? (
                                  line.feasibleSites.map((s) => (
                                    <option key={`${s.maSite}|${s.phuongTienVanChuyen}`} value={`${s.maSite}|${s.phuongTienVanChuyen}`}>
                                      {s.tenSite} - {s.phuongTienVanChuyen === 'ship delivery' ? 'Tàu biển (Ship)' : 'Hàng không (Air)'} (Hạn: {s.soNgayVanChuyen}d, Tồn: {s.soLuongTon})
                                    </option>
                                  ))
                                ) : (
                                  <option value={`${line.maSite}|${line.phuongTienVanChuyen}`}>{line.tenSite}</option>
                                )}
                              </select>
                            </TableCell>
                            
                            {/* Editable Quantity Allocation Input */}
                            <TableCell className="py-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={line.soLuongPhanBo}
                                onChange={(e) => handleQuantityChange(masterIdx, parseInt(e.target.value) || 0)}
                                className="w-24 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                              />
                            </TableCell>
                            
                            {/* Dynamic Transport Badge */}
                            <TableCell className="py-3">
                              {line.phuongTienVanChuyen === 'ship delivery' ? (
                                <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">
                                  Tàu thủy (Ship)
                                </Badge>
                              ) : (
                                <Badge variant="warning" className="bg-amber-100 text-amber-800 border-none font-bold text-[10px]">
                                  Chuyên cơ (Air)
                                </Badge>
                              )}
                            </TableCell>
                            
                            {/* Transport Days & Split Line Removal button */}
                            <TableCell className="pr-8 py-2 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <span className="font-bold text-slate-700 text-xs">{line.soNgayVanChuyen} ngày</span>
                                {skuRows.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveRow(masterIdx)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors shadow-sm"
                                    title="Xóa phân bổ này"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Confirmation Footer action */}
            {request.trangThai === 'DANG_CHO_PHAN_HOI' && (
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                <Button variant="outline" onClick={() => setComputed(false)} className="font-semibold">
                  Hủy phương án nháp
                </Button>
                <Button
                  variant="success"
                  onClick={handleConfirmAllocation}
                  loading={confirming}
                  className="px-6 font-bold shadow-lg shadow-emerald-500/10"
                >
                  Xác nhận & Sinh đơn PO
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. PO Detail view if already processed */}
      {request.trangThai === 'DA_XU_LY' && (
        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Thông tin xử lý phân bổ</CardTitle>
            <CardDescription>Phiếu yêu cầu này đã được phê duyệt và chuyển đổi thành đơn đặt hàng PO xuất khẩu.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8 text-slate-400">
            <svg className="h-10 w-10 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-slate-600">ĐÃ HOÀN TẤT PHÂN BỔ & SINH ĐƠN HÀNG PO</span>
            <span className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra phân hệ Danh sách PO (Dương phụ trách) để đón hàng và kiểm nhận.</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
