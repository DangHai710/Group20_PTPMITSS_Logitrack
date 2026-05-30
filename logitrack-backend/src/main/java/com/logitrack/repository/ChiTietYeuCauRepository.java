package com.logitrack.repository;

import com.logitrack.entity.ChiTietYeuCau;
import com.logitrack.entity.ChiTietYeuCauId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietYeuCauRepository extends JpaRepository<ChiTietYeuCau, ChiTietYeuCauId> {
    List<ChiTietYeuCau> findByYeuCauDatHangMaYc(String maYc);
    boolean existsByMathHangMaHang(String maHang);
}
