package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "chi_tiet_yeu_cau")
@IdClass(ChiTietYeuCauId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietYeuCau {
    @Id
    @ManyToOne
    @JoinColumn(name = "ma_yc", nullable = false)
    @JsonIgnore
    private YeuCauDatHang yeuCauDatHang;

    @Id
    @ManyToOne
    @JoinColumn(name = "ma_hang", nullable = false)
    private MatHang matHang;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "ngay_nhan_mong_muon", nullable = false)
    private LocalDate ngayNhanMongMuon;
}
