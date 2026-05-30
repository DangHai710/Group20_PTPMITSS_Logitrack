package com.logitrack.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptAdjustmentDTO {
    private String maPO;
    private String ghiChuChenhLech;
    private List<ReceiptItemAdjustmentDTO> items;
}
