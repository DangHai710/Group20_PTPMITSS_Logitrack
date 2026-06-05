package com.logitrack.service.impl;

import com.logitrack.entity.MatHang;
import com.logitrack.entity.ImportSite;
import com.logitrack.entity.ThongTinKho;
import com.logitrack.repository.MatHangRepository;
import com.logitrack.repository.ImportSiteRepository;
import com.logitrack.repository.ThongTinKhoRepository;
import com.logitrack.repository.ChiTietYeuCauRepository;
import com.logitrack.repository.ChiTietDonDatHangRepository;
import com.logitrack.service.core.MatHangService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MatHangServiceImpl implements MatHangService {
    private static final Logger log = LoggerFactory.getLogger(MatHangServiceImpl.class);

    @Autowired
    private MatHangRepository matHangRepository;

    @Autowired
    private ImportSiteRepository importSiteRepository;

    @Autowired
    private ThongTinKhoRepository thongTinKhoRepository;

    @Autowired
    private ChiTietYeuCauRepository chiTietYeuCauRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Override
    public List<MatHang> getAllItems() {
        return matHangRepository.findAll();
    }

    @Override
    @Transactional
    public MatHang createItem(MatHang matHang) {
        log.info("[Service SKU] Khai báo vật tư mới SKU: {}", matHang.getMaHang());
        if (matHang.getMaHang() == null || matHang.getMaHang().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã mặt hàng không được trống!");
        }
        if (!matHang.getMaHang().startsWith("SKU-")) {
            throw new IllegalArgumentException("Mã mặt hàng bắt buộc phải bắt đầu bằng tiền tố 'SKU-'!");
        }
        if (matHangRepository.existsById(matHang.getMaHang())) {
            throw new IllegalStateException("Mã SKU này đã tồn tại trên hệ thống!");
        }
        MatHang saved = matHangRepository.save(matHang);
        
        // Khởi tạo tồn kho mặc định = 0 tại tất cả các Site cho SKU mới này
        List<ImportSite> sites = importSiteRepository.findAll();
        for (ImportSite site : sites) {
            thongTinKhoRepository.save(ThongTinKho.builder()
                    .importSite(site)
                    .matHang(saved)
                    .soLuongTon(0)
                    .donViTinh(saved.getDonViTinh())
                    .build());
        }
        return saved;
    }

    @Override
    public MatHang updateItem(String maHang, MatHang matHangDetails) {
        log.info("[Service SKU] Cập nhật thông tin SKU: {}", maHang);
        return matHangRepository.findById(maHang)
                .map(item -> {
                    item.setTenHang(matHangDetails.getTenHang());
                    item.setDonViTinh(matHangDetails.getDonViTinh());
                    item.setCategory(matHangDetails.getCategory());
                    item.setTrangThai(matHangDetails.getTrangThai());
                    item.setQuyCach(matHangDetails.getQuyCach());
                    return matHangRepository.save(item);
                })
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mặt hàng với mã: " + maHang));
    }

    @Override
    @Transactional
    public Map<String, Object> deleteItem(String maHang) {
        log.info("[Service SKU] Yêu cầu xóa SKU: {}", maHang);
        Optional<MatHang> itemOpt = matHangRepository.findById(maHang);
        if (!itemOpt.isPresent()) {
            throw new IllegalArgumentException("Không tìm thấy mặt hàng với mã: " + maHang);
        }
        MatHang item = itemOpt.get();
        
        // Kiểm tra xem SKU có đang tồn tại trong phiếu yêu cầu hoặc đơn hàng PO nào không
        boolean inRequests = chiTietYeuCauRepository.existsByMatHangMaHang(maHang);
        boolean inPOs = chiTietDonDatHangRepository.existsByMatHangMaHang(maHang);
        
        if (inRequests || inPOs) {
            // Nếu có đơn hàng/yêu cầu lịch sử, tự động đổi trạng thái sang "Ngừng kinh doanh" để bảo toàn lịch sử dữ liệu
            item.setTrangThai("Ngừng kinh doanh");
            matHangRepository.save(item);
            log.info("[Service SKU] SKU {} đã có lịch sử giao dịch. Tự động chuyển trạng thái sang Ngừng kinh doanh.", maHang);
            return Map.of(
                "action", "UPDATE_STATUS",
                "message", "Mặt hàng này đã có lịch sử giao dịch! Hệ thống tự động chuyển trạng thái sang 'Ngừng kinh doanh' để bảo toàn dữ liệu lịch sử."
            );
        }
        
        // Xóa thông tin tồn kho tại các site đối tác trước
        thongTinKhoRepository.deleteByMatHangMaHang(maHang);
        
        // Xóa mặt hàng vật lý
        matHangRepository.deleteById(maHang);
        log.info("[Service SKU] Đã xóa vật lý thành công SKU: {}", maHang);
        return Map.of(
            "action", "DELETE_PHYSICAL",
            "message", "Đã xóa thành công mặt hàng khỏi hệ thống!"
        );
    }
}
