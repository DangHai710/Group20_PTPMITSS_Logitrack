package com.logitrack.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptItemAdjustmentDTO {
    private String maHang;
    private Integer soLuongThucNhan;
    private String ketQuaKiemNhan; // Đủ hàng, Thiếu hàng, Sai hàng, Hàng lỗi
}
