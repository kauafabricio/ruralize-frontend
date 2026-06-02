"use client";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";

const rewards = [
  {
    title: "Combo - 5 Fichas do RU Janta",
    description: "Troque seus pontos por 5 fichas de RU - Janta.",
    points: "1000 pts",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Combo - 5 Fichas do RU Almoço",
    description: "Troque seus pontos por 5 fichas de RU - Almoço.",
    points: "1300 pts",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Garrafa Térmica",
    description: "Aço inox com acabamento em bambu certificado.",
    points: "200 pts",
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

export default function PointsPage() {
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
                  750
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
                      className="mt-5 h-10 w-full rounded-full bg-[#9ff0a1] text-[11px] font-black text-[#287630] transition hover:bg-[#8ee892]"
                    >
                      Resgatar agora
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
              {actionHistory.map((action, index) => {
                const positive = action.tone === "positive";

                return (
                  <div
                    key={action.title}
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
      </main>
    </RequireAuth>
  );
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


