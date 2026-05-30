package com.logitrack.proxy;

import com.logitrack.dto.ReceiptAdjustmentDTO;
import com.logitrack.exception.SystemIntegrationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class ExternalWarehouseProxy {
    private static final Logger log = LoggerFactory.getLogger(ExternalWarehouseProxy.class);

    /**
     * Đồng bộ dữ liệu phiếu đối soát kiểm kho sang hệ thống kho ngoài.
     * Mặc dù được gọi phi đồng bộ trong thực tế, nhưng để thực hiện cơ chế
     * rollback transactional của luồng đồng bộ này, phương thức này sẽ được gọi
     * trực tiếp trong transaction và ném exception để kích hoạt rollback nếu xảy ra sự cố.
     */
    public void syncStockData(ReceiptAdjustmentDTO adjustmentDTO) {
        log.info("[API Proxy] Đang khởi động đồng bộ dữ liệu sang hệ thống kho ngoài cho đơn PO: {}", adjustmentDTO.getMaPO());
        
        // Mô phỏng độ trễ mạng
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Cơ chế kích hoạt lỗi giả định để kiểm tra Rollback
        if (adjustmentDTO.getGhiChuChenhLech() != null && 
            (adjustmentDTO.getGhiChuChenhLech().contains("trigger_error") || 
             adjustmentDTO.getGhiChuChenhLech().contains("sập mạng") ||
             adjustmentDTO.getGhiChuChenhLech().contains("error"))) {
            
            log.error("[API Proxy] Gặp sự cố kết nối: Máy chủ kho ngoài không phản hồi kết nối (timeout).");
            throw new SystemIntegrationException("Không thể kết nối tới Hệ thống quản lý kho ngoài. Kết nối mạng bị gián đoạn (Timeout 504)!");
        }

        log.info("[API Proxy] Đồng bộ dữ liệu PO {} sang hệ thống kho ngoài hoàn tất thành công 100%.", adjustmentDTO.getMaPO());
    }
}
