package com.logitrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "don_dat_hang")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonDatHang {
    @Id
    @Column(name = "ma_po", length = 100)
    private String maPo;

    @ManyToOne
    @JoinColumn(name = "ma_site", nullable = false)
    private ImportSite importSite;

    @Column(name = "ngay_dat", nullable = false)
    private LocalDateTime ngayDat;

    @Column(name = "phuong_tien_van_chuyen", nullable = false)
    private String phuongTienVanChuyen; // ship delivery, air delivery

    @Column(name = "trang_thai_po", nullable = false)
    private String trangThaiPo; // DANG_GIAO, HOAN_THANH, CO_CHENH_LECH

    @OneToMany(mappedBy = "donDatHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChiTietDonDatHang> chiTietDonDatHangs;
}
