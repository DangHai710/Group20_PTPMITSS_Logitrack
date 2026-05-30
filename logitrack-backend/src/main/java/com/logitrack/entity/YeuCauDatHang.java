package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "yeu_cau_dat_hang")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YeuCauDatHang {
    @Id
    @Column(name = "ma_yc", length = 100)
    private String maYc;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "trang_thai", nullable = false)
    private String trangThai; // CHO_XU_LY, DA_XU_LY, DA_HUY

    @Column(name = "nguoi_tao", nullable = false)
    private String nguoiTao;

    @OneToMany(mappedBy = "yeuCauDatHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChiTietYeuCau> chiTietYeuCaus;
}
