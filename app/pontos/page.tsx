"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { 
  redeemReward, 
  getAvailableRewards,
  getUserRedemptions,
  type Reward,
  type RedemptionResponse,
  type RedemptionHistory,
} from "@/app/services/api/rewards.api";

// Ação de histórico para compatibilidade com UI existente
const actionHistory = [
  {
    icon: "recycle" as const,
    title: "Descarte de Eletrônicos",
    details: "Ontem, às 14:30 - Campus UFRPE",
    points: "+120 pts",
    tone: "positive" as const,
  },
  {
    icon: "seed" as const,
    title: "Plantio de Mudas",
    details: "12 de Out - Horta Comunitária",
    points: "+200 pts",
    tone: "positive" as const,
  },
  {
    icon: "ride" as const,
    title: "Carona Solidária",
    details: "10 de Out - Aplicativo",
    points: "+45 pts",
    tone: "positive" as const,
  },
];

type HistoryIconName = "ticket" | "recycle" | "seed" | "ride";
type RewardStep = "confirm" | "received" | "error";

interface RedemptionState {
  code?: string;
  email?: string;
  deadline?: string;
}

interface HistoryAction {
  icon: HistoryIconName;
  title: string;
  details: string;
  points: string;
  tone: "positive" | "negative";
}

const INITIAL_POINTS = 750;
const POINTS_STORAGE_KEY = "ruralize.pointsBalance";

