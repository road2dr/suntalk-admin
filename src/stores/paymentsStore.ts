import { create } from 'zustand';
import { paymentsAPI } from '../api';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  purpose: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_nickname: string | null;
  user_email: string | null;
}

interface PaymentsState {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filterMethod: string | undefined;
  filterPurpose: string | undefined;
  dateRange: [string | null, string | null] | null;
  detailPayment: Payment | null;
  detailModalOpen: boolean;

  setFilterMethod: (method: string | undefined) => void;
  setFilterPurpose: (purpose: string | undefined) => void;
  setDateRange: (range: [string | null, string | null] | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setDetailModalOpen: (open: boolean) => void;
  fetchPayments: () => Promise<void>;
  fetchPayment: (id: string) => Promise<void>;
  resetFilters: () => void;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  filterMethod: undefined,
  filterPurpose: undefined,
  dateRange: null,
  detailPayment: null,
  detailModalOpen: false,

  setFilterMethod: (method) => set({ filterMethod: method }),
  setFilterPurpose: (purpose) => set({ filterPurpose: purpose }),
  setDateRange: (range) => set({ dateRange: range }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setDetailModalOpen: (open) => set({ detailModalOpen: open }),

  fetchPayments: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, filterMethod, filterPurpose, dateRange } = get();
      const params: any = { page, page_size: pageSize };
      if (filterMethod) params.payment_method = filterMethod;
      if (filterPurpose) params.purpose = filterPurpose;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0];
        params.end_date = dateRange[1];
      }
      const response = await paymentsAPI.getPayments(params);
      set({
        payments: response.data.payments,
        total: response.data.total,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchPayment: async (id: string) => {
    try {
      const response = await paymentsAPI.getPayment(id);
      set({ detailPayment: response.data, detailModalOpen: true });
    } catch (error) {
      throw error;
    }
  },

  resetFilters: () => {
    set({
      filterMethod: undefined,
      filterPurpose: undefined,
      dateRange: null,
      page: 1,
    });
  },
}));