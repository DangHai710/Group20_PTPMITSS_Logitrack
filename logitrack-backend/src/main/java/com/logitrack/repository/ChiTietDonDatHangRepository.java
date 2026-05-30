package com.logitrack.repository;

import com.logitrack.entity.ChiTietDonDatHang;
import com.logitrack.entity.ChiTietDonDatHangId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietDonDatHangRepository extends JpaRepository<ChiTietDonDatHang, ChiTietDonDatHangId> {
    List<ChiTietDonDatHang> findByDonDatHangMaPo(String maPo);
    boolean existsByMathHangMaHang(String maHang);
}
