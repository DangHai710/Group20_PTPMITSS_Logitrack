package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ket_qua_kiem_nhan")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KetQuaKiemNhan {
    @Id
    @Column(name = "ma_kq", length = 100)
    private String maKq;

    @ManyToOne
    @JoinColumn(name = "ma_po", nullable = false)
    private DonDatHang donDatHang;

    @Column(name = "so_luong_thuc_nhan", nullable = false)
    private Integer soLuongThucNhan;

    @Column(name = "ghi_chu_chenh_lech")
    private String ghiChuChenhLech;

    @Column(name = "thoi_diem_xac_nhan", nullable = false)
    private LocalDateTime thoiDiemXacNhan;
}
