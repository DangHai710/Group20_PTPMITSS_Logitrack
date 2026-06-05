package com.logitrack.service;

import com.logitrack.entity.MatHang;
import com.logitrack.entity.ImportSite;
import com.logitrack.entity.ThongTinKho;
import com.logitrack.repository.MatHangRepository;
import com.logitrack.repository.ImportSiteRepository;
import com.logitrack.repository.ThongTinKhoRepository;
import com.logitrack.repository.ChiTietYeuCauRepository;
import com.logitrack.repository.ChiTietDonDatHangRepository;
import com.logitrack.service.impl.MatHangServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MatHangServiceTest {

    @Mock
    private MatHangRepository matHangRepository;

    @Mock
    private ImportSiteRepository importSiteRepository;

    @Mock
    private ThongTinKhoRepository thongTinKhoRepository;

    @Mock
    private ChiTietYeuCauRepository chiTietYeuCauRepository;

    @Mock
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @InjectMocks
    private MatHangServiceImpl matHangService;

    private MatHang matHangSample;
    private List<ImportSite> siteListSample;

    @BeforeEach
    public void setUp() {
        matHangSample = MatHang.builder()
                .maHang("SKU-TEST-001")
                .tenHang("Mặt hàng thử nghiệm")
                .donViTinh("Chiếc")
                .category("Test")
                .trangThai("Đang kinh doanh")
                .quyCach("1 chiếc/hộp")
                .build();

        siteListSample = new ArrayList<>();
        siteListSample.add(ImportSite.builder().maSite("SITE-SZ").tenSite("Shenzhen").build());
        siteListSample.add(ImportSite.builder().maSite("SITE-TY").tenSite("Tokyo").build());
    }

    // =========================================================================
    // BLACK-BOX & WHITE-BOX TEST CASES FOR: createItem(MatHang)
    // =========================================================================

    @Test
    public void testCreateItem_Success() {
        // Given
        when(matHangRepository.existsById(matHangSample.getMaHang())).thenReturn(false);
        when(matHangRepository.save(any(MatHang.class))).thenReturn(matHangSample);
        when(importSiteRepository.findAll()).thenReturn(siteListSample);

        // When
        MatHang result = matHangService.createItem(matHangSample);

        // Then
        assertNotNull(result);
        assertEquals("SKU-TEST-001", result.getMaHang());
        verify(matHangRepository, times(1)).save(matHangSample);
        verify(thongTinKhoRepository, times(siteListSample.size())).save(any(ThongTinKho.class));
    }

    @Test
    public void testCreateItem_EmptySku_ThrowsIllegalArgumentException() {
        // Given
        MatHang emptySkuItem = MatHang.builder().maHang("").tenHang("Item Empty Sku").build();

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            matHangService.createItem(emptySkuItem);
        });
        assertEquals("Mã mặt hàng không được trống!", exception.getMessage());
        verify(matHangRepository, never()).save(any(MatHang.class));
    }

    @Test
    public void testCreateItem_InvalidSkuFormat_ThrowsIllegalArgumentException() {
        // Given
        MatHang invalidSkuItem = MatHang.builder().maHang("TEST-001").tenHang("Item Wrong Sku Prefix").build();

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            matHangService.createItem(invalidSkuItem);
        });
        assertEquals("Mã mặt hàng bắt buộc phải bắt đầu bằng tiền tố 'SKU-'!", exception.getMessage());
        verify(matHangRepository, never()).save(any(MatHang.class));
    }

    @Test
    public void testCreateItem_DuplicateSku_ThrowsIllegalStateException() {
        // Given
        when(matHangRepository.existsById(matHangSample.getMaHang())).thenReturn(true);

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            matHangService.createItem(matHangSample);
        });
        assertEquals("Mã SKU này đã tồn tại trên hệ thống!", exception.getMessage());
        verify(matHangRepository, never()).save(any(MatHang.class));
    }

    // =========================================================================
    // BLACK-BOX & WHITE-BOX TEST CASES FOR: deleteItem(String)
    // =========================================================================

    @Test
    public void testDeleteItem_NotFound_ThrowsIllegalArgumentException() {
        // Given
        String nonExistSku = "SKU-NOT-EXIST";
        when(matHangRepository.findById(nonExistSku)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            matHangService.deleteItem(nonExistSku);
        });
        assertTrue(exception.getMessage().contains("Không tìm thấy mặt hàng"));
        verify(matHangRepository, never()).deleteById(anyString());
    }

    @Test
    public void testDeleteItem_SoftDelete_WhenInRequests() {
        // Given
        when(matHangRepository.findById(matHangSample.getMaHang())).thenReturn(Optional.of(matHangSample));
        when(chiTietYeuCauRepository.existsByMatHangMaHang(matHangSample.getMaHang())).thenReturn(true);
        // Po check can be skipped or returned as false
        when(chiTietDonDatHangRepository.existsByMatHangMaHang(matHangSample.getMaHang())).thenReturn(false);

        // When
        Map<String, Object> result = matHangService.deleteItem(matHangSample.getMaHang());

        // Then
        assertEquals("UPDATE_STATUS", result.get("action"));
        assertEquals("Ngừng kinh doanh", matHangSample.getTrangThai());
        verify(matHangRepository, times(1)).save(matHangSample);
        verify(matHangRepository, never()).deleteById(anyString());
        verify(thongTinKhoRepository, never()).deleteByMatHangMaHang(anyString());
    }

    @Test
    public void testDeleteItem_SoftDelete_WhenInPOs() {
        // Given
        when(matHangRepository.findById(matHangSample.getMaHang())).thenReturn(Optional.of(matHangSample));
        when(chiTietYeuCauRepository.existsByMatHangMaHang(matHangSample.getMaHang())).thenReturn(false);
        when(chiTietDonDatHangRepository.existsByMatHangMaHang(matHangSample.getMaHang())).thenReturn(true);

        // When
        Map<String, Object> result = matHangService.deleteItem(matHangSample.getMaHang());

        // Then
        assertEquals("UPDATE_STATUS", result.get("action"));
        assertEquals("Ngừng kinh doanh", matHangSample.getTrangThai());
        verify(matHangRepository, times(1)).save(matHangSample);
        verify(matHangRepository, never()).deleteById(anyString());
    }

    @Test
    public void testDeleteItem_PhysicalDelete_Success() {
        // Given
        when(matHangRepository.findById(matHangSample.getMaHang())).thenReturn(Optional.of(matHangSample));
        when(chiTietYeuCauRepository.existsByMatHangMaHang(matHangSample.getMaHang())).thenReturn(false);
        when(chiTietDonDatHangRepository.existsByMatHangMaHang(matHangSample.getMaHang())).thenReturn(false);

        // When
        Map<String, Object> result = matHangService.deleteItem(matHangSample.getMaHang());

        // Then
        assertEquals("DELETE_PHYSICAL", result.get("action"));
        verify(thongTinKhoRepository, times(1)).deleteByMatHangMaHang(matHangSample.getMaHang());
        verify(matHangRepository, times(1)).deleteById(matHangSample.getMaHang());
        verify(matHangRepository, never()).save(any(MatHang.class));
    }
}
