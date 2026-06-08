import { api } from "./client";

// ============ TIPOS ============
export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  pickup_location: string;
  deadline_days: number;
  image_url?: string;
}

export interface RedemptionResponse {
  success: boolean;
  data: {
    redemption_code: string;
    user_email: string;
    pickup_deadline: string;
  };
}

export interface RedemptionHistory {
  id: string;
  reward_name: string;
  redemption_code: string;
  status: "pending" | "collected" | "expired";
  redemption_date: string;
  pickup_deadline: string;
}

// ============ ENDPOINTS ============

/**
 * Resgata uma recompensa
 * POST /rewards/redeem
 */
export async function redeemReward(rewardId: string): Promise<RedemptionResponse> {
  const response = await api.post<RedemptionResponse>("/rewards/redeem", {
    reward_id: rewardId,
  });
  return response.data;
}

/**
 * Busca as recompensas disponíveis
 * GET /rewards/list
 */
export async function getAvailableRewards(): Promise<Reward[]> {
  const response = await api.get<Reward[]>("/rewards/list");
  return response.data;
}

/**
 * Busca o histórico de resgates do usuário
 * GET /rewards/user/redemptions
 */
export async function getUserRedemptions(): Promise<RedemptionHistory[]> {
  const response = await api.get<RedemptionHistory[]>("/rewards/user/redemptions");
  return response.data;
}
