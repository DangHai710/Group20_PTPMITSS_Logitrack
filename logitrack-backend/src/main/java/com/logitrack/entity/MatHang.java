package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mat_hang")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatHang {
    @Id
    @Column(name = "ma_hang", length = 100)
    private String maHang; // SKU

    @Column(name = "ten_hang", nullable = false)
    private String tenHang;

    @Column(name = "don_vi_tinh", nullable = false)
    private String donViTinh; // Chiếc, Hộp, Bộ, Khay, Kg

    @Column(name = "category")
    private String category;

    @Column(name = "trang_thai", nullable = false)
    private String trangThai; // Đang kinh doanh, Ngừng kinh doanh

    @Column(name = "quy_cach")
    private String quyCach;
}
