package com.logitrack.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongTinKhoId implements Serializable {
    private String importSite; // Tên thuộc tính trong ThongTinKho đại diện cho maSite
    private String mathHang;   // Tên thuộc tính trong ThongTinKho đại diện cho maHang
}
