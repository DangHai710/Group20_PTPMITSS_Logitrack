-- File: schema.sql
-- Database schema for LogiTrack B2B system (PostgreSQL compliant)
-- Tự động dọn dẹp các cấu trúc bảng cũ nếu tồn tại trước khi khởi tạo cấu trúc mới
DROP TABLE IF EXISTS ket_qua_kiem_nhan CASCADE;
DROP TABLE IF EXISTS chi_tiet_don_dat_hang CASCADE;
DROP TABLE IF EXISTS don_dat_hang CASCADE;
DROP TABLE IF EXISTS thong_tin_kho CASCADE;
DROP TABLE IF EXISTS chi_tiet_yeu_cau CASCADE;
DROP TABLE IF EXISTS yeu_cau_dat_hang CASCADE;
DROP TABLE IF EXISTS mat_hang CASCADE;
DROP TABLE IF EXISTS import_site CASCADE;
DROP TABLE IF EXISTS account CASCADE;

-- 1. Table: account
CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SALES', 'ORDER', 'INVENTORY'))
);

-- 2. Table: mat_hang (Item SKU Catalog)
CREATE TABLE mat_hang (
    ma_hang VARCHAR(100) PRIMARY KEY,
    ten_hang VARCHAR(255) NOT NULL,
    don_vi_tinh VARCHAR(50) NOT NULL CHECK (don_vi_tinh IN ('Chiếc', 'Hộp', 'Bộ', 'Khay', 'Kg')),
    category VARCHAR(100),
    trang_thai VARCHAR(50) NOT NULL DEFAULT 'Đang kinh doanh' CHECK (trang_thai IN ('Đang kinh doanh', 'Ngừng kinh doanh')), -- Added to match UC001 specs
    quy_cach VARCHAR(255)                                                                                          -- Added to match UC001 specs
);

-- 3. Table: yeu_cau_dat_hang (Order Request)
CREATE TABLE yeu_cau_dat_hang (
    ma_yc VARCHAR(100) PRIMARY KEY,
    ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(50) NOT NULL CHECK (trang_thai IN ('CHO_XU_LY', 'DANG_CHO_PHAN_HOI', 'KHONG_THE_DAP_UNG', 'DA_XU_LY', 'DA_HUY')),
    nguoi_tao VARCHAR(255) NOT NULL,
    ly_do_khong_dap_ung VARCHAR(255)
);

-- 4. Table: chi_tiet_yeu_cau (Order Request Details)
CREATE TABLE chi_tiet_yeu_cau (
    ma_yc VARCHAR(100) NOT NULL,
    ma_hang VARCHAR(100) NOT NULL,
    so_luong INT NOT NULL CHECK (so_luong > 0),
    ngay_nhan_mong_muon DATE NOT NULL,
    PRIMARY KEY (ma_yc, ma_hang),
    FOREIGN KEY (ma_yc) REFERENCES yeu_cau_dat_hang(ma_yc) ON DELETE CASCADE,
    FOREIGN KEY (ma_hang) REFERENCES mat_hang(ma_hang) ON DELETE CASCADE
);

-- 5. Table: import_site (Overseas 공급 Site)
CREATE TABLE import_site (
    ma_site VARCHAR(100) PRIMARY KEY,
    ten_site VARCHAR(255) NOT NULL,
    so_ngay_di_tau INT NOT NULL CHECK (so_ngay_di_tau >= 0),
    so_ngay_di_may_bay INT NOT NULL CHECK (so_ngay_di_may_bay >= 0),
    other_info TEXT
);

-- 6. Table: thong_tin_kho (Partner Stock Inventory)
CREATE TABLE thong_tin_kho (
    ma_site VARCHAR(100) NOT NULL,
    ma_hang VARCHAR(100) NOT NULL,
    so_luong_ton INT NOT NULL CHECK (so_luong_ton >= 0),
    don_vi_tinh VARCHAR(50) NOT NULL,
    PRIMARY KEY (ma_site, ma_hang),
    FOREIGN KEY (ma_site) REFERENCES import_site(ma_site) ON DELETE CASCADE,
    FOREIGN KEY (ma_hang) REFERENCES mat_hang(ma_hang) ON DELETE CASCADE
);

-- 7. Table: don_dat_hang (Purchase Order - PO)
CREATE TABLE don_dat_hang (
    ma_po VARCHAR(100) PRIMARY KEY,
    ma_site VARCHAR(100) NOT NULL,
    ngay_dat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    phuong_tien_van_chuyen VARCHAR(50) NOT NULL CHECK (phuong_tien_van_chuyen IN ('ship delivery', 'air delivery')),
    trang_thai_po VARCHAR(50) NOT NULL CHECK (trang_thai_po IN ('DANG_GIAO', 'HOAN_THANH', 'CO_CHENH_LECH')),
    FOREIGN KEY (ma_site) REFERENCES import_site(ma_site) ON DELETE CASCADE
);

-- 8. Table: chi_tiet_don_dat_hang (Purchase Order Details)
CREATE TABLE chi_tiet_don_dat_hang (
    ma_po VARCHAR(100) NOT NULL,
    ma_hang VARCHAR(100) NOT NULL,
    so_luong_dat INT NOT NULL CHECK (so_luong_dat > 0),
    don_vi_tinh VARCHAR(50) NOT NULL,
    PRIMARY KEY (ma_po, ma_hang),
    FOREIGN KEY (ma_po) REFERENCES don_dat_hang(ma_po) ON DELETE CASCADE,
    FOREIGN KEY (ma_hang) REFERENCES mat_hang(ma_hang) ON DELETE CASCADE
);

-- 9. Table: ket_qua_kiem_nhan (Inventory Receipt Adjustment)
CREATE TABLE ket_qua_kiem_nhan (
    ma_kq VARCHAR(100) PRIMARY KEY,
    ma_po VARCHAR(100) NOT NULL,
    so_luong_thuc_nhan INT NOT NULL CHECK (so_luong_thuc_nhan >= 0),
    ghi_chu_chenh_lech TEXT,
    thoi_diem_xac_nhan TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_po) REFERENCES don_dat_hang(ma_po) ON DELETE CASCADE
);
