// File: src/app/dashboard/inventory/add/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import apiService from '@/services/api';

export default function AddItem() {
  const [maHang, setMaHang] = useState('');
  const [tenHang, setTenHang] = useState('');
  const [donViTinh, setDonViTinh] = useState('Chiếc');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [trangThai, setTrangThai] = useState('Đang kinh doanh');
  const [quyCach, setQuyCach] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast('Dung lượng tệp tin quá lớn! Vui lòng chọn ảnh dưới 10MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        toast('Đã tải ảnh từ máy tính lên thành công!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast('Dung lượng tệp tin quá lớn! Vui lòng chọn ảnh dưới 10MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        toast('Đã tải ảnh thả vào thành công!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maHang || !tenHang) {
      toast('Vui lòng nhập đầy đủ Mã SKU và Tên mặt hàng!', 'warning');
      return;
    }

    if (!maHang.startsWith('SKU-')) {
      toast('Mã SKU phải bắt đầu bằng tiền tố "SKU-" (ví dụ: SKU-MON-001)!', 'warning');
      return;
    }

    if (maHang.length > 20) {
      toast('Mã SKU không được vượt quá 20 ký tự!', 'warning');
      return;
    }

    setLoading(true);
    try {
      await apiService.createItem({
        maHang: maHang.trim().toUpperCase(),
        tenHang: tenHang.trim(),
        donViTinh: donViTinh as any,
        category: category.trim(),
        trangThai: trangThai as any,
        quyCach: quyCach.trim(),
      });
      toast('Khai báo vật tư mới thành công!', 'success');
      setTimeout(() => {
        router.push('/dashboard/inventory');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu mặt hàng!';
      toast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const unitOptions = [
    { value: 'Chiếc', label: 'Chiếc' },
    { value: 'Hộp', label: 'Hộp' },
    { value: 'Bộ', label: 'Bộ' },
    { value: 'Khay', label: 'Khay' },
    { value: 'Kg', label: 'Kg' },
  ];

  const catOptions = [
    { value: 'Electronics', label: 'Điện tử & Màn hình' },
    { value: 'Accessories', label: 'Phụ kiện máy tính' },
    { value: 'Cables', label: 'Cáp kết nối & Nguồn' },
    { value: 'Audio', label: 'Thiết bị Âm thanh' },
    { value: 'Office', label: 'Văn phòng phẩm' },
  ];

  const trangThaiOptions = [
    { value: 'Đang kinh doanh', label: 'Đang kinh doanh' },
    { value: 'Ngừng kinh doanh', label: 'Ngừng kinh doanh' },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/inventory')} className="p-2.5 rounded-xl border border-slate-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Khai báo Vật tư & Sản phẩm</h2>
          <p className="text-sm text-slate-500 mt-1">Định nghĩa mặt hàng SKU mới vào danh mục hệ thống.</p>
        </div>
      </div>

      {/* Layout Split: Left Form, Right Live Preview */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Thông tin chi tiết</CardTitle>
              <CardDescription>Vui lòng điền đầy đủ các thông số kỹ thuật của mặt hàng.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    id="sku"
                    type="text"
                    label="Mã SKU (Bắt buộc, tối đa 20 ký tự)"
                    placeholder="SKU-MON-006"
                    value={maHang}
                    onChange={(e) => setMaHang(e.target.value)}
                  />

                  <Select
                    id="donViTinh"
                    label="Đơn vị tính"
                    options={unitOptions}
                    value={donViTinh}
                    onChange={(e) => setDonViTinh(e.target.value)}
                  />
                </div>

                <Input
                  id="tenHang"
                  type="text"
                  label="Tên mặt hàng sản phẩm"
                  placeholder="Màn hình LG Gaming UltraGear 27 inch"
                  value={tenHang}
                  onChange={(e) => setTenHang(e.target.value)}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    id="quyCach"
                    type="text"
                    label="Quy cách đóng gói (Optional)"
                    placeholder="Ví dụ: 1 chiếc/hộp, 50 cái/thùng"
                    value={quyCach}
                    onChange={(e) => setQuyCach(e.target.value)}
                  />

                  <Select
                    id="trangThai"
                    label="Trạng thái kinh doanh"
                    options={trangThaiOptions}
                    value={trangThai}
                    onChange={(e) => setTrangThai(e.target.value)}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Select
                    id="category"
                    label="Danh mục ngành hàng"
                    options={catOptions}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />

                  <Input
                    id="image"
                    type="text"
                    label="Đường dẫn ảnh sản phẩm (Optional)"
                    placeholder="https://example.com/lg-27.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <Textarea
                  id="description"
                  label="Thông số kỹ thuật & Mô tả chi tiết"
                  placeholder="Mô tả các cổng kết nối, độ phân giải IPS, tần số quét 144Hz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Drag and Drop Box - Fully Functional */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tải ảnh lên (Drag-and-Drop)</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 bg-slate-50/50 hover:bg-blue-50/20"
                  >
                    <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-500 block">Kéo thả tệp tin hoặc nhấp vào đây để tải ảnh từ máy tính của bạn</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Hỗ trợ ảnh định dạng PNG, JPG có dung lượng dưới 10MB</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => router.push('/dashboard/inventory')} className="font-semibold">
                    Hủy bỏ
                  </Button>
                  <Button type="submit" variant="primary" loading={loading} className="font-semibold px-6 shadow-lg shadow-blue-500/10">
                    Khai báo sản phẩm
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Live Preview panel */}
        <div className="lg:col-span-2">
          <Card className="sticky top-28 border-slate-200/50 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-xl overflow-hidden p-0 rounded-2xl">
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Preview Card</span>
              <Badge variant="primary" className="bg-blue-500/20 text-blue-300 border-none">Xem trước</Badge>
            </div>
            
            {/* Visual product presentation */}
            <div className="p-8 space-y-6">
              {/* Product mock image box */}
              <div className="relative aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview Product" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-white/40">
                    <svg className="mx-auto h-12 w-12 mb-2 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold tracking-tight block">Sản phẩm Chưa có ảnh minh họa</span>
                  </div>
                )}
              </div>

              {/* Text metadata */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                    {category}
                  </span>
                  <div className="flex gap-2">
                    <Badge variant={trangThai === 'Đang kinh doanh' ? 'success' : 'danger'} className={trangThai === 'Đang kinh doanh' ? 'bg-emerald-500/20 text-emerald-400 border-none' : 'bg-rose-500/20 text-rose-400 border-none'}>
                      {trangThai}
                    </Badge>
                    <Badge variant="primary" className="bg-blue-500/20 text-blue-300 border-none">
                      {donViTinh}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-white leading-tight min-h-[3rem] line-clamp-2">
                    {tenHang || 'Tên của sản phẩm vật tư mới...'}
                  </h3>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">Mã SKU:</span>
                      <span className="font-mono text-sm font-bold text-amber-400 tracking-wider uppercase">
                        {maHang || 'SKU-XXXX-XXX'}
                      </span>
                    </div>
                    {quyCach && (
                      <div className="text-[11px] text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/10 truncate max-w-[150px]">
                        QC: {quyCach}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mô tả sản phẩm</span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed min-h-[4rem] line-clamp-3">
                    {description || 'Các thông số mô tả chi tiết và kỹ thuật nổi bật của thiết bị vật tư sẽ được cập nhật hiển thị trực quan tại đây...'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Card footer details */}
            <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>TRẠNG THÁI: KHỞI TẠO</span>
              <span>LOGITRACK B2B</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
