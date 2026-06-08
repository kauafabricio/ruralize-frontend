"use client";

import { useState } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { FeedHeader } from "@/app/components/feed/FeedHeader";

const rewards = [
  {
    title: "Combo - 5 Fichas do RU Janta",
    description: "Troque seus pontos por 5 fichas de RU - Janta.",
    cost: 1000,
    points: "1000 pts",
    pickupLocation: "Restaurante Universitario - guiche de atendimento",
    deadline: "ate 5 dias uteis apos a validacao",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Combo - 5 Fichas do RU Almoço",
    description: "Troque seus pontos por 5 fichas de RU - Almoço.",
    cost: 1300,
    points: "1300 pts",
    pickupLocation: "Restaurante Universitario - guiche de atendimento",
    deadline: "ate 5 dias uteis apos a validacao",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Garrafa Térmica",
    description: "Aço inox com acabamento em bambu certificado.",
    cost: 200,
    points: "200 pts",
    pickupLocation: "Loja Sustenta - bloco de convivencia",
    deadline: "ate 3 dias uteis apos a validacao",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
  },
] as const;

const actionHistory = [
  {
    icon: "recycle",
    title: "Descarte de Eletrônicos",
    details: "Ontem, às 14:30 - Campus UFRPE",
    points: "+120 pts",
    tone: "positive",
  },
  {
    icon: "seed",
    title: "Plantio de Mudas",
    details: "12 de Out - Horta Comunitária",
    points: "+200 pts",
    tone: "positive",
  },
  {
    icon: "ride",
    title: "Carona Solidária",
    details: "10 de Out - Aplicativo",
    points: "+45 pts",
    tone: "positive",
  },
  {
    icon: "ticket",
    title: "Resgate: Ecobag Canvas",
    details: "05 de Out - Loja Sustenta",
    points: "-300 pts",
    tone: "negative",
  },
] as const;

type HistoryIconName = (typeof actionHistory)[number]["icon"];
type Reward = (typeof rewards)[number];
type RewardStep = "confirm" | "received";
type RedemptionHistoryItem = {
  icon: "ticket";
  title: string;
  details: string;
  points: string;
  tone: "negative";
};

const INITIAL_POINTS = 750;
const POINTS_STORAGE_KEY = "ruralize.pointsBalance";

