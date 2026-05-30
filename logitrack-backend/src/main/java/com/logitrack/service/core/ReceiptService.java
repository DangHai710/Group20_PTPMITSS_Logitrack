package com.logitrack.service.core;

import com.logitrack.dto.ReceiptAdjustmentDTO;

public interface ReceiptService {
    void processReceipt(ReceiptAdjustmentDTO adjustmentDTO);
}
