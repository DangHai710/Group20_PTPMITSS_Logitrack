package com.logitrack.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonDatHangId implements Serializable {
    private String donDatHang; // Tên thuộc tính trong ChiTietDonDatHang đại diện cho maPo
    private String mathHang;   // Tên thuộc tính trong ChiTietDonDatHang đại diện cho maHang
}
