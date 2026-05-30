// File: src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import apiService from '@/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Vui lòng điền đầy đủ email và mật khẩu!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login({ email, password });
      toast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      
      // Lưu thông tin phiên đăng nhập vào LocalStorage
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userRole', response.role);

      // Chuyển hướng người dùng sang trang Dashboard tổng quan
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      const errorMsg = error.response?.data?.message || 'Kết nối máy chủ Backend thất bại!';
      toast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-slate-50 via-slate-100 to-blue-50 px-4">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl"></div>

      <Card className="w-full max-w-md border-slate-200/50 shadow-2xl">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
            LogiTrack B2B
          </CardTitle>
          <CardDescription className="text-slate-500">
            Hệ thống Quản lý Logistics & Phân bổ Chuỗi cung ứng
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Tài khoản Email"
              placeholder="Tài khoản email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              }
            />

            <div className="space-y-1">
              <Input
                id="password"
                type="password"
                label="Mật khẩu bảo mật"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
              <div className="flex justify-end text-xs text-slate-400">
            
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 shadow-lg shadow-blue-500/10 text-sm font-semibold rounded-xl mt-4"
              loading={loading}
            >
              Đăng nhập hệ thống
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Footer copyright */}
      <footer className="mt-8 text-center text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} LogiTrack Group. 
      </footer>
    </div>
  );
}
