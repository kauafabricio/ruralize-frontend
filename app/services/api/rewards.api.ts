import { api } from "./client";

export async function redeemReward(
  userId: string,
  rewardTitle: string,
  rewardCost: number,
  pickupLocation: string,
  deadline: string,
  instructions?: string[]
) {
  const response = await api.post("/rewards/redeem", {
    reward_title: rewardTitle,
    reward_cost: rewardCost,
    pickup_location: pickupLocation,
    deadline: deadline,
    instructions: instructions,
  });
  return response.data;
}
