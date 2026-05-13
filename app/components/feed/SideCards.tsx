import { PlusIcon } from "./FeedIcons";

const suggestions = [
  {
    name: "Mariana Lima",
    role: "Engenharia Florestal",
    color: "bg-[#2f7d42]",
  },
  {
    name: "Roberto Silva",
    role: "Pesquisador UFRPE",
    color: "bg-[#286a7a]",
  },
];

export function SuggestionsCard() {
  return (
    <aside className="rounded-[28px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <h2 className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]">
        Sugestões
      </h2>

      <div className="mt-6 space-y-4">
        {suggestions.map((person, index) => (
          <div key={person.name} className="flex items-center gap-3">
            <ProfileAvatar color={person.color} variant={index} />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black leading-4 text-[#242b23]">
                {person.name}
              </p>
              <p className="truncate text-[10px] font-semibold leading-3 text-[#8a9186]">
                {person.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-7 w-full text-center text-[11px] font-black text-[#287630]"
      >
        Ver todas as sugestões
      </button>
    </aside>
  );
}

export function NewScheduleCard() {
  return (
    <aside className="flex min-h-[318px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8dbd2] bg-[#fbfbf7] px-8 text-center">
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3b8b42] text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
        aria-label="Novo agendamento"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      <h2 className="mt-8 text-[18px] font-black tracking-[-0.03em] text-[#1e261e]">
        Novo Agendamento
      </h2>
      <p className="mt-3 max-w-[235px] text-[11px] font-semibold leading-5 text-[#777f72]">
        Encontre novas atividades e participe da nossa comunidade.
      </p>

      <button
        type="button"
        className="mt-7 h-11 rounded-full bg-[#287630] px-8 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)]"
      >
        Explorar Eventos
      </button>
    </aside>
  );
}

function ProfileAvatar({
  color,
  variant,
}: {
  color: string;
  variant: number;
}) {
  return (
    <div
      className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full ${color} ring-2 ring-[#e8efdf]`}
    >
      <span className="absolute left-[11px] top-[7px] h-[10px] w-[15px] rounded-full bg-[#e9b37f]" />
      <span
        className={`absolute top-[13px] h-[9px] rounded-t-full ${
          variant === 0
            ? "left-[8px] w-[24px] bg-[#352a20]"
            : "left-[10px] w-[20px] bg-[#183f42]"
        }`}
      />
      <span className="absolute bottom-0 left-[7px] h-[18px] w-[27px] rounded-t-[16px] bg-[#dfead7]" />
      <span className="absolute bottom-[2px] left-[13px] h-[10px] w-[14px] rounded-t-full bg-[#275f35]" />
    </div>
  );
}
