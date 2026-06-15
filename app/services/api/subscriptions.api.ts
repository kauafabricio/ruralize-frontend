import { api } from "./client";


export interface SubscriptionListResponse {
  id: string;
  created_at: string;
  description: string;
    start_date: string;
}

export interface SubscriptionResponse extends SubscriptionListResponse {
  created_at: string;
  start_date: string;

}


export async function listSubscriptions(): Promise<SubscriptionResponse[]> {
  const response = await api.get<SubscriptionListResponse[]>("/event_subscriptions/");
  return response.data;
}

// GET /event_subscriptions/?user_id={user_id}
export async function getMySubscriptions(userId: string): Promise<SubscriptionListResponse[]> {
  try {
    const response = await api.get<SubscriptionResponse[]>("/event_subscriptions/", {
      params: { user_id: userId },
    });
    console.log(`✅ Subssss carregadss para ${userId}:`, response.data.length);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao carregar subssss para ${userId}:`, error);
    throw error;
  }
}
