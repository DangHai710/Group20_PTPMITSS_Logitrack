package com.logitrack.repository;

import com.logitrack.entity.KetQuaKiemNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface KetQuaKiemNhanRepository extends JpaRepository<KetQuaKiemNhan, String> {
    Optional<KetQuaKiemNhan> findByDonDatHangMaPo(String maPo);
}
