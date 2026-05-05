import Link from "next/link";

type AuthLogoProps = {
  name?: string;
};

export function AuthLogo({ name = "SustentaRural" }: AuthLogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex flex-col items-start gap-1 text-[#1f6f2a] transition-opacity hover:opacity-80"
      aria-label="Voltar para a pagina inicial"
    >
      <span className="text-[32px] font-black leading-none tracking-[-0.03em] md:text-[36px]">
        {name}
      </span>
      <span className="rounded-full bg-[#91e671] px-2 py-[2px] text-[8px] font-black uppercase leading-none tracking-wide text-[#27722f]">
        UFRPE
      </span>
    </Link>
  );
}
