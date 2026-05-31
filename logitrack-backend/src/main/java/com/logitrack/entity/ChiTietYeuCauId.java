package com.logitrack.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietYeuCauId implements Serializable {
    private String yeuCauDatHang; // Tên thuộc tính trong ChiTietYeuCau đại diện cho maYc
    private String matHang;       // Tên thuộc tính trong ChiTietYeuCau đại diện cho maHang
}
