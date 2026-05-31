package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "chi_tiet_don_dat_hang")
@IdClass(ChiTietDonDatHangId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonDatHang {
    @Id
    @ManyToOne
    @JoinColumn(name = "ma_po", nullable = false)
    @JsonIgnore
    private DonDatHang donDatHang;

    @Id
    @ManyToOne
    @JoinColumn(name = "ma_hang", nullable = false)
    private MatHang matHang;

    @Column(name = "so_luong_dat", nullable = false)
    private Integer soLuongDat;

    @Column(name = "don_vi_tinh", nullable = false)
    private String donViTinh;
}
