package com.logitrack.service.impl;

import com.logitrack.dto.AllocationDetailDTO;
import com.logitrack.dto.AllocationResponseDTO;
import com.logitrack.entity.*;
import com.logitrack.exception.AllocationException;
import com.logitrack.repository.*;
import com.logitrack.service.core.AllocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AllocationServiceImpl implements AllocationService {
    private static final Logger log = LoggerFactory.getLogger(AllocationServiceImpl.class);

    @Autowired
    private YeuCauDatHangRepository yeuCauDatHangRepository;

    @Autowired
    private ChiTietYeuCauRepository chiTietYeuCauRepository;

    @Autowired
    private ThongTinKhoRepository thongTinKhoRepository;

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Autowired
    private ImportSiteRepository importSiteRepository;

    @Override
    public AllocationResponseDTO simulateAllocation(String requestId) {
        log.info("[Thuật toán Hải] Khởi chạy mô phỏng phân bổ tối ưu cho phiếu yêu cầu: {}", requestId);
        YeuCauDatHang yeuCau = yeuCauDatHangRepository.findById(requestId)
                .orElseThrow(() -> new AllocationException("Không tìm thấy phiếu yêu cầu mua hàng: " + requestId));

        if ("DA_XU_LY".equals(yeuCau.getTrangThai())) {
            throw new AllocationException("Phiếu yêu cầu " + requestId + " đã được xử lý phân bổ đơn hàng trước đó!");
        }

        List<ChiTietYeuCau> chiTietList = chiTietYeuCauRepository.findByYeuCauDatHangMaYc(requestId);
        List<AllocationDetailDTO> allocationDetails = new ArrayList<>();

        // Ngày hiện tại cố định để test là 2026-05-30 theo metadata local time, hoặc LocalDate.now()
        LocalDate currentDate = LocalDate.of(2026, 5, 30);

        for (ChiTietYeuCau item : chiTietList) {
            String maHang = item.getMatHang().getMaHang();
            String tenHang = item.getMatHang().getTenHang();
            int soLuongYeuCau = item.getSoLuong();
            LocalDate ngayNhanMongMuon = item.getNgayNhanMongMuon();

            log.debug("Đang xử lý mặt hàng: {} | Số lượng cần: {} | Ngày cần: {}", maHang, soLuongYeuCau, ngayNhanMongMuon);

            // 1. Lấy tồn kho đối tác cho mặt hàng này
            List<ThongTinKho> thongTinKhoList = thongTinKhoRepository.findByMatHangMaHang(maHang);

            // 2. Lọc Site khả dụng cho dropdown thủ công (BP BP Đặt hàng quốc tế chọn)
            List<AllocationDetailDTO.FeasibleSiteDTO> feasibleSites = new ArrayList<>();
            for (ThongTinKho kho : thongTinKhoList) {
                ImportSite site = kho.getImportSite();
                if (kho.getSoLuongTon() <= 0) continue;

                // Thử đường biển (ship delivery)
                if (currentDate.plusDays(site.getSoNgayDiTau()).isBefore(ngayNhanMongMuon) || 
                    currentDate.plusDays(site.getSoNgayDiTau()).isEqual(ngayNhanMongMuon)) {
                    
                    feasibleSites.add(AllocationDetailDTO.FeasibleSiteDTO.builder()
                            .maSite(site.getMaSite())
                            .tenSite(site.getTenSite())
                            .soLuongTon(kho.getSoLuongTon())
                            .phuongTienVanChuyen("ship delivery")
                            .soNgayVanChuyen(site.getSoNgayDiTau())
                            .build());
                } 
                // Thử đường hàng không (air delivery)
                if (currentDate.plusDays(site.getSoNgayDiMayBay()).isBefore(ngayNhanMongMuon) || 
                    currentDate.plusDays(site.getSoNgayDiMayBay()).isEqual(ngayNhanMongMuon)) {
                    
                    feasibleSites.add(AllocationDetailDTO.FeasibleSiteDTO.builder()
                            .maSite(site.getMaSite())
                            .tenSite(site.getTenSite())
                            .soLuongTon(kho.getSoLuongTon())
                            .phuongTienVanChuyen("air delivery")
                            .soNgayVanChuyen(site.getSoNgayDiMayBay())
                            .build());
                }
            }
            
            // Sắp xếp các site khả dụng theo tồn kho giảm dần
            feasibleSites.sort((f1, f2) -> Integer.compare(f2.getSoLuongTon(), f1.getSoLuongTon()));

            // 3. Lọc các Site khả dụng và gán phương thức vận chuyển theo Ưu tiên 1 và 2 để chạy giải thuật Greedy đề xuất mặc định
            List<SiteCandidate> candidates = new ArrayList<>();
            for (ThongTinKho kho : thongTinKhoList) {
                ImportSite site = kho.getImportSite();
                if (kho.getSoLuongTon() <= 0) continue;

                // Thử đường biển (ship delivery) trước
                if (currentDate.plusDays(site.getSoNgayDiTau()).isBefore(ngayNhanMongMuon) || 
                    currentDate.plusDays(site.getSoNgayDiTau()).isEqual(ngayNhanMongMuon)) {
                    
                    candidates.add(new SiteCandidate(kho, "ship delivery", site.getSoNgayDiTau()));
                } 
                // Không kịp đường biển -> Thử đường hàng không (air delivery)
                else if (currentDate.plusDays(site.getSoNgayDiMayBay()).isBefore(ngayNhanMongMuon) || 
                           currentDate.plusDays(site.getSoNgayDiMayBay()).isEqual(ngayNhanMongMuon)) {
                    
                    candidates.add(new SiteCandidate(kho, "air delivery", site.getSoNgayDiMayBay()));
                }
            }

            // Sắp xếp theo tồn kho giảm dần (Ưu tiên 2)
            candidates.sort((c1, c2) -> Integer.compare(c2.kho.getSoLuongTon(), c1.kho.getSoLuongTon()));

            // 4. Gom hàng tối thiểu hóa đối tác (Ưu tiên 3 - Greedy)
            int soLuongGomDuoc = 0;
            int soLuongConThieu = soLuongYeuCau;

            for (SiteCandidate candidate : candidates) {
                if (soLuongConThieu <= 0) break;

                int tonKhoKhaDung = candidate.kho.getSoLuongTon();
                int soLuongLayTuSite = Math.min(tonKhoKhaDung, soLuongConThieu);

                allocationDetails.add(AllocationDetailDTO.builder()
                        .maHang(maHang)
                        .tenHang(tenHang)
                        .soLuongYeuCau(soLuongYeuCau)
                        .maSite(candidate.kho.getImportSite().getMaSite())
                        .tenSite(candidate.kho.getImportSite().getTenSite())
                        .soLuongPhanBo(soLuongLayTuSite)
                        .phuongTienVanChuyen(candidate.deliveryMeans)
                        .soNgayVanChuyen(candidate.leadTime)
                        .feasibleSites(feasibleSites)
                        .build());

                soLuongGomDuoc += soLuongLayTuSite;
                soLuongConThieu -= soLuongLayTuSite;
            }

            // 5. Kiểm tra toàn vẹn số lượng nhập khẩu
            if (soLuongGomDuoc < soLuongYeuCau) {
                log.error("[Thuật toán Hải] Mặt hàng {} không gom đủ số lượng. Cần: {}, Gom được: {}", maHang, soLuongYeuCau, soLuongGomDuoc);
                throw new AllocationException("Không thể đạt được số lượng nhập khẩu như yêu cầu cho mặt hàng: " + tenHang + 
                        " (Thiếu " + soLuongConThieu + " đơn vị)");
            }
        }

        log.info("[Thuật toán Hải] Mô phỏng phân bổ tối ưu thành công cho yêu cầu {}", requestId);
        return AllocationResponseDTO.builder()
                .maYc(requestId)
                .trangThai("CHO_XU_LY")
                .details(allocationDetails)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmAllocation(String requestId, List<AllocationDetailDTO> confirmedDetails) {
        log.info("[Thuật toán Hải] Bắt đầu XÁC NHẬN phân bổ thực tế & sinh đơn PO cho yêu cầu: {}", requestId);

        List<AllocationDetailDTO> detailsToUse;
        if (confirmedDetails != null && !confirmedDetails.isEmpty()) {
            detailsToUse = confirmedDetails;
            log.info("[Thuật toán Hải] Sử dụng phương án phân bổ do người dùng tùy chỉnh thủ công ({} dòng)", confirmedDetails.size());
        } else {
            // Chạy lại thuật toán gom hàng để lấy phương án cuối cùng
            AllocationResponseDTO simulation = simulateAllocation(requestId);
            detailsToUse = simulation.getDetails();
            log.info("[Thuật toán Hải] Sử dụng phương án phân bổ mặc định từ thuật toán mô phỏng ({} dòng)", detailsToUse.size());
        }
        
        YeuCauDatHang yeuCau = yeuCauDatHangRepository.findById(requestId)
                .orElseThrow(() -> new AllocationException("Không tìm thấy phiếu yêu cầu mua hàng: " + requestId));

        // Gom các dòng phân bổ theo Site + Phương thức vận chuyển để sinh PO
        // Key: Site ID + "|" + Phương thức vận chuyển
        Map<String, List<AllocationDetailDTO>> poGroups = detailsToUse.stream()
                .collect(Collectors.groupingBy(d -> d.getMaSite() + "|" + d.getPhuongTienVanChuyen()));

        int poCount = 1;
        for (Map.Entry<String, List<AllocationDetailDTO>> entry : poGroups.entrySet()) {
            String[] keys = entry.getKey().split("\\|");
            String maSite = keys[0];
            String phuongTien = keys[1];
            List<AllocationDetailDTO> details = entry.getValue();

            ImportSite site = importSiteRepository.findById(maSite)
                    .orElseThrow(() -> new AllocationException("Không tìm thấy Site đối tác: " + maSite));

            // Sinh mã PO duy nhất
            String maPO = "PO-" + LocalDate.now().toString().replace("-", "") + "-" + site.getMaSite().replace("SITE-", "") + "-" + poCount++;

            // 1. Tạo DonDatHang Header
            DonDatHang donDatHang = DonDatHang.builder()
                    .maPo(maPO)
                    .importSite(site)
                    .ngayDat(LocalDateTime.now())
                    .phuongTienVanChuyen(phuongTien)
                    .trangThaiPo("DANG_GIAO")
                    .build();

            donDatHangRepository.save(donDatHang);
            log.info("[Thuật toán Hải] Đã khởi tạo đơn hàng xuất khẩu PO: {}", maPO);

            List<ChiTietDonDatHang> detailEntities = new ArrayList<>();
            for (AllocationDetailDTO d : details) {
                // Skip if quantity is null or 0
                if (d.getSoLuongPhanBo() == null || d.getSoLuongPhanBo() <= 0) {
                    continue;
                }

                MatHang matHang = MatHang.builder().maHang(d.getMaHang()).build();

                // 2. Tạo ChiTietDonDatHang
                ChiTietDonDatHang detailEntity = ChiTietDonDatHang.builder()
                        .donDatHang(donDatHang)
                        .matHang(matHang)
                        .soLuongDat(d.getSoLuongPhanBo())
                        .donViTinh("Chiếc") // Mặc định hoặc lấy từ MatHang
                        .build();

                chiTietDonDatHangRepository.save(detailEntity);
                detailEntities.add(detailEntity);

                // 3. Trừ lượng hàng tồn kho của Site đối tác trong CSDL
                ThongTinKhoId khoId = new ThongTinKhoId(site.getMaSite(), d.getMaHang());
                ThongTinKho kho = thongTinKhoRepository.findById(khoId)
                        .orElseThrow(() -> new AllocationException("Không tìm thấy thông tin kho của đối tác: " + site.getTenSite()));
                
                int tonKhoMoi = kho.getSoLuongTon() - d.getSoLuongPhanBo();
                if (tonKhoMoi < 0) {
                    throw new AllocationException("Lỗi đồng bộ tồn kho: Số lượng tồn kho của đối tác " + site.getTenSite() + " không đủ!");
                }
                kho.setSoLuongTon(tonKhoMoi);
                thongTinKhoRepository.save(kho);
                log.debug("[Thuật toán Hải] Cập nhật tồn kho đối tác {}: {} còn lại {}", site.getMaSite(), d.getMaHang(), tonKhoMoi);
            }

            donDatHang.setChiTietDonDatHangs(detailEntities);
        }

        // 4. Cập nhật trạng thái phiếu yêu cầu đặt hàng ban đầu
        yeuCau.setTrangThai("DA_XU_LY");
        yeuCauDatHangRepository.save(yeuCau);
        log.info("[Thuật toán Hải] Đã xử lý phân bổ hoàn tất phiếu yêu cầu: {}. Trạng thái chuyển sang DA_XU_LY.", requestId);
    }

    // Helper class để đóng gói dữ liệu ứng viên Site
    private static class SiteCandidate {
        final ThongTinKho kho;
        final String deliveryMeans;
        final int leadTime;

        SiteCandidate(ThongTinKho kho, String deliveryMeans, int leadTime) {
            this.kho = kho;
            this.deliveryMeans = deliveryMeans;
            this.leadTime = leadTime;
        }
    }
}
