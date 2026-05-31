// File: src/app/dashboard/orders/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadge } from '@/components/ui/Badge';
import { YeuCauDatHang } from '@/types';
import apiService from '@/services/api';

export default function RequestList() {
  const [requests, setRequests] = useState<YeuCauDatHang[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CHO_XU_LY' | 'DANG_CHO_PHAN_HOI' | 'DA_XU_LY'>('ALL');
  const [loading, setLoading] = useState(true);
  const [queryingId, setQueryingId] = useState<string | null>(null);
  const [querySuccessModal, setQuerySuccessModal] = useState<{ isOpen: boolean; sitesCount: number; maYc: string } | null>(null);
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);

    async function loadRequests() {
      try {
        const data = await apiService.getRequests();
        setRequests(data);
      } catch (err) {
        console.error('Lỗi tải danh sách yêu cầu đặt hàng:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleQueryStock = async (maYc: string) => {
    setQueryingId(maYc);
    try {
      const res = await apiService.queryStock(maYc);
      if (res.success) {
        setQuerySuccessModal({ isOpen: true, sitesCount: res.sitesCount, maYc });
      } else {
        alert(res.message);
      }
      // Tải lại danh sách yêu cầu để lấy trạng thái mới
      const data = await apiService.getRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Lỗi gửi truy vấn tồn kho:', err);
      alert(err.response?.data?.message || 'Gửi truy vấn tồn kho thất bại!');
    } finally {
      setQueryingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'ALL') return true;
    return req.trangThai === statusFilter;
  });

  // Pagination calculation
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

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
    <>
      <div className="space-y-6 animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              {role === 'ORDER' ? 'Phiếu yêu cầu chờ xử lý' : 'Danh sách Phiếu yêu cầu nhập hàng'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {role === 'ORDER'
                ? 'Duyệt các yêu cầu gom hàng từ bộ phận Bán hàng để gửi truy vấn tồn kho và chạy phân bổ.'
                : 'Theo dõi tiến trình hoặc tạo phiếu yêu cầu gom nhu cầu đặt hàng mới.'}
            </p>
          </div>
          
          {role === 'SALES' && (
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/inventory/add-request')}
              className="shadow-lg shadow-blue-500/10 font-semibold"
            >
              <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Tạo yêu cầu mới
            </Button>
          )}
        </div>

        {/* Filter Tabs & Table Card */}
        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-bold text-slate-800">Hoạt động Phiếu</CardTitle>
              
              {/* Filter buttons */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setStatusFilter('CHO_XU_LY')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    statusFilter === 'CHO_XU_LY'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Chờ tiếp nhận
                </button>
                <button
                  onClick={() => setStatusFilter('DANG_CHO_PHAN_HOI')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    statusFilter === 'DANG_CHO_PHAN_HOI'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đang chờ Site
                </button>
                <button
                  onClick={() => setStatusFilter('DA_XU_LY')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    statusFilter === 'DA_XU_LY'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đã phân bổ
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400 font-semibold bg-slate-50/50 mx-6 rounded-2xl border border-dashed border-slate-200">
                Không có phiếu yêu cầu đặt hàng nào trong bộ lọc này!
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-8">Mã Yêu Cầu</TableHead>
                      <TableHead>Ngày Lập</TableHead>
                      <TableHead>Người Tạo Phiếu</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="pr-8 text-right">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRequests.map((req) => (
                      <TableRow key={req.maYc}>
                        <TableCell className="pl-8 font-bold text-slate-800 tracking-tight">{req.maYc}</TableCell>
                        <TableCell>{new Date(req.ngayTao).toLocaleString('vi-VN')}</TableCell>
                        <TableCell>{req.nguoiTao}</TableCell>
                        <TableCell>
                          {getStatusBadge(req.trangThai)}
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          {role === 'ORDER' && req.trangThai === 'CHO_XU_LY' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleQueryStock(req.maYc)}
                              loading={queryingId === req.maYc}
                              className="shadow-sm shadow-emerald-500/10 font-bold"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Gửi truy vấn
                            </Button>
                          )}
                          {role === 'ORDER' && req.trangThai === 'DANG_CHO_PHAN_HOI' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => router.push(`/dashboard/orders/${req.maYc}`)}
                              className="shadow-sm shadow-blue-500/10 font-bold"
                            >
                              Xử lý phân bổ
                              <svg className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                              </svg>
                            </Button>
                          )}
                          {!(role === 'ORDER' && (req.trangThai === 'CHO_XU_LY' || req.trangThai === 'DANG_CHO_PHAN_HOI')) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/dashboard/orders/${req.maYc}`)}
                              className="font-bold"
                            >
                              Chi tiết
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-5 border-t border-slate-100 bg-slate-50/30">
                    <span className="text-xs font-semibold text-slate-500">
                      Hiển thị dòng <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, totalItems)}</span> trong tổng số <span className="font-bold text-slate-700">{totalItems}</span> yêu cầu
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-2 px-3 rounded-xl border border-slate-200/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all font-semibold"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 text-xs font-extrabold rounded-lg transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="p-2 px-3 rounded-xl border border-slate-200/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all font-semibold"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modern Success Modal for Stock Query, matching inventory edit modal styling */}
      {querySuccessModal && querySuccessModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-8 transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Thông báo gửi truy vấn
              </h3>
              <button
                onClick={() => setQuerySuccessModal(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10 border border-emerald-200/50">
                  <svg className="h-9 w-9 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-base font-extrabold text-slate-800 tracking-tight">Gửi truy vấn thành công!</h4>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Mã yêu cầu</span>
                  <span className="font-mono text-slate-800 font-bold">{querySuccessModal.maYc}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Site đối tác liên hệ</span>
                  <span className="text-emerald-600 font-extrabold text-sm">{querySuccessModal.sitesCount} sites</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase tracking-wider">Trạng thái phiếu</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    Chờ phản hồi
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-semibold text-center px-2">
                Hệ thống đang tự động kết nối và chờ phản hồi từ các Site đối tác để sẵn sàng cho quy trình tối ưu hóa phân bổ.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuerySuccessModal(null)}
                className="font-semibold"
              >
                Đóng
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setQuerySuccessModal(null);
                  router.push(`/dashboard/orders/${querySuccessModal.maYc}`);
                }}
                className="font-bold px-6 shadow-lg shadow-blue-500/10"
              >
                Xử lý phân bổ
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
