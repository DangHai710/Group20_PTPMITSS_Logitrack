package com.logitrack.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationResponseDTO {
    private String maYc;
    private String trangThai; // CHO_XU_LY, DA_XU_LY
    private List<AllocationDetailDTO> details;
}
