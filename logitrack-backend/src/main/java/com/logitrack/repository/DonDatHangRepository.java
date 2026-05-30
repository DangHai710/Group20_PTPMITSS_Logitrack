package com.logitrack.repository;

import com.logitrack.entity.DonDatHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonDatHangRepository extends JpaRepository<DonDatHang, String> {
    List<DonDatHang> findAllByOrderByNgayDatDesc();
}
