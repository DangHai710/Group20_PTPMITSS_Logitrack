package com.logitrack.service.core;

import com.logitrack.dto.AllocationDetailDTO;
import com.logitrack.dto.AllocationResponseDTO;
import java.util.List;

public interface AllocationService {
    AllocationResponseDTO simulateAllocation(String requestId);
    void confirmAllocation(String requestId, List<AllocationDetailDTO> confirmedDetails);
}
