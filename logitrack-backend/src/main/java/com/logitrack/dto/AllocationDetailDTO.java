package com.logitrack.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationDetailDTO {
    private String maHang;
    private String tenHang;
    private Integer soLuongYeuCau;
    private String maSite;
    private String tenSite;
    private Integer soLuongPhanBo;
    private String phuongTienVanChuyen; // ship delivery, air delivery
    private Integer soNgayVanChuyen;
    private List<FeasibleSiteDTO> feasibleSites;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeasibleSiteDTO {
        private String maSite;
        private String tenSite;
        private Integer soLuongTon;
        private String phuongTienVanChuyen; // ship delivery, air delivery
        private Integer soNgayVanChuyen;
    }
}