export default function PointsPage() {
  const { user } = useAuth();
  const [pointsBalance, setPointsBalance] = useState(readStoredPointsBalance);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardStep, setRewardStep] = useState<RewardStep>("confirm");
  const [redemptionHistory, setRedemptionHistory] = useState<
    RedemptionHistoryItem[]
  >([]);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  function openRewardModal(reward: Reward) {
    setSelectedReward(reward);
    setRewardStep("confirm");
    setRedemptionError(null);
    setEmailSent(null);
  }

  function closeRewardModal() {
    setSelectedReward(null);
    setRewardStep("confirm");
    setRedemptionError(null);
    setEmailSent(null);
  }

  async function handleConfirmRewardRedemption() {
    if (!selectedReward) {
      return;
    }

    if (pointsBalance < selectedReward.cost) {
      setRedemptionError("Voce ainda nao tem pontos suficientes para este resgate.");
      return;
    }

    const emailToUse = user?.email || "";
    if (!emailToUse.trim()) {
      setRedemptionError(
        "Nao encontramos um e-mail cadastrado na sua conta para enviar as instrucoes. Verifique sua sessao e tente novamente.",
      );
      return;
    }

    setRedeeming(true);
    setRedemptionError(null);

    const instructions = getRewardInstructions(selectedReward);

    try {
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: emailToUse,
          userName: user?.name || "Usuário",
          rewardTitle: selectedReward.title,
          rewardPoints: selectedReward.cost,
          pickupLocation: selectedReward.pickupLocation,
          deadline: selectedReward.deadline,
          instructions,
          userId: user?.id,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        emailSent?: boolean;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Nao foi possivel registrar o resgate.",
        );
      }

      const nextBalance = pointsBalance - selectedReward.cost;
      setPointsBalance(nextBalance);
      window.localStorage.setItem(POINTS_STORAGE_KEY, String(nextBalance));
      setRedemptionHistory((currentHistory) => [
        {
          icon: "ticket",
          title: `Resgate: ${selectedReward.title}`,
          details: `Hoje - ${selectedReward.pickupLocation}`,
          points: `-${selectedReward.cost} pts`,
          tone: "negative",
        },
        ...currentHistory,
      ]);
      setEmailSent(Boolean(data?.emailSent));
      setRewardStep("received");
    } catch (error) {
      setRedemptionError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir o resgate.",
      );
    } finally {
      setRedeeming(false);
    }
  }

  const displayedHistory = [...redemptionHistory, ...actionHistory];

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

              <button
                type="button"
                className="mt-7 h-11 rounded-full bg-white px-7 text-[11px] font-black uppercase tracking-[0.08em] text-[#2f7934] transition hover:bg-[#edf8e9]"
              >
                Ver eventos
              </button>
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

              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 text-[12px] font-black text-[#287630] transition hover:text-[#1d5c25]"
              >
                Ver todas
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => (
                <article
                  key={reward.title}
                  className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.05)]"
                >
                  <div className="relative h-[176px] overflow-hidden">
                    <img
                      src={reward.image}
                      alt={reward.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute right-4 top-4 rounded-full bg-[#287630] px-3 py-1.5 text-[10px] font-black text-white shadow-[0_8px_16px_rgba(23,73,27,0.22)]">
                      {reward.points}
                    </span>
                  </div>

                  <div className="px-5 pb-6 pt-5">
                    <h3 className="text-[15px] font-black leading-5 tracking-[-0.02em] text-[#1e261e]">
                      {reward.title}
                    </h3>
                    <p className="mt-2 min-h-[38px] text-[11px] font-semibold leading-5 text-[#647061]">
                      {reward.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => openRewardModal(reward)}
                      disabled={pointsBalance < reward.cost}
                      className="mt-5 h-10 w-full rounded-full bg-[#9ff0a1] text-[11px] font-black text-[#287630] transition hover:bg-[#8ee892] disabled:cursor-not-allowed disabled:bg-[#e2e6dc] disabled:text-[#8a9186]"
                    >
                      {pointsBalance >= reward.cost
                        ? "Resgatar Recompensas"
                        : "Pontos insuficientes"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-[23px] font-black tracking-[-0.04em] text-[#1e261e]">
              Histórico de Ações
            </h2>

            <div className="mt-6 overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.05)]">
              {displayedHistory.map((action, index) => {
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
              })}
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
            emailSent={emailSent}
            userEmail={user?.email ?? ""}
            instructions={getRewardInstructions(selectedReward)}
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
  emailSent,
  userEmail,
  instructions,
  onConfirm,
  onClose,
}: {
  reward: Reward;
  step: RewardStep;
  pointsBalance: number;
  isRedeeming: boolean;
  error: string | null;
  emailSent: boolean | null;
  userEmail: string;
  instructions: string[];
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
              {reward.points}
            </p>
            <h2
              id="reward-redemption-title"
              className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1e261e]"
            >
              {step === "confirm"
                ? "Confirmar resgate"
                : "Solicitacao recebida"}
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
              Voce esta prestes a resgatar <strong>{reward.title}</strong>.
              Confirme para iniciar o processo e receber as instrucoes por
              e-mail.
            </p>
            <div className="mt-5 rounded-[18px] bg-[#f7f9f4] px-5 py-4 text-[12px] font-semibold leading-5 text-[#536050]">
              <p>Saldo atual: {pointsBalance} pts</p>
              <p>Custo do resgate: {reward.cost} pts</p>
              <p>Saldo apos o resgate: {pointsBalance - reward.cost} pts</p>
            </div>
            {error ? (
              <p className="mt-4 rounded-[14px] bg-[#fff3f3] px-4 py-3 text-[12px] font-bold leading-5 text-[#b92828]">
                {error}
              </p>
            ) : null}
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
        ) : (
          <>
            <p className="mt-5 text-[13px] font-semibold leading-6 text-[#566052]">
              Sua solicitacao foi recebida. Um e-mail sera enviado para{" "}
              <strong>{userEmail}</strong> com todas as instrucoes para retirada
              da recompensa.
            </p>
            {emailSent === false ? (
              <p className="mt-4 rounded-[14px] bg-[#fff8df] px-4 py-3 text-[12px] font-bold leading-5 text-[#7a5a00]">
                O resgate foi registrado. O envio automatico de e-mail depende
                da configuracao do servico de envio no servidor.
              </p>
            ) : null}
            <ol className="mt-6 space-y-3">
              {instructions.map((instruction, index) => (
                <li
                  key={instruction}
                  className="grid grid-cols-[32px_1fr] gap-3 rounded-[16px] bg-[#f7f9f4] px-4 py-3 text-[12px] font-semibold leading-5 text-[#536050]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dff6df] text-[11px] font-black text-[#287630]">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 h-11 w-full rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
            >
              Entendi
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function getRewardInstructions(reward: Reward) {
  return [
    "Aguarde a validacao da equipe responsavel pelo programa de recompensas.",
    `Compareca ao local de retirada: ${reward.pickupLocation}.`,
    `Retire a recompensa no prazo informado: ${reward.deadline}.`,
    "Leve documento de identificacao e apresente o e-mail de confirmacao recebido.",
    "Acompanhe o status pelo historico de acoes da pagina de pontos.",
  ];
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


