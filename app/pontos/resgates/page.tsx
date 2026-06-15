"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { getUserRedemptions, type RedemptionHistory } from "@/app/services/api/rewards.api";

const statusMap = {
  pending: {
    label: "Pendente",
    color: "bg-white",
    badgeColor: "bg-white",
  },
  collected: {
    label: "Retirado",
    color: "bg-white",
    badgeColor: "bg-white",
  },
  expired: {
    label: "Expirado",
    color: "bg-white",
    badgeColor: "bg-white",
  },
};

export default function ResgatesPage() {
  const { session } = useAuth();
  const [history, setHistory] = useState<RedemptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionHistory | null>(null);

  useEffect(() => {
    if (!session) return;

    const loadRedemptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserRedemptions();
        setHistory(data);
      } catch (err) {
        console.error("Erro ao carregar resgates:", err);
        setError("Erro ao carregar histórico de resgates");
      } finally {
        setLoading(false);
      }
    };

    loadRedemptions();
  }, [session]);

  return (
    <RequireAuth>
      <main className="min-h-screen bg-white text-neutral-darker">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] px-4 pb-10 pt-8 sm:px-7 lg:pt-11">
          {/* Header */}
          <section className="mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/pontos"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[18px] font-bold text-primary-dark transition hover:bg-white"
                aria-label="Voltar"
              >
                ←
              </Link>
              <div>
                <h1 className="text-[31px] font-bold tracking-[-0.04em] text-neutral-darker">
                  Meus Resgates
                </h1>
                <p className="mt-1 text-sm font-semibold text-neutral-muted">
                  Acompanhe todos os seus resgates de recompensas
                </p>
              </div>
            </div>
          </section>

          {/* Conteúdo */}
          <section className="rounded-2xl bg-white px-6 py-8 shadow-soft sm:px-10">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm font-semibold text-neutral-muted">Carregando seus resgates...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-danger-light px-4 py-3 text-sm font-semibold text-danger-primary">
                {error}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 text-[48px]">🎁</div>
                <p className="text-[15px] font-bold text-neutral-darker">Nenhum resgate ainda</p>
                <p className="mt-2 text-sm font-semibold text-neutral-muted">
                  Você ainda não resgatou nenhuma recompensa. Volte para resgatar algo!
                </p>
                <Link
                  href="/pontos"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary-dark px-7 text-xs font-bold text-white transition hover:bg-white"
                >
                  Ver Recompensas
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((redemption) => {
                  const status = statusMap[redemption.status];
                  return (
                    <button
                      key={redemption.id}
                      type="button"
                      onClick={() => setSelectedRedemption(redemption)}
                      className="w-full text-left transition hover:bg-white"
                    >
                      <div className={`rounded-xl p-5 ${status.color}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[15px] font-bold text-current">
                              {redemption.reward_name}
                            </h3>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="font-bold">Código:</span>
                                <span className="font-mono font-bold tracking-wider">
                                  {redemption.redemption_code}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold">
                                <span>Resgatado em:</span>
                                <span className="font-bold">
                                  {new Date(redemption.redemption_date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold">
                                <span>Prazo de retirada:</span>
                                <span className="font-bold">
                                  {new Date(redemption.pickup_deadline).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold ${status.badgeColor}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Info Box */}
          <section className="mt-8 rounded-xl bg-white px-5 py-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-primary-dark">
              ℹ️ Informações Importantes
            </h2>
            <ul className="mt-3 space-y-2 text-xs font-semibold leading-5 text-neutral-darker">
              <li>• Use o código exibido para retirar sua recompensa no local indicado</li>
              <li>• Resgate seus pontos dentro do prazo informado</li>
              <li>• Leve seu documento de identificação ao local de retirada</li>
              <li>• Resgates não retirados dentro do prazo expiram automaticamente</li>
            </ul>
          </section>
        </div>

        {selectedRedemption && (
          <RedemptionDetailModal
            redemption={selectedRedemption}
            onClose={() => setSelectedRedemption(null)}
          />
        )}
      </main>
    </RequireAuth>
  );
}

function RedemptionDetailModal({
  redemption,
  onClose,
}: {
  redemption: RedemptionHistory;
  onClose: () => void;
}) {
  const status = statusMap[redemption.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[430px] rounded-2xl bg-white px-7 pb-7 pt-8 shadow-soft-lg"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-dark">
              Resgate #{redemption.id.substring(0, 8)}
            </p>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.04em] text-neutral-darker">
              {redemption.reward_name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"
            aria-label="Fechar"
          >
            x
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* Status */}
          <div className={`rounded-xl p-4 ${status.color}`}>
            <p className="text-xs font-bold uppercase tracking-[0.08em]">Status</p>
            <p className="mt-2 text-[15px] font-bold">{status.label}</p>
          </div>

          {/* Código */}
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-darker">
              Código de Resgate
            </p>
            <p className="mt-2 text-center text-[20px] font-bold tracking-wider text-primary-dark">
              {redemption.redemption_code}
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(redemption.redemption_code);
              }}
              className="mt-3 w-full rounded-full bg-white px-4 py-2 text-xs font-bold text-primary-dark transition hover:bg-white"
            >
              Copiar código
            </button>
          </div>

          {/* Datas */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-darker">
                Data do Resgate
              </p>
              <p className="mt-2 text-sm font-bold text-neutral-darker">
                {new Date(redemption.redemption_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-darker">
                Prazo de Retirada
              </p>
              <p className="mt-2 text-sm font-bold text-neutral-darker">
                {new Date(redemption.pickup_deadline).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Instruções */}
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-dark">
              Próximos Passos
            </p>
            <ol className="mt-3 space-y-2">
              <li className="flex gap-2 text-xs font-semibold leading-5 text-neutral-darker">
                <span className="font-bold">1.</span>
                <span>Utilize o código mostrado para retirada no local indicado</span>
              </li>
              <li className="flex gap-2 text-xs font-semibold leading-5 text-neutral-darker">
                <span className="font-bold">2.</span>
                <span>Dirija-se ao local de retirada informado</span>
              </li>
              <li className="flex gap-2 text-xs font-semibold leading-5 text-neutral-darker">
                <span className="font-bold">3.</span>
                <span>Apresente este código e seu documento de identificação</span>
              </li>
              <li className="flex gap-2 text-xs font-semibold leading-5 text-neutral-darker">
                <span className="font-bold">4.</span>
                <span>Retire sua recompensa dentro do prazo</span>
              </li>
            </ol>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-11 w-full rounded-full bg-primary-dark px-5 text-xs font-bold text-white shadow-soft-sm"
        >
          Fechar
        </button>
      </section>
    </div>
  );
}
