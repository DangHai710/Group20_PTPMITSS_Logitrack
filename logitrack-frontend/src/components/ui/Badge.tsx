// File: src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  className = '',
  children,
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-300';
  
  const variants = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-100',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border border-rose-100',
    info: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CHO_XU_LY':
      return <Badge variant="warning">Chờ xử lý</Badge>;
    case 'DANG_CHO_PHAN_HOI':
      return <Badge variant="purple">Đang chờ Site phản hồi</Badge>;
    case 'CHO_PHAN_BO':
      return <Badge variant="primary">Chờ phân bổ</Badge>;
    case 'DA_XU_LY':
      return <Badge variant="success">Đã phân bổ</Badge>;
    case 'KHONG_THE_DAP_UNG':
      return <Badge variant="danger">Không thể đáp ứng</Badge>;
    case 'DA_HUY':
      return <Badge variant="danger">Đã hủy</Badge>;
    case 'DANG_GIAO':
      return <Badge variant="info">Đang giao</Badge>;
    case 'HOAN_THANH':
      return <Badge variant="success">Hoàn thành</Badge>;
    case 'CO_CHENH_LECH':
      return <Badge variant="danger">Có chênh lệch</Badge>;
    case 'ship delivery':
      return <Badge variant="success" className="bg-emerald-100 text-emerald-800">Ship (Đường biển)</Badge>;
    case 'air delivery':
      return <Badge variant="warning" className="bg-amber-100 text-amber-800">Air (Hàng không)</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
