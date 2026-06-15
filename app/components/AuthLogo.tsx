import Link from "next/link";
import { RuralizeLogoMinimalist } from "./RuralizeLogoMinimalist";

type AuthLogoProps = {
  name?: string;
};

export function AuthLogo({ name = "Ruralize" }: AuthLogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex flex-col items-start gap-2 transition-opacity duration-200 hover:opacity-80"
      aria-label="Voltar para a pagina inicial"
    >
      <div className="flex items-center gap-3">
        <RuralizeLogoMinimalist size={48} />
        <div className="flex flex-col gap-1">
          <span className="text-[28px] font-black leading-none tracking-[-0.03em] text-primary-dark md:text-[32px]">
            {name}
          </span>
          <span className="rounded-full bg-secondary px-2 py-[2px] text-[8px] font-black uppercase leading-none tracking-wide text-primary-dark">
            UFRPE
          </span>
        </div>
      </div>
    </Link>
  );
}
