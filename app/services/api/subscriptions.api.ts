import { api } from "./client";

export interface EventMinResponse {
  id: string;
  title: string;
  description: string;
  start_date: string;
  location_name: string;
}

export interface SubscriptionResponse {
  id: string;
  status: string;
  created_at: string;
  event: EventMinResponse;
}

export async function listSubscriptions(): Promise<SubscriptionResponse[]> {
  const response = await api.get<SubscriptionResponse[]>("/events/subscriptions");
  return response.data;
}

export async function getMySubscriptions(): Promise<SubscriptionResponse[]> {
  try {
    const response = await api.get<SubscriptionResponse[]>("/events/subscriptions");
    console.log(`✅ Inscrições carregadas:`, response.data.length);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao carregar inscrições:`, error);
    throw error;
  }
}
