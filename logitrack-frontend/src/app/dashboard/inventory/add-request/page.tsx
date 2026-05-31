// File: src/app/(dashboard)/inventory/add-request/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { MatHang } from '@/types';
import apiService from '@/services/api';

interface RequestItemLine {
  maHang: string;
  soLuong: number;
  ngayNhanMongMuon: string;
}

export default function AddRequest() {
  const [itemsList, setItemsList] = useState<MatHang[]>([]);
  const [lines, setLines] = useState<RequestItemLine[]>([
    { maHang: '', soLuong: 1, ngayNhanMongMuon: '' }
  ]);
  const [draftCode, setDraftCode] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const currentDateStr = '2026-05-30'; // Ngày hiện tại giả lập hệ thống

  useEffect(() => {
    // Tự sinh mã phiếu nháp
    setDraftCode('REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    
    // Lấy email user đăng nhập
    const email = localStorage.getItem('userEmail') || 'sales@logitrack.com';
    setCurrentUser(email);

    // Tải danh mục sản phẩm SKU
    async function loadItems() {
      try {
        const data = await apiService.getItems();
        setItemsList(data);
        if (data.length > 0) {
          // Gán mặc định SKU đầu tiên cho dòng đầu tiên
          setLines([{ maHang: data[0].maHang, soLuong: 1, ngayNhanMongMuon: '' }]);
        }
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        toast('Lỗi tải danh mục sản phẩm từ Backend!', 'error');
      }
    }
    loadItems();
  }, [toast]);

  // Thêm một dòng sản phẩm mới vào danh sách
  const handleAddLine = () => {
    const defaultSku = itemsList.length > 0 ? itemsList[0].maHang : '';
    setLines([...lines, { maHang: defaultSku, soLuong: 1, ngayNhanMongMuon: '' }]);
  };

  // Xóa một dòng khỏi danh sách
  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      toast('Yêu cầu đặt hàng phải có ít nhất một dòng sản phẩm!', 'warning');
      return;
    }
    setLines(lines.filter((_, idx) => idx !== index));
  };

  // Cập nhật giá trị dòng
  const handleUpdateLine = (index: number, field: keyof RequestItemLine, value: any) => {
    const updated = [...lines];
    if (field === 'soLuong') {
      updated[index][field] = Math.max(1, parseInt(value) || 1);
    } else {
      updated[index][field] = value;
    }
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra Validate dữ liệu
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.maHang) {
        toast(`Dòng số ${i + 1}: Chưa chọn sản phẩm!`, 'warning');
        return;
      }
      if (line.soLuong <= 0) {
        toast(`Dòng số ${i + 1}: Số lượng đặt hàng phải lớn hơn 0!`, 'warning');
        return;
      }
      if (!line.ngayNhanMongMuon) {
        toast(`Dòng số ${i + 1}: Vui lòng chọn Ngày nhận mong muốn!`, 'warning');
        return;
      }

      // Kiểm tra ngày nhận mong muốn phải lớn hơn ngày hiện tại
      const dateVal = new Date(line.ngayNhanMongMuon);
      const currDate = new Date(currentDateStr);
      if (dateVal <= currDate) {
        toast(`Dòng số ${i + 1}: Ngày nhận mong muốn phải sau ngày lập phiếu (hơn 30/05/2026)!`, 'warning');
        return;
      }
    }

    setLoading(true);
    try {
      await apiService.createRequest({
        nguoiTao: currentUser,
        items: lines
      });
      toast('Tạo phiếu yêu cầu đặt hàng thành công!', 'success');
      setTimeout(() => {
        router.push('/dashboard/orders');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Gửi yêu cầu lên máy chủ Backend thất bại!';
      toast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const productDropdownOptions = itemsList.map((item) => ({
    value: item.maHang,
    label: `${item.maHang} - ${item.tenHang} (${item.donViTinh})`,
  }));

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/orders')} className="p-2.5 rounded-xl border border-slate-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Lập Phiếu Yêu cầu Đặt hàng Mới</h2>
          <p className="text-sm text-slate-500 mt-1">Tạo phiếu gom nhu cầu mua hàng nội bộ gửi về bộ phận Đặt hàng Quốc tế.</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/50 shadow-sm md:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Thông tin Chứng từ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">Mã phiếu yêu cầu (Nháp)</span>
              <span className="text-base font-bold text-slate-700 block mt-0.5">{draftCode}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">Ngày lập phiếu</span>
              <span className="text-sm font-semibold text-slate-600 block mt-0.5">30/05/2026 (Hôm nay)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">Nhân viên lập</span>
              <span className="text-sm font-semibold text-slate-600 block mt-0.5 truncate">{currentUser}</span>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                Trạng thái: Nháp / Chờ gửi
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Table Card */}
        <Card className="border-slate-200/50 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Danh sách Mặt hàng cần mua</CardTitle>
            <CardDescription>Chọn vật tư, số lượng và ngày cần hàng. Bạn có thể thêm nhiều dòng sản phẩm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Lines Grid Table */}
              <div className="space-y-4">
                {lines.map((line, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-end gap-4 p-4 border border-slate-100 bg-slate-50/30 rounded-2xl relative transition-all duration-300">
                    
                    {/* Index Badge */}
                    <div className="absolute top-4 left-4 bg-slate-200 text-slate-700 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>

                    {/* Column 1: Select Product */}
                    <div className="w-full md:w-1/2 pt-4 md:pt-0">
                      <Select
                        id={`product-${index}`}
                        label="Chọn sản phẩm"
                        options={productDropdownOptions}
                        value={line.maHang}
                        onChange={(e) => handleUpdateLine(index, 'maHang', e.target.value)}
                      />
                    </div>

                    {/* Column 2: Quantity Input */}
                    <div className="w-full md:w-1/4">
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        label="Số lượng cần"
                        min={1}
                        value={line.soLuong}
                        onChange={(e) => handleUpdateLine(index, 'soLuong', e.target.value)}
                      />
                    </div>

                    {/* Column 3: Date Picker */}
                    <div className="w-full md:w-1/4">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Ngày nhận hàng
                      </label>
                      <input
                        type="date"
                        value={line.ngayNhanMongMuon}
                        onChange={(e) => handleUpdateLine(index, 'ngayNhanMongMuon', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>

                    {/* Column 4: Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors self-end md:mb-1 border border-rose-100"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add line button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLine}
                className="w-full py-3.5 border-dashed border-2 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center font-bold text-xs"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                THÊM DÒNG MẶT HÀNG MỚI
              </Button>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/orders')} className="font-semibold">
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="primary" loading={loading} className="font-semibold px-6 shadow-lg shadow-blue-500/10">
                  Gửi yêu cầu nhập hàng
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
