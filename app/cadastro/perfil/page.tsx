"use client";

import Link from "next/link";
import { AuthCard } from "@/app/components/AuthCard";
import { GraduationIcon, UserIcon } from "@/app/components/AuthIcons";
import { AuthShell } from "@/app/components/AuthShell";

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

export default function CadastroPerfilPage() {
  return (
    <AuthShell>
      <AuthCard className="max-w-[530px]">
        <div className="mx-auto mb-10 max-w-[320px] text-center">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-primary-dark">
            Escolha seu perfil
          </h1>
          <p className="mt-3 text-xs font-semibold leading-5 text-neutral-darker">
            Selecione como deseja criar sua conta no Ruralize
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {profileOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group flex h-36 flex-col items-center justify-center gap-4 bg-white px-6 text-center text-primary-dark transition-colors hover:bg-primary-dark hover:text-white"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary-dark shadow-soft transition-colors group-hover:bg-white">
                {option.icon}
              </span>
              <span className="text-sm font-bold uppercase tracking-[0.12em]">
                {option.title}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-9 border-t border-neutral-light pt-8 text-center text-xs font-medium text-neutral-darker">
          Ja possui uma conta?{" "}
          <Link href="/login" className="font-bold text-primary-dark">
            Entrar agora
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
