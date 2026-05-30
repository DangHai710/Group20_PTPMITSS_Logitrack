package com.logitrack.repository;

import com.logitrack.entity.ThongTinKho;
import com.logitrack.entity.ThongTinKhoId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ThongTinKhoRepository extends JpaRepository<ThongTinKho, ThongTinKhoId> {
    List<ThongTinKho> findByMathHangMaHang(String maHang);
    void deleteByMathHangMaHang(String maHang);
}
