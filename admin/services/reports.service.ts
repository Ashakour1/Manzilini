import { API_URL, getAuthHeaders } from "../lib/api";

const REPORTS_API_URL = `${API_URL}/reports`;

export interface UserStatistics {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
}

export interface OverallStatistics {
  totalUsers: number;
  totalLandlords: number;
  totalProperties: number;
  totalPayments: number;
  totalFieldAgents: number;
  totalRevenue: number;
  recentActivity: {
    propertiesCreated: number;
    landlordsCreated: number;
  };
}

export interface ReportsData {
  overall: OverallStatistics;
  properties: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
  };
  payments: {
    byStatus: Array<{ status: string; count: number }>;
  };
  users: UserStatistics[];
}

// Get all reports
export const getReports = async (): Promise<ReportsData> => {
  const response = await fetch(REPORTS_API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }

  return response.json();
};

