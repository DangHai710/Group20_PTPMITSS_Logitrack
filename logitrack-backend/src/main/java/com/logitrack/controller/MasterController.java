package com.logitrack.controller;

import com.logitrack.dto.*;
import com.logitrack.entity.*;
import com.logitrack.exception.AllocationException;
import com.logitrack.repository.*;
import com.logitrack.service.core.AllocationService;
import com.logitrack.service.core.ReceiptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class MasterController {
    private static final Logger log = LoggerFactory.getLogger(MasterController.class);

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private MathHangRepository mathHangRepository;

    @Autowired
    private YeuCauDatHangRepository yeuCauDatHangRepository;

    @Autowired
    private ChiTietYeuCauRepository chiTietYeuCauRepository;

    @Autowired
    private ImportSiteRepository importSiteRepository;

    @Autowired
    private ThongTinKhoRepository thongTinKhoRepository;

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Autowired
    private AllocationService allocationService;

    @Autowired
    private ReceiptService receiptService;

    // ==========================================
    // 1. PHÂN HỆ AUTHENTICATION
    // ==========================================
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        log.info("[API Auth] Tiếp nhận yêu cầu đăng nhập: {}", loginRequest.getEmail());
        Optional<Account> accountOpt = accountRepository.findByEmail(loginRequest.getEmail());
        
        if (accountOpt.isPresent() && accountOpt.get().getPassword().equals(loginRequest.getPassword())) {
            Account account = accountOpt.get();
            log.info("[API Auth] Đăng nhập thành công: {} | Vai trò: {}", account.getEmail(), account.getRole());
            return ResponseEntity.ok(AccountResponse.builder()
                    .email(account.getEmail())
                    .role(account.getRole())
                    .build());
        }
        
        log.warn("[API Auth] Đăng nhập thất bại: {}", loginRequest.getEmail());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!"));
    }

    // ==========================================
    // 2. PHÂN HỆ QUẢN LÝ VẬT TƯ (Sales Dept - UC01)
    // ==========================================
    @GetMapping("/items")
    public ResponseEntity<List<MathHang>> getAllItems() {
        return ResponseEntity.ok(mathHangRepository.findAll());
    }

    @PostMapping("/items")
    public ResponseEntity<?> createItem(@RequestBody MathHang mathHang) {
        log.info("[API SKU] Khai báo vật tư mới SKU: {}", mathHang.getMaHang());
        if (mathHangRepository.existsById(mathHang.getMaHang())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Mã SKU này đã tồn tại trên hệ thống!"));
        }
        MathHang saved = mathHangRepository.save(mathHang);
        
        // Khởi tạo tồn kho mặc định = 0 tại tất cả các Site cho SKU mới này để tránh lỗi NullPointer
        List<ImportSite> sites = importSiteRepository.findAll();
        for (ImportSite site : sites) {
            thongTinKhoRepository.save(ThongTinKho.builder()
                    .importSite(site)
                    .mathHang(saved)
                    .soLuongTon(0)
                    .donViTinh(saved.getDonViTinh())
                    .build());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/items/{maHang}")
    public ResponseEntity<?> updateItem(@PathVariable String maHang, @RequestBody MathHang mathHangDetails) {
        log.info("[API SKU] Cập nhật thông tin SKU: {}", maHang);
        return mathHangRepository.findById(maHang)
                .map(item -> {
                    item.setTenHang(mathHangDetails.getTenHang());
                    item.setDonViTinh(mathHangDetails.getDonViTinh());
                    item.setCategory(mathHangDetails.getCategory());
                    item.setTrangThai(mathHangDetails.getTrangThai());
                    item.setQuyCach(mathHangDetails.getQuyCach());
                    MathHang updated = mathHangRepository.save(item);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/items/{maHang}")
    public ResponseEntity<?> deleteItem(@PathVariable String maHang) {
        log.info("[API SKU] Yêu cầu xóa SKU: {}", maHang);
        Optional<MathHang> itemOpt = mathHangRepository.findById(maHang);
        if (!itemOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        MathHang item = itemOpt.get();
        
        // Kiểm tra xem SKU có đang tồn tại trong phiếu yêu cầu hoặc đơn hàng PO nào không
        boolean inRequests = chiTietYeuCauRepository.existsByMathHangMaHang(maHang);
        boolean inPOs = chiTietDonDatHangRepository.existsByMathHangMaHang(maHang);
        
        if (inRequests || inPOs) {
            // Nếu có đơn hàng/yêu cầu lịch sử, tự động đổi trạng thái sang "Ngừng kinh doanh" để bảo toàn lịch sử dữ liệu
            item.setTrangThai("Ngừng kinh doanh");
            mathHangRepository.save(item);
            log.info("[API SKU] SKU {} đã có lịch sử giao dịch. Tự động chuyển trạng thái sang Ngừng kinh doanh.", maHang);
            return ResponseEntity.ok(Map.of(
                "action", "UPDATE_STATUS",
                "message", "Mặt hàng này đã có lịch sử giao dịch! Hệ thống tự động chuyển trạng thái sang 'Ngừng kinh doanh' để bảo toàn dữ liệu lịch sử."
            ));
        }
        
        // Xóa thông tin tồn kho tại các site đối tác trước
        thongTinKhoRepository.deleteByMathHangMaHang(maHang);
        
        // Xóa mặt hàng vật lý
        mathHangRepository.deleteById(maHang);
        log.info("[API SKU] Đã xóa vật lý thành công SKU: {}", maHang);
        return ResponseEntity.ok(Map.of(
            "action", "DELETE_PHYSICAL",
            "message", "Đã xóa thành công mặt hàng khỏi hệ thống!"
        ));
    }

    // ==========================================
    // 3. PHÂN HỆ LẬP YÊU CẦU ĐẶT HÀNG (Sales Dept - UC02)
    // ==========================================
    @GetMapping("/orders")
    public ResponseEntity<List<YeuCauDatHang>> getAllRequests() {
        return ResponseEntity.ok(yeuCauDatHangRepository.findAllByOrderByNgayTaoDesc());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<YeuCauDatHang> getRequestById(@PathVariable String id) {
        return yeuCauDatHangRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders/request")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> payload) {
        log.info("[API Request] Lập phiếu yêu cầu mới");
        try {
            String nguoiTao = (String) payload.get("nguoiTao");
            List<Map<String, Object>> itemsPayload = (List<Map<String, Object>>) payload.get("items");

            String maYc = "REQ-" + LocalDate.now().toString().replace("-", "") + "-" + (System.currentTimeMillis() % 10000);
            
            YeuCauDatHang yeuCau = YeuCauDatHang.builder()
                    .maYc(maYc)
                    .ngayTao(LocalDateTime.now())
                    .trangThai("CHO_XU_LY")
                    .nguoiTao(nguoiTao)
                    .build();

            YeuCauDatHang savedYeuCau = yeuCauDatHangRepository.save(yeuCau);
            List<ChiTietYeuCau> chiTietEntities = new ArrayList<>();

            for (Map<String, Object> itemMap : itemsPayload) {
                String maHang = (String) itemMap.get("maHang");
                Integer soLuong = (Integer) itemMap.get("soLuong");
                String ngayNhan = (String) itemMap.get("ngayNhanMongMuon"); // ISO format yyyy-MM-dd

                MathHang mathHang = mathHangRepository.findById(maHang)
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mặt hàng: " + maHang));

                ChiTietYeuCau chiTiet = ChiTietYeuCau.builder()
                        .yeuCauDatHang(savedYeuCau)
                        .mathHang(mathHang)
                        .soLuong(soLuong)
                        .ngayNhanMongMuon(java.time.LocalDate.parse(ngayNhan))
                        .build();

                chiTietYeuCauRepository.save(chiTiet);
                chiTietEntities.add(chiTiet);
            }

            savedYeuCau.setChiTietYeuCaus(chiTietEntities);
            log.info("[API Request] Tạo thành công phiếu yêu cầu: {}", maYc);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedYeuCau);
        } catch (Exception e) {
            log.error("[API Request] Lỗi tạo yêu cầu đặt hàng", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // 4. PHÂN HỆ PHÂN BỔ TỐI ƯU (Order Dept - UC03 - Hải)
    // ==========================================
    @PostMapping("/orders/query-stock/{id}")
    public ResponseEntity<?> queryStock(@PathVariable String id) {
        log.info("[API UC006] Tiếp nhận yêu cầu gửi truy vấn tồn kho cho phiếu: {}", id);
        Optional<YeuCauDatHang> yeuCauOpt = yeuCauDatHangRepository.findById(id);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        YeuCauDatHang yeuCau = yeuCauOpt.get();
        if (!"CHO_XU_LY".equals(yeuCau.getTrangThai())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ gửi được truy vấn cho yêu cầu ở trạng thái Chờ xử lý!"));
        }

        List<ChiTietYeuCau> chiTietList = chiTietYeuCauRepository.findByYeuCauDatHangMaYc(id);
        Set<String> maHangSet = new HashSet<>();
        for (ChiTietYeuCau ct : chiTietList) {
            if (ct.getMathHang() != null) {
                maHangSet.add(ct.getMathHang().getMaHang());
            }
        }

        Set<String> targetSites = new HashSet<>();
        for (String maHang : maHangSet) {
            List<ThongTinKho> khoList = thongTinKhoRepository.findByMathHangMaHang(maHang);
            for (ThongTinKho kho : khoList) {
                if (kho.getImportSite() != null && kho.getSoLuongTon() > 0) {
                    targetSites.add(kho.getImportSite().getMaSite());
                }
            }
        }

        if (targetSites.isEmpty()) {
            yeuCau.setTrangThai("KHONG_THE_DAP_UNG");
            yeuCauDatHangRepository.save(yeuCau);
            return ResponseEntity.ok(Map.of(
                "success", false,
                "sitesCount", 0,
                "message", "Không tìm thấy site đối tác nào có lượng hàng tồn kho cho mặt hàng này. Trạng thái yêu cầu chuyển sang Không thể đáp ứng."
            ));
        }

        yeuCau.setTrangThai("DANG_CHO_PHAN_HOI");
        yeuCauDatHangRepository.save(yeuCau);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "sitesCount", targetSites.size(),
            "message", "Đã gửi phiếu truy vấn thành công tới " + targetSites.size() + " site đối tác."
        ));
    }

    @PostMapping("/allocation/process/{id}")
    public ResponseEntity<?> simulateAllocation(@PathVariable String id) {
        log.info("[API Allocation] Khởi chạy mô phỏng thuật toán tối ưu cho: {}", id);
        try {
            AllocationResponseDTO response = allocationService.simulateAllocation(id);
            return ResponseEntity.ok(response);
        } catch (AllocationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/allocation/confirm/{id}")
    public ResponseEntity<?> confirmAllocation(@PathVariable String id, @RequestBody(required = false) List<AllocationDetailDTO> confirmedDetails) {
        log.info("[API Allocation] Xác nhận phê duyệt và sinh đơn PO cho: {}", id);
        try {
            allocationService.confirmAllocation(id, confirmedDetails);
            return ResponseEntity.ok(Map.of("message", "Xác nhận và sinh đơn hàng PO thành công!"));
        } catch (AllocationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // 5. PHÂN HỆ QUẢN LÝ SITES (Order Dept - UC04)
    // ==========================================
    @GetMapping("/sites")
    public ResponseEntity<List<ImportSite>> getAllSites() {
        return ResponseEntity.ok(importSiteRepository.findAll());
    }

    @GetMapping("/sites/{id}")
    public ResponseEntity<ImportSite> getSiteById(@PathVariable String id) {
        return importSiteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/sites/update-leadtime/{id}")
    public ResponseEntity<?> updateLeadtime(@PathVariable String id, @RequestBody Map<String, Integer> leadtimes) {
        log.info("[API Site] Cập nhật Leadtime cho Site: {}", id);
        Optional<ImportSite> siteOpt = importSiteRepository.findById(id);
        if (siteOpt.isPresent()) {
            ImportSite site = siteOpt.get();
            site.setSoNgayDiTau(leadtimes.get("soNgayDiTau"));
            site.setSoNgayDiMayBay(leadtimes.get("soNgayDiMayBay"));
            ImportSite updated = importSiteRepository.save(site);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 6. PHÂN HỆ ĐỐI SOÁT & KIỂM NHẬN KHO (Inventory Dept - UC05 - Dương)
    // ==========================================
    @GetMapping("/receipts/pos")
    public ResponseEntity<List<DonDatHang>> getInboundPOs() {
        // Chỉ lấy các đơn PO đang giao tới hoặc tất cả đơn PO để theo dõi
        return ResponseEntity.ok(donDatHangRepository.findAllByOrderByNgayDatDesc());
    }

    @GetMapping("/receipts/po/{id}")
    public ResponseEntity<?> getPoDetails(@PathVariable String id) {
        Optional<DonDatHang> poOpt = donDatHangRepository.findById(id);
        if (poOpt.isPresent()) {
            DonDatHang po = poOpt.get();
            List<ChiTietDonDatHang> details = chiTietDonDatHangRepository.findByDonDatHangMaPo(id);
            
            // Mapper để trả về chi tiết thông tin đầy đủ kèm mặt hàng
            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (ChiTietDonDatHang ct : details) {
                Map<String, Object> map = new HashMap<>();
                map.put("maHang", ct.getMathHang().getMaHang());
                map.put("tenHang", ct.getMathHang().getTenHang());
                map.put("soLuongDat", ct.getSoLuongDat());
                map.put("donViTinh", ct.getDonViTinh());
                itemsList.add(map);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("maPO", po.getMaPo());
            response.put("maSite", po.getImportSite().getMaSite());
            response.put("tenSite", po.getImportSite().getTenSite());
            response.put("ngayDat", po.getNgayDat());
            response.put("phuongTienVanChuyen", po.getPhuongTienVanChuyen());
            response.put("trangThaiPo", po.getTrangThaiPo());
            response.put("items", itemsList);

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/receipts/confirm")
    public ResponseEntity<?> confirmReceipt(@RequestBody ReceiptAdjustmentDTO adjustmentDTO) {
        log.info("[API Receipt] Bắt đầu xác nhận nhập kho PO: {}", adjustmentDTO.getMaPO());
        try {
            receiptService.processReceipt(adjustmentDTO);
            return ResponseEntity.ok(Map.of("message", "Đồng bộ dữ liệu sang hệ thống kho ngoài thành công!"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Bao gồm lỗi SystemIntegrationException từ Proxy
            log.error("[API Receipt] Gặp lỗi nghiêm trọng, transaction đã rollback.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống bất thường!"));
        }
    }
}
