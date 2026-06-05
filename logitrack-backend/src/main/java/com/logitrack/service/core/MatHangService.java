package com.logitrack.service.core;

import com.logitrack.entity.MatHang;
import java.util.List;
import java.util.Map;

public interface MatHangService {
    List<MatHang> getAllItems();
    MatHang createItem(MatHang matHang);
    MatHang updateItem(String maHang, MatHang matHangDetails);
    Map<String, Object> deleteItem(String maHang);
}
