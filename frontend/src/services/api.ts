import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface SummaryData {
  current_quarter: number;
  current_quarter_year: number;
  revenue: number;
  target: number;
  gap: number;
  gap_percentage: number;
  qoq_change: number;
  qoq_change_percentage: number;
}

export interface RevenueDrivers {
  pipeline_size: number;
  win_rate: number;
  average_deal_size: number;
  sales_cycle_time: number;
}

export interface RiskFactor {
  type: string;
  description: string;
  severity: string;
  data: any;
}

export interface Recommendation {
  priority: string;
  action: string;
  impact: string;
  description: string;
}

export const api = {
  getSummary: async (): Promise<SummaryData> => {
    const response = await axios.get(`${API_BASE_URL}/summary`);
    return response.data;
  },

  getDrivers: async (): Promise<RevenueDrivers> => {
    const response = await axios.get(`${API_BASE_URL}/drivers`);
    return response.data;
  },

  getRiskFactors: async (): Promise<RiskFactor[]> => {
    const response = await axios.get(`${API_BASE_URL}/risk-factors`);
    return response.data;
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await axios.get(`${API_BASE_URL}/recommendations`);
    return response.data;
  },
};
