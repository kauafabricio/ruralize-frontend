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
    color: "bg-[#fff8e1] text-[#7a5a00]",
    badgeColor: "bg-[#ffd666]",
  },
  collected: {
    label: "Retirado",
    color: "bg-[#e8f5e9] text-[#2e7d32]",
    badgeColor: "bg-[#81c784]",
  },
  expired: {
    label: "Expirado",
    color: "bg-[#ffebee] text-[#c62828]",
    badgeColor: "bg-[#ef5350]",
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
      <main className="min-h-screen bg-[#f8f8f3] text-[#1f281f]">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] px-4 pb-10 pt-8 sm:px-7 lg:pt-11">
          {/* Header */}
          <section className="mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/pontos"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[18px] font-black text-[#287630] transition hover:bg-[#f1f3ed]"
                aria-label="Voltar"
              >
                ←
              </Link>
              <div>
                <h1 className="text-[31px] font-black tracking-[-0.04em] text-[#1e261e]">
                  Meus Resgates
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-[#687266]">
                  Acompanhe todos os seus resgates de recompensas
                </p>
              </div>
            </div>
          </section>

          {/* Conteúdo */}
          <section className="rounded-[28px] bg-white px-6 py-8 shadow-[0_1px_0_rgba(33,55,30,0.05)] sm:px-10">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-[13px] font-semibold text-[#687266]">Carregando seus resgates...</p>
              </div>
            ) : error ? (
              <div className="rounded-[14px] bg-[#fff3f3] px-4 py-3 text-[13px] font-semibold text-[#b92828]">
                {error}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 text-[48px]">🎁</div>
                <p className="text-[15px] font-black text-[#1e261e]">Nenhum resgate ainda</p>
                <p className="mt-2 text-[13px] font-semibold text-[#687266]">
                  Você ainda não resgatou nenhuma recompensa. Volte para resgatar algo!
                </p>
                <Link
                  href="/pontos"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#287630] px-7 text-[11px] font-black text-white transition hover:bg-[#1f5c24]"
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
                      className="w-full text-left transition hover:bg-[#f8f8f3]"
                    >
                      <div className={`rounded-[18px] p-5 ${status.color}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[15px] font-black text-current">
                              {redemption.reward_name}
                            </h3>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2 text-[12px] font-semibold">
                                <span className="font-black">Código:</span>
                                <span className="font-mono font-black tracking-wider">
                                  {redemption.redemption_code}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[12px] font-semibold">
                                <span>Resgatado em:</span>
                                <span className="font-black">
                                  {new Date(redemption.redemption_date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[12px] font-semibold">
                                <span>Prazo de retirada:</span>
                                <span className="font-black">
                                  {new Date(redemption.pickup_deadline).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-black ${status.badgeColor}`}>
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
          <section className="mt-8 rounded-[18px] bg-[#f0f8f0] px-5 py-4">
            <h2 className="text-[12px] font-black uppercase tracking-[0.08em] text-[#287630]">
              ℹ️ Informações Importantes
            </h2>
            <ul className="mt-3 space-y-2 text-[12px] font-semibold leading-5 text-[#536050]">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d7ddd3]/70 px-4 py-8 backdrop-blur-[5px]">
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[430px] rounded-[24px] bg-white px-7 pb-7 pt-8 shadow-[0_24px_50px_rgba(33,55,30,0.22)]"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#287630]">
              Resgate #{redemption.id.substring(0, 8)}
            </p>
            <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1e261e]">
              {redemption.reward_name}
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

        <div className="mt-6 space-y-4">
          {/* Status */}
          <div className={`rounded-[14px] p-4 ${status.color}`}>
            <p className="text-[11px] font-black uppercase tracking-[0.08em]">Status</p>
            <p className="mt-2 text-[15px] font-black">{status.label}</p>
          </div>

          {/* Código */}
          <div className="rounded-[14px] bg-[#f7f9f4] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#536050]">
              Código de Resgate
            </p>
            <p className="mt-2 text-center text-[20px] font-black tracking-wider text-[#287630]">
              {redemption.redemption_code}
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(redemption.redemption_code);
              }}
              className="mt-3 w-full rounded-full bg-white px-4 py-2 text-[11px] font-black text-[#287630] transition hover:bg-[#f0f8f0]"
            >
              Copiar código
            </button>
          </div>

          {/* Datas */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[14px] bg-[#f7f9f4] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#536050]">
                Data do Resgate
              </p>
              <p className="mt-2 text-[13px] font-black text-[#1e261e]">
                {new Date(redemption.redemption_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#f7f9f4] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#536050]">
                Prazo de Retirada
              </p>
              <p className="mt-2 text-[13px] font-black text-[#1e261e]">
                {new Date(redemption.pickup_deadline).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Instruções */}
          <div className="rounded-[14px] bg-[#f0f8f0] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#287630]">
              Próximos Passos
            </p>
            <ol className="mt-3 space-y-2">
              <li className="flex gap-2 text-[12px] font-semibold leading-5 text-[#536050]">
                <span className="font-black">1.</span>
                <span>Utilize o código mostrado para retirada no local indicado</span>
              </li>
              <li className="flex gap-2 text-[12px] font-semibold leading-5 text-[#536050]">
                <span className="font-black">2.</span>
                <span>Dirija-se ao local de retirada informado</span>
              </li>
              <li className="flex gap-2 text-[12px] font-semibold leading-5 text-[#536050]">
                <span className="font-black">3.</span>
                <span>Apresente este código e seu documento de identificação</span>
              </li>
              <li className="flex gap-2 text-[12px] font-semibold leading-5 text-[#536050]">
                <span className="font-black">4.</span>
                <span>Retire sua recompensa dentro do prazo</span>
              </li>
            </ol>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-11 w-full rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
        >
          Fechar
        </button>
      </section>
    </div>
  );
}
