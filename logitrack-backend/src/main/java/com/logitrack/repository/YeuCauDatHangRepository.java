package com.logitrack.repository;

import com.logitrack.entity.YeuCauDatHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface YeuCauDatHangRepository extends JpaRepository<YeuCauDatHang, String> {
    List<YeuCauDatHang> findAllByOrderByNgayTaoDesc();
}
