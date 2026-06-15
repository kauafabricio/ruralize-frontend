import { api } from "./client";

export interface PointsBalanceResponse {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

export async function getPointsBalance(): Promise<PointsBalanceResponse> {
  const response = await api.get<PointsBalanceResponse>("/points/balance");
  return response.data;
}