export default function PointsPage() {
  const { user, session } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointsBalance, setPointsBalance] = useState(readStoredPointsBalance);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardStep, setRewardStep] = useState<RewardStep>("confirm");
  const [redeemHistory, setRedeemHistory] = useState<RedemptionHistory[]>([]);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);
  const [redemptionData, setRedemptionData] = useState<RedemptionState | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar recompensas e histórico de resgate ao montar
  useEffect(() => {
    if (!session) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [rewardsData, historyData] = await Promise.all([
          getAvailableRewards(),
          getUserRedemptions(),
        ]);
        setRewards(rewardsData);
        setRedeemHistory(historyData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [session]);

  function openRewardModal(reward: Reward) {
    setSelectedReward(reward);
    setRewardStep("confirm");
    setRedemptionError(null);
    setRedemptionData(null);
  }

  function closeRewardModal() {
    setSelectedReward(null);
    setRewardStep("confirm");
    setRedemptionError(null);
    setRedemptionData(null);
  }

  async function handleConfirmRewardRedemption() {
    if (!selectedReward || !user?.id) {
      setRedemptionError("Erro: usuário não autenticado");
      setRewardStep("error");
      return;
    }

    if (pointsBalance < selectedReward.points_required) {
      setRedemptionError("Você não possui pontos suficientes para esta recompensa.");
      setRewardStep("error");
      return;
    }

    setRedeeming(true);
    setRedemptionError(null);

    try {
      const response: RedemptionResponse = await redeemReward(selectedReward.id);

      // Atualizar saldo de pontos
      const nextBalance = pointsBalance - selectedReward.points_required;
      setPointsBalance(nextBalance);
      window.localStorage.setItem(POINTS_STORAGE_KEY, String(nextBalance));

      // Atualizar histórico de resgates
      const newRedemption: RedemptionHistory = {
        id: response.data.redemption_code,
        reward_name: selectedReward.name,
        redemption_code: response.data.redemption_code,
        status: "pending",
        redemption_date: new Date().toISOString(),
        pickup_deadline: response.data.pickup_deadline,
      };
      setRedeemHistory((current) => [newRedemption, ...current]);

      // Exibir dados de sucesso
      setRedemptionData({
        code: response.data.redemption_code,
        email: response.data.user_email,
        deadline: response.data.pickup_deadline,
      });
      setRewardStep("received");
    } catch (error) {
      console.error("Erro ao resgatar:", error);
      
      let errorMessage = "Não foi possível realizar o resgate.";
      
      if (error instanceof Error) {
        if (error.message.includes("402")) {
          errorMessage = "Você não possui pontos suficientes para esta recompensa.";
        } else if (error.message.includes("404")) {
          errorMessage = "Recompensa não encontrada.";
        } else if (error.message.includes("400")) {
          errorMessage = "Não foi possível realizar o resgate.";
        } else if (error.message.includes("500")) {
          errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
        }
      }
      
      setRedemptionError(errorMessage);
      setRewardStep("error");
    } finally {
      setRedeeming(false);
    }
  }

  // Criar histórico exibido combinando resgates e ações
  const displayedHistory: HistoryAction[] = [
    ...redeemHistory.map(
      (redemption): HistoryAction => ({
        icon: "ticket",
        title: `Resgate: ${redemption.reward_name}`,
        details: new Date(redemption.redemption_date).toLocaleDateString("pt-BR"),
        points: `-${redemption.redemption_code}`,
        tone: "negative",
      })
    ),
    ...actionHistory,
  ];

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f8f8f3] text-[#1f281f]">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] px-4 pb-10 pt-8 sm:px-7 lg:pt-11">
          <section className="grid gap-7 lg:grid-cols-[1fr_372px]">
            <div className="relative flex min-h-[210px] flex-col overflow-hidden rounded-[28px] bg-[#fbfbf7] px-6 py-8 shadow-[0_1px_0_rgba(33,55,30,0.05)] sm:flex-row sm:items-center sm:px-10">
              <LeafMark className="absolute -bottom-6 right-2 h-32 w-32 text-[#dfe8da]" />

              <div className="relative z-10 flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full bg-white text-center shadow-[0_12px_30px_rgba(33,55,30,0.08)]">
                <strong className="text-[31px] font-black tracking-[-0.04em] text-[#287630]">
                  {pointsBalance}
                </strong>
                <span className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#6b7568]">
                  Pontos totais
                </span>
              </div>

              <div className="relative z-10 mt-7 max-w-[430px] sm:ml-9 sm:mt-0">
                <h1 className="text-[26px] font-black tracking-[-0.04em] text-[#1e261e] sm:text-[31px]">
                  Seu Impacto <span className="text-[#287630]">Floresce.</span>
                </h1>
                <p className="mt-4 text-[13px] font-medium leading-6 text-[#536050]">
                  Você está indo bem, continue contribuindo.
                </p>
              </div>
            </div>

            <aside className="flex min-h-[210px] flex-col justify-between rounded-[28px] bg-[#347a37] px-7 py-8 text-white shadow-[0_16px_34px_rgba(40,118,48,0.2)]">
              <div>
                <h2 className="text-[20px] font-black tracking-[-0.03em]">
                  Ganhe mais pontos hoje
                </h2>
                <p className="mt-5 max-w-[260px] text-[12px] font-semibold leading-6 text-[#dcefd9]">
                  Participe de mais eventos sustentáveis e consiga pontos mais recompensas.
                </p>
              </div>
            <Link
              href="/agendamentos"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-[11px] font-black uppercase tracking-[0.08em] text-[#2f7934] transition hover:bg-[#edf8e9]"
            >
              Ver eventos
            </Link>
            </aside>
          </section>

          <section className="mt-14">
            <div className="flex items-end justify-between gap-5">
              <div>
                <h2 className="text-[23px] font-black tracking-[-0.04em] text-[#1e261e]">
                  Recompensas
                </h2>
                <p className="mt-2 text-[12px] font-semibold text-[#687266]">
                  Troque seus pontos por mimos sustentáveis
                </p>
              </div>

              <Link
                href="/pontos/resgates"
                className="inline-flex shrink-0 items-center gap-2 text-[12px] font-black text-[#287630] transition hover:text-[#1d5c25]"
              >
                Meus Resgates
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center justify-center rounded-[22px] bg-white py-12">
                <p className="text-[13px] font-semibold text-[#687266]">Carregando recompensas...</p>
              </div>
            ) : rewards.length === 0 ? (
              <div className="mt-8 flex items-center justify-center rounded-[22px] bg-white py-12">
                <p className="text-[13px] font-semibold text-[#687266]">Nenhuma recompensa disponível no momento.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rewards.map((reward) => (
                  <article
                    key={reward.id}
                    className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.05)]"
                  >
                    <div className="relative h-[176px] overflow-hidden bg-[#e8e8e8]">
                      {reward.image_url && (
                        <img
                          src={reward.image_url}
                          alt={reward.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="absolute right-4 top-4 rounded-full bg-[#287630] px-3 py-1.5 text-[10px] font-black text-white shadow-[0_8px_16px_rgba(23,73,27,0.22)]">
                        {reward.points_required} pts
                      </span>
                    </div>

                    <div className="px-5 pb-6 pt-5">
                      <h3 className="text-[15px] font-black leading-5 tracking-[-0.02em] text-[#1e261e]">
                        {reward.name}
                      </h3>
                      <p className="mt-2 min-h-[38px] text-[11px] font-semibold leading-5 text-[#647061]">
                        {reward.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => openRewardModal(reward)}
                        disabled={pointsBalance < reward.points_required}
                        className="mt-5 h-10 w-full rounded-full bg-[#9ff0a1] text-[11px] font-black text-[#287630] transition hover:bg-[#8ee892] disabled:cursor-not-allowed disabled:bg-[#e2e6dc] disabled:text-[#8a9186]"
                      >
                        {pointsBalance >= reward.points_required
                          ? "Resgatar"
                          : "Pontos insuficientes"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mt-16">
            <h2 className="text-[23px] font-black tracking-[-0.04em] text-[#1e261e]">
              Histórico de Ações
            </h2>

            <div className="mt-6 overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.05)]">
              {displayedHistory.length === 0 ? (
                <div className="flex items-center justify-center px-5 py-12">
                  <p className="text-[13px] font-semibold text-[#687266]">Nenhuma ação registrada ainda.</p>
                </div>
              ) : (
                displayedHistory.map((action, index) => {
                  const positive = action.tone === "positive";

                  return (
                    <div
                      key={`${action.title}-${index}`}
                      className={`flex items-center justify-between gap-4 px-5 py-5 ${
                        index === 0 ? "" : "border-t border-[#edf0e8]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                            positive
                              ? "bg-[#dff6df] text-[#287630]"
                              : "bg-[#ffe2e2] text-[#c91f1f]"
                          }`}
                        >
                          <HistoryIcon name={action.icon} className="h-5 w-5" />
                        </span>

                        <div className="min-w-0">
                          <h3 className="truncate text-[13px] font-black text-[#1e261e]">
                            {action.title}
                          </h3>
                          <p className="mt-1 truncate text-[11px] font-semibold text-[#7b8578]">
                            {action.details}
                          </p>
                        </div>
                      </div>

                      <strong
                        className={`shrink-0 text-[13px] font-black ${
                          positive ? "text-[#287630]" : "text-[#c91f1f]"
                        }`}
                      >
                        {action.points}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <footer className="border-t border-[#eceee8] bg-[#fbfbf7]">
          <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-4 py-8 text-[11px] font-semibold text-[#8a9186] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p>
              <span className="font-black text-[#287630]">Ruralize</span> UFRPE
              Living
            </p>
            <nav className="flex flex-wrap gap-7">
              <a href="#" className="transition hover:text-[#287630]">
                Termos de Uso
              </a>
              <a href="#" className="transition hover:text-[#287630]">
                Privacidade
              </a>
              <a href="#" className="transition hover:text-[#287630]">
                Contato
              </a>
            </nav>
            <p>© 2024 Ruralize - UFRPE Living Canvas</p>
          </div>
        </footer>

        {selectedReward ? (
          <RewardRedemptionModal
            reward={selectedReward}
            step={rewardStep}
            pointsBalance={pointsBalance}
            isRedeeming={redeeming}
            error={redemptionError}
            redemptionData={redemptionData}
            onConfirm={handleConfirmRewardRedemption}
            onClose={closeRewardModal}
          />
        ) : null}
      </main>
    </RequireAuth>
  );
}

function RewardRedemptionModal({
  reward,
  step,
  pointsBalance,
  isRedeeming,
  error,
  redemptionData,
  onConfirm,
  onClose,
}: {
  reward: Reward;
  step: RewardStep;
  pointsBalance: number;
  isRedeeming: boolean;
  error: string | null;
  redemptionData: RedemptionState | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d7ddd3]/70 px-4 py-8 backdrop-blur-[5px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-redemption-title"
        className="w-full max-w-[430px] rounded-[24px] bg-white px-7 pb-7 pt-8 shadow-[0_24px_50px_rgba(33,55,30,0.22)]"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#287630]">
              {reward.points_required} pts
            </p>
            <h2
              id="reward-redemption-title"
              className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1e261e]"
            >
              {step === "confirm"
                ? "Confirmar resgate"
                : step === "error"
                  ? "Erro ao resgatar"
                  : "Resgate realizado"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f3ed] text-[18px] font-black text-[#596255] transition hover:bg-[#e5e9df]"
            aria-label="Fechar"
          >
            x
          </button>
        </div>

        {step === "confirm" ? (
          <>
            <p className="mt-5 text-[13px] font-semibold leading-6 text-[#566052]">
              Você está prestes a resgatar <strong>{reward.name}</strong>.
              Confirme para iniciar o processo e receber as instruções por e-mail.
            </p>
            <div className="mt-5 rounded-[18px] bg-[#f7f9f4] px-5 py-4 text-[12px] font-semibold leading-5 text-[#536050]">
              <p>Saldo atual: {pointsBalance} pts</p>
              <p>Custo do resgate: {reward.points_required} pts</p>
              <p>Saldo após o resgate: {pointsBalance - reward.points_required} pts</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-full bg-[#eef0ea] px-5 text-[11px] font-black text-[#4f5b4e]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isRedeeming}
                className="h-11 rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] disabled:opacity-60"
              >
                {isRedeeming ? "Registrando..." : "Confirmar resgate"}
              </button>
            </div>
          </>
        ) : step === "error" ? (
          <>
            {error && (
              <p className="mt-5 rounded-[14px] bg-[#fff3f3] px-4 py-3 text-[12px] font-bold leading-5 text-[#b92828]">
                {error}
              </p>
            )}
            <div className="mt-7 grid gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
              >
                Voltar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-5 text-[13px] font-semibold leading-6 text-[#566052]">
              Resgate realizado com sucesso! As instruções de retirada e o código de resgate foram enviados para o e-mail cadastrado.
            </p>
            
            {redemptionData?.code && (
              <div className="mt-6 rounded-[16px] bg-[#f7f9f4] px-5 py-4">
                <p className="text-[11px] font-semibold text-[#536050]">Código de Resgate:</p>
                <p className="mt-2 text-center text-[20px] font-black tracking-wider text-[#287630]">
                  {redemptionData.code}
                </p>
              </div>
            )}

            {redemptionData?.email && (
              <div className="mt-4 rounded-[14px] bg-[#f0f8f0] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#536050]">
                  Enviado para: <span className="font-black text-[#287630]">{redemptionData.email}</span>
                </p>
              </div>
            )}

            {redemptionData?.deadline && (
              <div className="mt-4 rounded-[14px] bg-[#fff8e1] px-4 py-3">
                <p className="text-[11px] font-semibold text-[#7a5a00]">
                  Prazo para retirada: <span className="font-black">{new Date(redemptionData.deadline).toLocaleDateString("pt-BR")}</span>
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-7 h-11 w-full rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
            >
              Fechar
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function readStoredPointsBalance() {
  if (typeof window === "undefined") {
    return INITIAL_POINTS;
  }

  const storedPoints = window.localStorage.getItem(POINTS_STORAGE_KEY);

  if (!storedPoints) {
    return INITIAL_POINTS;
  }

  const parsedPoints = Number(storedPoints);
  return Number.isFinite(parsedPoints) ? parsedPoints : INITIAL_POINTS;
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function HistoryIcon({
  name,
  className = "h-5 w-5",
}: {
  name: HistoryIconName;
  className?: string;
}) {
  if (name === "seed") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 21V11" />
        <path d="M12 11c-4 0-7-2-7-6 4 0 7 2 7 6Z" />
        <path d="M12 13c4 0 7-2 7-6-4 0-7 2-7 6Z" />
      </svg>
    );
  }

  if (name === "ride") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 17h14" />
        <path d="M7 17l1.4-5.5A2 2 0 0 1 10.3 10h3.4a2 2 0 0 1 1.9 1.5L17 17" />
        <path d="M8 17v2" />
        <path d="M16 17v2" />
        <path d="M9 13h6" />
      </svg>
    );
  }

  if (name === "ticket") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
        <path d="M9 9h6" />
        <path d="M9 15h6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 19h10" />
      <path d="M9 19c-2.2-1.7-3.4-4-3.4-6.8 0-3 1.4-5.4 4.2-7.2" />
      <path d="M14.2 5c2.8 1.8 4.2 4.2 4.2 7.2 0 2.8-1.2 5.1-3.4 6.8" />
      <path d="m4 7 5.8-2 1.2 5.9" />
      <path d="m20 17-5.8 2-1.2-5.9" />
    </svg>
  );
}

function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      className={className}
      aria-hidden="true"
    >
      <path d="M28 128c46-5 73-34 82-88 26 21 37 49 32 84-29 11-57 12-84 4" />
      <path d="M58 128c11-28 31-55 60-81" />
      <path d="M93 97 76 74" />
      <path d="m117 73-25-5" />
    </svg>
  );
}


