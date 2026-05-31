// File: src/services/api.ts
import axios from 'axios';
import { 
  LoginRequest, 
  Account, 
  MatHang, 
  YeuCauDatHang, 
  ImportSite, 
  DonDatHang,
  ReceiptAdjustment,
  AllocationResponse
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // 1. Phân hệ Authentication
  login: async (credentials: LoginRequest): Promise<Account> => {
    const response = await apiClient.post<Account>('/auth/login', credentials);
    return response.data;
  },

  // 2. Phân hệ Quản lý Vật tư (Sales)
  getItems: async (): Promise<MatHang[]> => {
    const response = await apiClient.get<MatHang[]>('/items');
    return response.data;
  },

  createItem: async (item: MatHang): Promise<MatHang> => {
    const response = await apiClient.post<MatHang>('/items', item);
    return response.data;
  },

  updateItem: async (maHang: string, item: MatHang): Promise<MatHang> => {
    const response = await apiClient.put<MatHang>(`/items/${maHang}`, item);
    return response.data;
  },

  deleteItem: async (maHang: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/items/${maHang}`);
    return response.data;
  },

  // 3. Phân hệ Yêu cầu đặt hàng (Sales)
  getRequests: async (): Promise<YeuCauDatHang[]> => {
    const response = await apiClient.get<YeuCauDatHang[]>('/orders');
    return response.data;
  },

  getRequest: async (id: string): Promise<YeuCauDatHang> => {
    const response = await apiClient.get<YeuCauDatHang>(`/orders/${id}`);
    return response.data;
  },

  createRequest: async (payload: { nguoiTao: string; items: any[] }): Promise<YeuCauDatHang> => {
    const response = await apiClient.post<YeuCauDatHang>('/orders/request', payload);
    return response.data;
  },

  // 4. Phân hệ Phân bổ tối ưu (Hải - Order Dept)
  queryStock: async (id: string): Promise<{ success: boolean; sitesCount: number; message: string }> => {
    const response = await apiClient.post<{ success: boolean; sitesCount: number; message: string }>(`/orders/query-stock/${id}`);
    return response.data;
  },

  simulateAllocation: async (id: string): Promise<AllocationResponse> => {
    const response = await apiClient.post<AllocationResponse>(`/allocation/process/${id}`);
    return response.data;
  },

  confirmAllocation: async (id: string, confirmedDetails?: any[]): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/allocation/confirm/${id}`, confirmedDetails);
    return response.data;
  },

  // 5. Phân hệ Quản lý Sites đối tác (Order Dept)
  getSites: async (): Promise<ImportSite[]> => {
    const response = await apiClient.get<ImportSite[]>('/sites');
    return response.data;
  },

  getSite: async (id: string): Promise<ImportSite> => {
    const response = await apiClient.get<ImportSite>(`/sites/${id}`);
    return response.data;
  },

  updateSiteLeadtime: async (id: string, leadtimes: { soNgayDiTau: number; soNgayDiMayBay: number }): Promise<ImportSite> => {
    const response = await apiClient.put<ImportSite>(`/sites/update-leadtime/${id}`, leadtimes);
    return response.data;
  },

  // 6. Phân hệ Đối soát & Kiểm nhận kho (Dương - Inventory Dept)
  getPOs: async (): Promise<DonDatHang[]> => {
    const response = await apiClient.get<DonDatHang[]>('/receipts/pos');
    return response.data;
  },

  getPODetails: async (id: string): Promise<any> => {
    const response = await apiClient.get<any>(`/receipts/po/${id}`);
    return response.data;
  },

  confirmReceipt: async (payload: any): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/receipts/confirm', payload);
    return response.data;
  },
};
export default apiService;
