// File: src/types/index.ts
// TypeScript Interfaces for LogiTrack B2B

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Account {
  id?: number;
  email: string;
  role: 'SALES' | 'ORDER' | 'INVENTORY';
}

export interface MatHang {
  maHang: string; // SKU
  tenHang: string;
  donViTinh: 'Chiếc' | 'Hộp' | 'Bộ' | 'Khay' | 'Kg';
  category?: string;
  trangThai?: 'Đang kinh doanh' | 'Ngừng kinh doanh';
  quyCach?: string;
}

export interface YeuCauDatHang {
  maYc: string;
  ngayTao: string; // ISO string
  trangThai: 'CHO_XU_LY' | 'DANG_CHO_PHAN_HOI' | 'CHO_PHAN_BO' | 'DA_XU_LY' | 'DA_HUY' | 'KHONG_THE_DAP_UNG';
  nguoiTao: string;
  lyDoKhongDapUng?: string;
  chiTietYeuCaus?: ChiTietYeuCau[];
}

export interface ChiTietYeuCau {
  maYc?: string;
  maHang: string;
  soLuong: number;
  ngayNhanMongMuon: string; // yyyy-MM-dd
  matHang?: MatHang;
}

export interface ImportSite {
  maSite: string;
  tenSite: string;
  soNgayDiTau: number;
  soNgayDiMayBay: number;
}

export interface ThongTinKho {
  maSite: string;
  maHang: string;
  soLuongTon: number;
  donViTinh: string;
  importSite?: ImportSite;
  matHang?: MatHang;
}

export interface DonDatHang {
  maPo: string;
  maSite: string;
  importSite?: ImportSite;
  ngayDat: string; // ISO string
  phuongTienVanChuyen: 'ship delivery' | 'air delivery';
  trangThaiPo: 'DANG_GIAO' | 'HOAN_THANH' | 'CO_CHENH_LECH';
  chiTietDonDatHangs?: ChiTietDonDatHang[];
}

export interface ChiTietDonDatHang {
  maPo?: string;
  maHang: string;
  soLuongDat: number;
  donViTinh: string;
  matHang?: MatHang;
}

export interface KetQuaKiemNhan {
  maKq: string;
  maPo: string;
  soLuongThucNhan: number;
  ghiChuChenhLech?: string;
  thoiDiemXacNhan: string;
}

export interface ReceiptItemAdjustment {
  maHang: string;
  tenHang: string;
  soLuongDat: number;
  soLuongThucNhan: number;
  ketQuaKiemNhan: 'Đủ hàng' | 'Thiếu hàng' | 'Sai hàng' | 'Hàng lỗi';
}

export interface ReceiptAdjustment {
  maPO: string;
  ghiChuChenhLech: string;
  items: ReceiptItemAdjustment[];
}

export interface FeasibleSite {
  maSite: string;
  tenSite: string;
  soLuongTon: number;
  phuongTienVanChuyen: 'ship delivery' | 'air delivery';
  soNgayVanChuyen: number;
}

export interface AllocationDetail {
  maHang: string;
  tenHang: string;
  soLuongYeuCau: number;
  maSite: string;
  tenSite: string;
  soLuongPhanBo: number;
  phuongTienVanChuyen: 'ship delivery' | 'air delivery';
  soNgayVanChuyen: number;
  feasibleSites?: FeasibleSite[];
}

export interface AllocationResponse {
  maYc: string;
  trangThai: 'CHO_XU_LY' | 'DA_XU_LY';
  details: AllocationDetail[];
}
