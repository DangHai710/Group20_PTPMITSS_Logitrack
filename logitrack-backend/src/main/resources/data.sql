-- File: data.sql
-- Expanded Seed data for LogiTrack B2B system (PostgreSQL/H2 compatible)

-- ==========================================
-- 1. SEED ACCOUNTS
-- ==========================================
INSERT INTO account (email, password, role) VALUES 
('sales@logitrack.com', 'sales123', 'SALES'),
('order@logitrack.com', 'order123', 'ORDER'),
('inventory@logitrack.com', 'inventory123', 'INVENTORY'),
('admin@logitrack.com', 'admin123', 'ORDER')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 2. SEED MATH_HANG (35 SKUs with trang_thai and quy_cach)
-- ==========================================
INSERT INTO math_hang (ma_hang, ten_hang, don_vi_tinh, category, trang_thai, quy_cach) VALUES
('SKU-MON-001', 'Màn hình Dell UltraSharp 24 inch', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-MON-002', 'Màn hình LG Gaming UltraGear 27 inch', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-MON-003', 'Màn hình ASUS ProArt 27 inch 4K', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-KEY-001', 'Bàn phím cơ Keychron K2 Wireless', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-KEY-002', 'Bàn phím Logitech MX Keys Mini', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-KEY-003', 'Bàn phím cơ Razer BlackWidow V4', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-MOU-001', 'Chuột Logitech MX Master 3S', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-MOU-002', 'Chuột Razer DeathAdder V3 Pro', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-MOU-003', 'Chuột Apple Magic Mouse 2', 'Chiếc', 'Accessories', 'Ngừng kinh doanh', '1 chiếc/hộp'), -- Discontinued
('SKU-CAB-001', 'Cáp HDMI High Speed Ugreen 2m', 'Hộp', 'Cables', 'Đang kinh doanh', '1 sợi/hộp'),
('SKU-CAB-002', 'Cáp USB-C to Lightning Anker 1.8m', 'Hộp', 'Cables', 'Đang kinh doanh', '1 sợi/hộp'),
('SKU-CAB-003', 'Cáp mạng Cat6 Baseus 5m', 'Hộp', 'Cables', 'Đang kinh doanh', '1 sợi/hộp'),
('SKU-EAR-001', 'Tai nghe Sony WH-1000XM5 ANC', 'Bộ', 'Audio', 'Đang kinh doanh', '1 tai nghe, 1 cáp sạc, 1 hộp đựng/bộ'),
('SKU-EAR-002', 'Tai nghe AirPods Pro Gen 2', 'Bộ', 'Audio', 'Đang kinh doanh', '1 tai nghe, 1 hộp sạc, 1 cáp sạc/bộ'),
('SKU-EAR-003', 'Tai nghe Marshall Major IV', 'Bộ', 'Audio', 'Đang kinh doanh', '1 bộ/hộp'),
('SKU-LAP-001', 'Laptop MacBook Air M2 8GB 256GB', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-LAP-002', 'Laptop Dell XPS 13 9315 Core i7', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-LAP-003', 'Laptop ThinkPad X1 Carbon Gen 10', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-HUB-001', 'Cổng chuyển USB-C Hub 8-in-1 HyperDrive', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-HUB-002', 'Cổng chuyển USB-C Hub Baseus 6-in-1', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-OFF-001', 'Giấy in Double A A4 80gsm (500 tờ)', 'Hộp', 'Office', 'Đang kinh doanh', '500 tờ/ream, 5 ream/thùng'),
('SKU-OFF-002', 'Bút bi Thiên Long 0.5mm xanh (20 cây)', 'Hộp', 'Office', 'Đang kinh doanh', '20 cây/hộp'),
('SKU-OFF-003', 'Sổ da NoteBook A5 bìa cứng cao cấp', 'Hộp', 'Office', 'Đang kinh doanh', '10 quyển/hộp'),
('SKU-POW-001', 'Sạc dự phòng Anker 20000mAh 22.5W', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-POW-002', 'Sạc Baseus GaN5 Pro 65W 3 cổng', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-TAB-001', 'Máy tính bảng iPad Air 5 M1 Wifi 64GB', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-TAB-002', 'Máy tính bảng Samsung Galaxy Tab S8', 'Chiếc', 'Electronics', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-CAM-001', 'Webcam Logitech C920 Pro HD 1080p', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-CAM-002', 'Máy ảnh Sony Alpha A6400 (Body)', 'Bộ', 'Electronics', 'Đang kinh doanh', '1 máy ảnh, 1 pin, 1 sạc/bộ'),
('SKU-MIC-001', 'Micro thu âm Rode VideoMicro Go', 'Bộ', 'Audio', 'Đang kinh doanh', '1 bộ/hộp'),
('SKU-MIC-002', 'Micro thu âm Shure MV7 Podcast', 'Bộ', 'Audio', 'Đang kinh doanh', '1 bộ/hộp'),
('SKU-BOX-001', 'Ổ cứng di động SSD Samsung T7 1TB', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-BOX-002', 'Ổ cứng di động HDD WD Elements 2TB', 'Chiếc', 'Accessories', 'Đang kinh doanh', '1 chiếc/hộp'),
('SKU-CHA-001', 'Ghế công thái học Ergonomic Sihoo M57', 'Chiếc', 'Office', 'Đang kinh doanh', 'Khung lắp ráp/hộp'),
('SKU-CHA-002', 'Ghế Gaming Razer Iskur X Black', 'Chiếc', 'Office', 'Đang kinh doanh', 'Khung lắp ráp/hộp')
ON CONFLICT (ma_hang) DO NOTHING;

-- ==========================================
-- 3. SEED IMPORT_SITE (10 Global Sites)
-- ==========================================
INSERT INTO import_site (ma_site, ten_site, so_ngay_di_tau, so_ngay_di_may_bay, other_info) VALUES
('SITE-SHENZHEN', 'Shenzhen Logistics Hub (China)', 7, 2, 'Trung tâm logistics lớn nhất Quảng Đông, ưu tiên vận chuyển đường biển giá tốt'),
('SITE-SEOUL', 'Seoul Express Depot (South Korea)', 5, 1, 'Kho hàng không tốc độ cao tại Incheon, dịch vụ hàng không cực tốt'),
('SITE-TOKYO', 'Tokyo Global Port (Japan)', 10, 3, 'Kho ngoại quan cảng Tokyo, xử lý hải quan nhanh chóng'),
('SITE-SINGAPORE', 'Changi Transit Terminal (Singapore)', 4, 1, 'Hub luân chuyển Đông Nam Á, phù hợp vận chuyển các thiết bị nhỏ'),
('SITE-TAIPEI', 'Hsinchu High-Tech Hub (Taiwan)', 6, 2, 'Trung tâm công nghệ Hsinchu, đóng gói bán thành phẩm linh kiện điện tử'),
('SITE-FRANKFURT', 'Frankfurt Cargo City (Germany)', 28, 4, 'Trung tâm logistics lớn nhất Châu Âu, chuyên thiết bị cao cấp từ Đức'),
('SITE-LOSANGELES', 'Los Angeles Maritime Hub (USA)', 20, 3, 'Kho bờ Tây Hoa Kỳ, cung cấp các mặt hàng chính hãng Apple và Razer'),
('SITE-BANGKOK', 'Bangkok Industrial Depot (Thailand)', 3, 1, 'Kho công nghiệp phụ trợ Thái Lan, chi phí logistics đường biển rẻ'),
('SITE-KUALALUMPUR', 'Kuala Lumpur Supply Depot (Malaysia)', 4, 1, 'Cung ứng văn phòng phẩm và phụ kiện, kết nối đường biển tốc độ tốt'),
('SITE-SHANGHAI', 'Shanghai Waigaoqiao Port (China)', 8, 2, 'Kho cảng tự do ngoại quan Thượng Hải, cung ứng các dòng màn hình lớn')
ON CONFLICT (ma_site) DO NOTHING;

-- ==========================================
-- 4. SEED THONG_TIN_KHO (80+ inventory records)
-- ==========================================
-- Site Shenzhen
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-SHENZHEN', 'SKU-MON-001', 50, 'Chiếc'),
('SITE-SHENZHEN', 'SKU-MON-002', 40, 'Chiếc'),
('SITE-SHENZHEN', 'SKU-KEY-001', 150, 'Chiếc'),
('SITE-SHENZHEN', 'SKU-KEY-002', 120, 'Chiếc'),
('SITE-SHENZHEN', 'SKU-MOU-001', 80, 'Chiếc'),
('SITE-SHENZHEN', 'SKU-CAB-001', 500, 'Hộp'),
('SITE-SHENZHEN', 'SKU-CAB-002', 400, 'Hộp'),
('SITE-SHENZHEN', 'SKU-CAB-003', 300, 'Hộp'),
('SITE-SHENZHEN', 'SKU-EAR-001', 30, 'Bộ'),
('SITE-SHENZHEN', 'SKU-POW-002', 120, 'Chiếc'),
('SITE-SHENZHEN', 'SKU-OFF-001', 100, 'Hộp'),
('SITE-SHENZHEN', 'SKU-OFF-002', 500, 'Hộp')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Seoul
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-SEOUL', 'SKU-MON-001', 80, 'Chiếc'),
('SITE-SEOUL', 'SKU-MON-003', 35, 'Chiếc'),
('SITE-SEOUL', 'SKU-KEY-001', 30, 'Chiếc'),
('SITE-SEOUL', 'SKU-KEY-002', 90, 'Chiếc'),
('SITE-SEOUL', 'SKU-MOU-001', 100, 'Chiếc'),
('SITE-SEOUL', 'SKU-MOU-002', 45, 'Chiếc'),
('SITE-SEOUL', 'SKU-EAR-001', 60, 'Bộ'),
('SITE-SEOUL', 'SKU-EAR-002', 120, 'Bộ'),
('SITE-SEOUL', 'SKU-LAP-001', 25, 'Chiếc'),
('SITE-SEOUL', 'SKU-TAB-001', 40, 'Chiếc'),
('SITE-SEOUL', 'SKU-CAM-001', 70, 'Chiếc'),
('SITE-SEOUL', 'SKU-BOX-001', 150, 'Chiếc')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Tokyo
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-TOKYO', 'SKU-MON-002', 60, 'Chiếc'),
('SITE-TOKYO', 'SKU-KEY-001', 200, 'Chiếc'),
('SITE-TOKYO', 'SKU-MOU-001', 80, 'Chiếc'),
('SITE-TOKYO', 'SKU-MOU-003', 95, 'Chiếc'),
('SITE-TOKYO', 'SKU-EAR-001', 50, 'Bộ'),
('SITE-TOKYO', 'SKU-EAR-003', 85, 'Bộ'),
('SITE-TOKYO', 'SKU-LAP-003', 20, 'Chiếc'),
('SITE-TOKYO', 'SKU-POW-001', 110, 'Chiếc'),
('SITE-TOKYO', 'SKU-TAB-002', 30, 'Chiếc'),
('SITE-TOKYO', 'SKU-CAM-002', 15, 'Bộ'),
('SITE-TOKYO', 'SKU-MIC-002', 40, 'Bộ'),
('SITE-TOKYO', 'SKU-BOX-002', 250, 'Chiếc')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Singapore
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-SINGAPORE', 'SKU-MON-001', 30, 'Chiếc'),
('SITE-SINGAPORE', 'SKU-KEY-002', 50, 'Chiếc'),
('SITE-SINGAPORE', 'SKU-MOU-001', 60, 'Chiếc'),
('SITE-SINGAPORE', 'SKU-CAB-001', 200, 'Hộp'),
('SITE-SINGAPORE', 'SKU-EAR-002', 45, 'Bộ'),
('SITE-SINGAPORE', 'SKU-HUB-001', 90, 'Chiếc'),
('SITE-SINGAPORE', 'SKU-HUB-002', 120, 'Chiếc'),
('SITE-SINGAPORE', 'SKU-POW-002', 80, 'Chiếc'),
('SITE-SINGAPORE', 'SKU-OFF-003', 150, 'Hộp')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Taipei
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-TAIPEI', 'SKU-MON-002', 45, 'Chiếc'),
('SITE-TAIPEI', 'SKU-MON-003', 30, 'Chiếc'),
('SITE-TAIPEI', 'SKU-KEY-003', 70, 'Chiếc'),
('SITE-TAIPEI', 'SKU-MOU-002', 65, 'Chiếc'),
('SITE-TAIPEI', 'SKU-CAB-002', 150, 'Hộp'),
('SITE-TAIPEI', 'SKU-HUB-001', 110, 'Chiếc'),
('SITE-TAIPEI', 'SKU-LAP-002', 15, 'Chiếc'),
('SITE-TAIPEI', 'SKU-POW-002', 95, 'Chiếc')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Los Angeles
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-LOSANGELES', 'SKU-KEY-003', 100, 'Chiếc'),
('SITE-LOSANGELES', 'SKU-MOU-002', 120, 'Chiếc'),
('SITE-LOSANGELES', 'SKU-EAR-002', 80, 'Bộ'),
('SITE-LOSANGELES', 'SKU-EAR-003', 50, 'Bộ'),
('SITE-LOSANGELES', 'SKU-LAP-001', 40, 'Chiếc'),
('SITE-LOSANGELES', 'SKU-LAP-002', 30, 'Chiếc'),
('SITE-LOSANGELES', 'SKU-TAB-001', 65, 'Chiếc'),
('SITE-LOSANGELES', 'SKU-BOX-001', 200, 'Chiếc'),
('SITE-LOSANGELES', 'SKU-CHA-002', 25, 'Chiếc')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Frankfurt
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-FRANKFURT', 'SKU-MON-003', 25, 'Chiếc'),
('SITE-FRANKFURT', 'SKU-KEY-002', 40, 'Chiếc'),
('SITE-FRANKFURT', 'SKU-EAR-001', 35, 'Bộ'),
('SITE-FRANKFURT', 'SKU-EAR-003', 45, 'Bộ'),
('SITE-FRANKFURT', 'SKU-LAP-003', 15, 'Chiếc'),
('SITE-FRANKFURT', 'SKU-CAM-002', 10, 'Bộ'),
('SITE-FRANKFURT', 'SKU-MIC-002', 20, 'Bộ'),
('SITE-FRANKFURT', 'SKU-BOX-001', 80, 'Chiếc')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- Site Bangkok
INSERT INTO thong_tin_kho (ma_site, ma_hang, so_luong_ton, don_vi_tinh) VALUES
('SITE-BANGKOK', 'SKU-CAB-001', 300, 'Hộp'),
('SITE-BANGKOK', 'SKU-CAB-003', 400, 'Hộp'),
('SITE-BANGKOK', 'SKU-OFF-001', 300, 'Hộp'),
('SITE-BANGKOK', 'SKU-OFF-002', 600, 'Hộp'),
('SITE-BANGKOK', 'SKU-OFF-003', 200, 'Hộp'),
('SITE-BANGKOK', 'SKU-CHA-001', 35, 'Chiếc')
ON CONFLICT (ma_site, ma_hang) DO NOTHING;

-- ==========================================
-- 5. SEED YEU_CAU_DAT_HANG
-- ==========================================
INSERT INTO yeu_cau_dat_hang (ma_yc, ngay_tao, trang_thai, nguoi_tao) VALUES
('REQ-2026-001', '2026-05-28 09:00:00', 'CHO_XU_LY', 'sales@logitrack.com'),
('REQ-2026-002', '2026-05-29 14:30:00', 'CHO_XU_LY', 'sales@logitrack.com'),
('REQ-2026-003', '2026-05-30 08:15:00', 'DA_XU_LY', 'sales@logitrack.com'),
('REQ-2026-004', '2026-05-30 10:00:00', 'CHO_XU_LY', 'sales@logitrack.com')
ON CONFLICT (ma_yc) DO NOTHING;

-- Seed chi_tiet_yeu_cau (Details of order requests)
-- REQ-2026-001: Target arrival is 2026-06-07 (8 days from May 30).
INSERT INTO chi_tiet_yeu_cau (ma_yc, ma_hang, so_luong, ngay_nhan_mong_muon) VALUES
('REQ-2026-001', 'SKU-MON-001', 100, '2026-06-07'),
('REQ-2026-001', 'SKU-KEY-001', 120, '2026-06-07'),
('REQ-2026-001', 'SKU-MOU-001', 80, '2026-06-07')
ON CONFLICT (ma_yc, ma_hang) DO NOTHING;

-- REQ-2026-002: Urgent needs in 4 days! Target arrival is 2026-06-03.
INSERT INTO chi_tiet_yeu_cau (ma_yc, ma_hang, so_luong, ngay_nhan_mong_muon) VALUES
('REQ-2026-002', 'SKU-MOU-002', 50, '2026-06-03'),
('REQ-2026-002', 'SKU-EAR-002', 30, '2026-06-03')
ON CONFLICT (ma_yc, ma_hang) DO NOTHING;

-- REQ-2026-003: Already processed request
INSERT INTO chi_tiet_yeu_cau (ma_yc, ma_hang, so_luong, ngay_nhan_mong_muon) VALUES
('REQ-2026-003', 'SKU-CAB-001', 200, '2026-06-15')
ON CONFLICT (ma_yc, ma_hang) DO NOTHING;

-- REQ-2026-004: Office gear request in 12 days. Target: 2026-06-11
INSERT INTO chi_tiet_yeu_cau (ma_yc, ma_hang, so_luong, ngay_nhan_mong_muon) VALUES
('REQ-2026-004', 'SKU-CHA-001', 30, '2026-06-11'),
('REQ-2026-004', 'SKU-OFF-001', 150, '2026-06-11')
ON CONFLICT (ma_yc, ma_hang) DO NOTHING;

-- ==========================================
-- 6. SEED DON_DAT_HANG (Purchase Orders - POs)
-- ==========================================
INSERT INTO don_dat_hang (ma_po, ma_site, ngay_dat, phuong_tien_van_chuyen, trang_thai_po) VALUES
('PO-2026-001', 'SITE-SHENZHEN', '2026-05-23 10:00:00', 'ship delivery', 'DANG_GIAO'),
('PO-2026-002', 'SITE-SEOUL', '2026-05-28 11:30:00', 'air delivery', 'DANG_GIAO'),
('PO-2026-003', 'SITE-TOKYO', '2026-05-20 15:00:00', 'ship delivery', 'HOAN_THANH'),
('PO-2026-004', 'SITE-SINGAPORE', '2026-05-25 14:00:00', 'ship delivery', 'DANG_GIAO')
ON CONFLICT (ma_po) DO NOTHING;

-- Seed chi_tiet_don_dat_hang (PO details)
INSERT INTO chi_tiet_don_dat_hang (ma_po, ma_hang, so_luong_dat, don_vi_tinh) VALUES
('PO-2026-001', 'SKU-KEY-001', 100, 'Chiếc'),
('PO-2026-001', 'SKU-CAB-001', 200, 'Hộp'),
('PO-2026-002', 'SKU-MOU-002', 50, 'Chiếc'),
('PO-2026-003', 'SKU-MON-002', 30, 'Chiếc'),
('PO-2026-004', 'SKU-HUB-002', 80, 'Chiếc')
ON CONFLICT (ma_po, ma_hang) DO NOTHING;

-- Seed completed results
INSERT INTO ket_qua_kiem_nhan (ma_kq, ma_po, so_luong_thuc_nhan, ghi_chu_chenh_lech, thoi_diem_xac_nhan) VALUES
('REC-2026-001', 'PO-2026-003', 30, 'Khớp hàng 100% khi cập cảng.', '2026-05-30 09:30:00')
ON CONFLICT (ma_kq) DO NOTHING;
