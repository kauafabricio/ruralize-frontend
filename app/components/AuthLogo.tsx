import Link from "next/link";
import { Logo } from "./Logo";

type AuthLogoProps = {
  name?: string;
};

export function AuthLogo({ name = "Ruralize" }: AuthLogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex flex-col items-start gap-3 transition-opacity hover:opacity-80"
      aria-label="Voltar para a pagina inicial"
    >
      <Logo variant="dark" size={48} className="h-12 w-12" />
      <div className="flex flex-col items-start gap-1">
        <span className="text-[24px] font-bold leading-none tracking-[-0.03em] text-primary-dark md:text-[28px]">
          {name}
        </span>
        <span className="rounded-full bg-secondary-light px-2 py-[2px] text-[8px] font-bold uppercase leading-none tracking-wide text-primary-dark">
          UFRPE
        </span>
      </div>
    </Link>
  );
}
