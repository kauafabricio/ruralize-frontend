"use client";

import Link from "next/link";
import { AuthCard } from "../components/AuthCard";
import { GraduationIcon, UserIcon } from "../components/AuthIcons";
import { AuthShell } from "../components/AuthShell";

const profileOptions = [
  {
    title: "Professor",
    href: "/cadastro?perfil=professor",
    icon: <GraduationIcon className="h-6 w-6" />,
  },
  {
    title: "Aluno",
    href: "/cadastro?perfil=aluno",
    icon: <UserIcon className="h-6 w-6" />,
  },
];

export default function PerfilPage() {
  return (
    <AuthShell>
      <AuthCard className="max-w-[530px]">
        <div className="mx-auto mb-10 max-w-[320px] text-center">
          <h1 className="text-[26px] font-black leading-tight tracking-[-0.03em] text-[#1f6f2a]">
            Escolha seu perfil
          </h1>
          <p className="mt-3 text-[12px] font-semibold leading-5 text-[#777f72]">
            Selecione como deseja criar sua conta no Ruralize
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {profileOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group flex h-36 flex-col items-center justify-center gap-4 bg-[#e2e2df] px-6 text-center text-[#287630] transition-colors hover:bg-[#287630] hover:text-white"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#287630] shadow-[0_10px_18px_rgba(33,55,30,0.08)] transition-colors group-hover:bg-[#f7f8f2]">
                {option.icon}
              </span>
              <span className="text-[13px] font-black uppercase tracking-[0.12em]">
                {option.title}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-9 border-t border-[#ebebe8] pt-8 text-center text-[12px] font-medium text-[#8c9388]">
          Já possui uma conta?{" "}
          <Link href="/login" className="font-black text-[#287630]">
            Entrar agora
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}