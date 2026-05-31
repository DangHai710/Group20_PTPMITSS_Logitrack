package com.logitrack.service.impl;

import com.logitrack.dto.ReceiptAdjustmentDTO;
import com.logitrack.dto.ReceiptItemAdjustmentDTO;
import com.logitrack.entity.ChiTietDonDatHang;
import com.logitrack.entity.DonDatHang;
import com.logitrack.entity.KetQuaKiemNhan;
import com.logitrack.exception.SystemIntegrationException;
import com.logitrack.proxy.ExternalWarehouseProxy;
import com.logitrack.repository.ChiTietDonDatHangRepository;
import com.logitrack.repository.DonDatHangRepository;
import com.logitrack.repository.KetQuaKiemNhanRepository;
import com.logitrack.service.core.ReceiptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReceiptServiceImpl implements ReceiptService {
    private static final Logger log = LoggerFactory.getLogger(ReceiptServiceImpl.class);

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Autowired
    private KetQuaKiemNhanRepository ketQuaKiemNhanRepository;

    @Autowired
    private ExternalWarehouseProxy externalWarehouseProxy;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processReceipt(ReceiptAdjustmentDTO adjustmentDTO) {
        String maPO = adjustmentDTO.getMaPO();
        log.info("[Nghiệp vụ Dương] Tiếp nhận đối soát kiểm kho cho đơn hàng PO: {}", maPO);

        DonDatHang donDatHang = donDatHangRepository.findById(maPO)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt hàng PO: " + maPO));

        if ("HOAN_THANH".equals(donDatHang.getTrangThaiPo())) {
            throw new IllegalStateException("Đơn đặt hàng PO " + maPO + " đã hoàn thành đối soát trước đó!");
        }

        List<ChiTietDonDatHang> chiTietList = chiTietDonDatHangRepository.findByDonDatHangMaPo(maPO);
        Map<String, ChiTietDonDatHang> mapChiTiet = new HashMap<>();
        for (ChiTietDonDatHang ct : chiTietList) {
            mapChiTiet.put(ct.getMatHang().getMaHang(), ct);
        }

        boolean coChênhLệch = false;
        int tongSoLuongThucNhan = 0;
        StringBuilder notesBuilder = new StringBuilder();

        // Duyệt danh sách kiểm nhận thực tế gửi lên từ Frontend
        for (ReceiptItemAdjustmentDTO act : adjustmentDTO.getItems()) {
            String maHang = act.getMaHang();
            int thựcNhận = act.getSoLuongThucNhan();
            String kếtLuận = act.getKetQuaKiemNhan();

            ChiTietDonDatHang ct = mapChiTiet.get(maHang);
            if (ct == null) {
                throw new IllegalArgumentException("Mặt hàng " + maHang + " không có trong đơn PO gốc!");
            }

            int sốLượngĐặt = ct.getSoLuongDat();
            tongSoLuongThucNhan += thựcNhận;

            if (thựcNhận != sốLượngĐặt || !"Đủ hàng".equals(kếtLuận)) {
                coChênhLệch = true;
                notesBuilder.append(String.format("[%s]: Đặt %d, Nhận %d (%s). ", 
                        maHang, sốLượngĐặt, thựcNhận, kếtLuận));
            }
        }

        // Cập nhật trạng thái đơn hàng PO
        if (coChênhLệch) {
            donDatHang.setTrangThaiPo("CO_CHENH_LECH");
            log.warn("[Nghiệp vụ Dương] Phát hiện chênh lệch đối soát trên PO: {}. Chuyển trạng thái sang CO_CHENH_LECH.", maPO);
        } else {
            donDatHang.setTrangThaiPo("HOAN_THANH");
            log.info("[Nghiệp vụ Dương] Khớp dữ liệu 100% trên PO: {}. Chuyển trạng thái sang HOAN_THANH.", maPO);
        }
        donDatHangRepository.save(donDatHang);

        // Lưu trữ kết quả kiểm nhận vào database
        String maKq = "REC-" + maPO.replace("PO-", "") + "-" + System.currentTimeMillis() % 10000;
        String ghiChu = adjustmentDTO.getGhiChuChenhLech();
        if (coChênhLệch) {
            ghiChu = (ghiChu == null || ghiChu.isEmpty()) 
                    ? notesBuilder.toString() 
                    : ghiChu + " | Chi tiết: " + notesBuilder.toString();
        } else {
            ghiChu = (ghiChu == null || ghiChu.isEmpty()) ? "Khớp hàng 100%." : ghiChu;
        }

        KetQuaKiemNhan ketQua = KetQuaKiemNhan.builder()
                .maKq(maKq)
                .donDatHang(donDatHang)
                .soLuongThucNhan(tongSoLuongThucNhan)
                .ghiChuChenhLech(ghiChu)
                .thoiDiemXacNhan(LocalDateTime.now())
                .build();

        ketQuaKiemNhanRepository.save(ketQua);
        log.info("[Nghiệp vụ Dương] Đã ghi nhận KetQuaKiemNhan mã: {}", maKq);

        // Gọi API phi đồng bộ gửi phiếu kiểm kho sang Hệ thống quản lý kho ngoài
        // Chú ý: Vì phương thức được bọc trong @Transactional, nếu phương thức syncStockData ném exception,
        // toàn bộ các thay đổi trên database (cập nhật trạng thái đơn PO và lưu KetQuaKiemNhan) sẽ tự động rollback.
        try {
            externalWarehouseProxy.syncStockData(adjustmentDTO);
        } catch (SystemIntegrationException e) {
            log.error("[Nghiệp vụ Dương] Lỗi đồng bộ hệ thống ngoài. Đang kích hoạt rollback giao dịch nội bộ...");
            throw e; // Ném ngoại lệ ra ngoài để Spring thực hiện rollback
        }
    }
}
