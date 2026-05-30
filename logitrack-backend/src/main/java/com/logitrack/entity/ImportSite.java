package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "import_site")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportSite {
    @Id
    @Column(name = "ma_site", length = 100)
    private String maSite;

    @Column(name = "ten_site", nullable = false)
    private String tenSite;

    @Column(name = "so_ngay_di_tau", nullable = false)
    private Integer soNgayDiTau;

    @Column(name = "so_ngay_di_may_bay", nullable = false)
    private Integer soNgayDiMayBay;

    @Column(name = "other_info")
    private String otherInfo;
}
