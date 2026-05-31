package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "thong_tin_kho")
@IdClass(ThongTinKhoId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongTinKho {
    @Id
    @ManyToOne
    @JoinColumn(name = "ma_site", nullable = false)
    private ImportSite importSite;

    @Id
    @ManyToOne
    @JoinColumn(name = "ma_hang", nullable = false)
    private MatHang matHang;

    @Column(name = "so_luong_ton", nullable = false)
    private Integer soLuongTon;

    @Column(name = "don_vi_tinh", nullable = false)
    private String donViTinh;
}
