import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";

interface DashboardStats {
  new_members: number;
  team_size: number;
  total_earnings: number;
  period_earnings: number;
  time_period: string;
}

async function getDashboardStats(period: string = "24h") {
  const userId = localStorage.getItem("user_id");
  if (!userId) throw new Error("User ID not found");
  
  const response = await api.get(`/api/profiles/${userId}/dashboard_stats/?period=${period}`);
  return response.data as DashboardStats;
}

export const useGetDashboardStats = (period: string = "24h") => {
  return useQuery({
    queryKey: ["dashboardStats", period],
    queryFn: () => getDashboardStats(period),
  });
};