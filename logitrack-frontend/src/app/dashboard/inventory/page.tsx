// File: src/app/dashboard/inventory/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { MatHang } from '@/types';
import apiService from '@/services/api';

export default function ItemCatalog() {
  const [items, setItems] = useState<MatHang[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Edit / Delete states
  const [editingItem, setEditingItem] = useState<MatHang | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState<'Chiếc' | 'Hộp' | 'Bộ' | 'Khay' | 'Kg'>('Chiếc');
  const [editCategory, setEditCategory] = useState('');
  const [editQuyCach, setEditQuyCach] = useState('');
  const [editTrangThai, setEditTrangThai] = useState<'Đang kinh doanh' | 'Ngừng kinh doanh'>('Đang kinh doanh');
  
  const [deletingItem, setDeletingItem] = useState<MatHang | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await apiService.getItems();
        setItems(data);
      } catch (err) {
        console.error('Lỗi tải danh mục mặt hàng:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEditClick = (item: MatHang) => {
    setEditingItem(item);
    setEditName(item.tenHang);
    setEditUnit((item.donViTinh as any) || 'Chiếc');
    setEditCategory(item.category || '');
    setEditQuyCach(item.quyCach || '');
    setEditTrangThai(item.trangThai || 'Đang kinh doanh');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editName.trim()) {
      toast('Vui lòng nhập tên mặt hàng!', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await apiService.updateItem(editingItem.maHang, {
        maHang: editingItem.maHang,
        tenHang: editName.trim(),
        donViTinh: editUnit,
        category: editCategory.trim(),
        quyCach: editQuyCach.trim(),
        trangThai: editTrangThai
      });

      setItems(items.map(it => it.maHang === editingItem.maHang ? updated : it));
      toast('Cập nhật mặt hàng thành công!', 'success');
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
      toast('Cập nhật thất bại!', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setActionLoading(true);
    try {
      const res = await apiService.deleteItem(deletingItem.maHang);
      // Kiểm tra xem backend thực hiện xóa vật lý hay cập nhật trạng thái
      if ((res as any).action === 'UPDATE_STATUS') {
        setItems(items.map(it => it.maHang === deletingItem.maHang ? { ...it, trangThai: 'Ngừng kinh doanh' } : it));
        toast((res as any).message || 'Hệ thống tự động chuyển trạng thái sang Ngừng kinh doanh!', 'success');
      } else {
        setItems(items.filter(it => it.maHang !== deletingItem.maHang));
        toast(res.message || 'Xóa mặt hàng thành công!', 'success');
      }
      setDeletingItem(null);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể xóa mặt hàng!';
      toast(errMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.maHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tenHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const unitOptions = [
    { value: 'Chiếc', label: 'Chiếc' },
    { value: 'Hộp', label: 'Hộp' },
    { value: 'Bộ', label: 'Bộ' },
    { value: 'Khay', label: 'Khay' },
    { value: 'Kg', label: 'Kg' },
  ];

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
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Danh mục Mặt hàng (SKU)</h2>
            <p className="text-sm text-slate-500 mt-1">Danh sách tất cả các sản phẩm vật tư và trang thiết bị hiện có trên hệ thống.</p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard/inventory/add')}
            className="shadow-lg shadow-blue-500/10 font-semibold"
          >
            <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Khai báo Vật tư mới
          </Button>
        </div>

        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Bộ lọc & Tìm kiếm</CardTitle>
                <CardDescription>Tìm nhanh sản phẩm theo mã SKU, tên hoặc danh mục ngành hàng.</CardDescription>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-600 text-xs font-bold shadow-inner w-fit">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Tổng số: <strong className="text-blue-600 font-extrabold text-sm">{filteredItems.length}</strong> mặt hàng</span>
              </div>
            </div>
            <div className="mt-4 flex max-w-md w-full">
              <Input
                id="search"
                type="text"
                placeholder="Nhập mã SKU, tên hàng hoặc danh mục..."
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
          <CardContent className="px-0 pb-0">
            {currentItems.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400 font-semibold bg-slate-50/50 mx-6 mb-6 rounded-2xl border border-dashed border-slate-200">
                Không tìm thấy sản phẩm nào phù hợp với từ khóa!
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-8">Mã SKU</TableHead>
                      <TableHead>Tên Mặt Hàng</TableHead>
                      <TableHead>Đơn Vị Tính</TableHead>
                      <TableHead>Quy Cách</TableHead>
                      <TableHead>Danh Mục</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="pr-8 text-right">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.maHang}>
                        <TableCell className="pl-8 font-bold text-slate-800 tracking-tight">{item.maHang}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.tenHang}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.donViTinh}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs font-semibold">{item.quyCach || '-'}</TableCell>
                        <TableCell>{item.category || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={item.trangThai === 'Đang kinh doanh' ? 'success' : 'danger'} className={item.trangThai === 'Đang kinh doanh' ? 'bg-emerald-500/20 text-emerald-600 border-none' : 'bg-rose-500/20 text-rose-600 border-none'}>
                            {item.trangThai || 'Đang kinh doanh'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            className="font-semibold text-xs py-1.5 px-3 border-slate-200 hover:bg-slate-50"
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingItem(item)}
                            className="font-semibold text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50"
                          >
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-8 py-4 bg-slate-50/50 rounded-b-2xl">
                    <div className="text-xs text-slate-500 font-semibold">
                      Hiển thị dòng <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, totalItems)}</span> trong tổng số <span className="font-bold text-slate-700">{totalItems}</span> mặt hàng
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Previous Button */}
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

                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 p-0 rounded-xl font-bold transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/10'
                              : 'border-slate-200/80 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </Button>
                      ))}

                      {/* Next Button */}
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

      {/* Edit Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-8 transform scale-100 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Chỉnh sửa thông tin SKU: <span className="font-mono text-blue-600 font-extrabold">{editingItem.maHang}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <Input
                id="edit-name"
                type="text"
                label="Tên mặt hàng vật tư"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Đơn vị tính
                  </label>
                  <Select
                    id="edit-unit"
                    options={unitOptions}
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value as any)}
                  />
                </div>

                <Input
                  id="edit-category"
                  type="text"
                  label="Danh mục SKU"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="edit-quycach"
                  type="text"
                  label="Quy cách đóng gói (Optional)"
                  placeholder="Ví dụ: 1 chiếc/hộp"
                  value={editQuyCach}
                  onChange={(e) => setEditQuyCach(e.target.value)}
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Trạng thái kinh doanh
                  </label>
                  <Select
                    id="edit-trangthai"
                    options={[
                      { value: 'Đang kinh doanh', label: 'Đang kinh doanh' },
                      { value: 'Ngừng kinh doanh', label: 'Ngừng kinh doanh' },
                    ]}
                    value={editTrangThai}
                    onChange={(e) => setEditTrangThai(e.target.value as any)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="font-semibold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={actionLoading}
                  className="font-bold px-6 shadow-lg shadow-blue-500/10"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-8 transform scale-100 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-2">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xác nhận xóa mặt hàng?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Bạn có chắc chắn muốn xóa mặt hàng <span className="font-bold text-slate-700">"{deletingItem.tenHang}"</span> (SKU: <span className="font-mono text-slate-700 font-bold">{deletingItem.maHang}</span>) khỏi hệ thống không?
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-3 rounded-xl leading-relaxed text-left font-semibold">
                ⚠️ <span className="font-extrabold uppercase">Lưu ý:</span> Nếu mặt hàng này đã có trong các giao dịch yêu cầu hoặc PO cũ, hệ thống sẽ tự động chuyển trạng thái sang "Ngừng kinh doanh" thay vì xóa vật lý để đảm bảo lịch sử chuỗi cung ứng.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingItem(null)}
                className="font-semibold"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                loading={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 shadow-lg shadow-rose-500/10 border border-rose-500"
              >
                Đồng ý xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
