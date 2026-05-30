// File: src/app/(dashboard)/orders/site-config/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ImportSite } from '@/types';
import apiService from '@/services/api';

export default function UpdateSiteLeadtime() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const id = params.id as string;

  const [site, setSite] = useState<ImportSite | null>(null);
  const [soNgayDiTau, setSoNgayDiTau] = useState(0);
  const [soNgayDiMayBay, setSoNgayDiMayBay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSite() {
      try {
        const data = await apiService.getSite(id);
        setSite(data);
        setSoNgayDiTau(data.soNgayDiTau);
        setSoNgayDiMayBay(data.soNgayDiMayBay);
      } catch (err) {
        console.error('Lỗi tải thông tin Site:', err);
        toast('Không tìm thấy Site đối tác này!', 'error');
        router.push('/dashboard/orders/site-config');
      } finally {
        setLoading(false);
      }
    }
    loadSite();
  }, [id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (soNgayDiTau < 0 || soNgayDiMayBay < 0) {
      toast('Thời gian vận chuyển phải là số nguyên dương lớn hơn hoặc bằng 0!', 'warning');
      return;
    }

    setSaving(true);
    try {
      await apiService.updateSiteLeadtime(id, { soNgayDiTau, soNgayDiMayBay });
      toast('Lưu cấu hình logistics đối tác thành công!', 'success');
      setTimeout(() => {
        router.push('/dashboard/orders/site-config');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast('Lưu cấu hình logistics thất bại!', 'error');
    } finally {
      setSaving(false);
    }
  };

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

  if (!site) return null;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/orders/site-config')} className="p-2.5 rounded-xl border border-slate-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Cập nhật Năng lực Vận chuyển</h2>
          <p className="text-sm text-slate-500 mt-1">Thay đổi thời gian Lead-time để tối ưu hóa chu kỳ chạy thuật toán kế tiếp.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="border-slate-200/50 shadow-md">
          <CardHeader className="pb-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Site đối tác đang cấu hình</span>
            <CardTitle className="text-xl font-extrabold text-blue-600 mt-1">{site.tenSite}</CardTitle>
            <CardDescription className="font-semibold text-slate-500">Mã định danh: {site.maSite} | Khu vực: Quốc tế</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  id="leadtime-ship"
                  type="number"
                  label="Lead-time Tàu biển (Ngày)"
                  min={0}
                  value={soNgayDiTau}
                  onChange={(e) => setSoNgayDiTau(parseInt(e.target.value) || 0)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />

                <Input
                  id="leadtime-air"
                  type="number"
                  label="Lead-time Máy bay (Ngày)"
                  min={0}
                  value={soNgayDiMayBay}
                  onChange={(e) => setSoNgayDiMayBay(parseInt(e.target.value) || 0)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/orders/site-config')} className="font-semibold">
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  loading={saving}
                  className="font-bold px-6 shadow-lg shadow-emerald-500/10"
                >
                  Lưu cấu hình logistics
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
