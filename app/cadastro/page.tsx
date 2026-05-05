import Link from "next/link";
import { AuthCard } from "../components/AuthCard";
import {
  EyeIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "../components/AuthIcons";
import { AuthInput } from "../components/AuthInput";
import { AuthShell } from "../components/AuthShell";
import { CourseSelect } from "../components/CourseSelect";
import { MatriculaInput } from "../components/MatriculaInput";

export default function CadastroPage() {
  return (
    <AuthShell>
      <AuthCard className="max-w-[530px]">
        <p className="mx-auto mb-8 max-w-[285px] text-center text-[12px] font-semibold leading-5 text-[#30372f]">
          Crie sua conta para comecar sua jornada sustentavel na UFRPE
        </p>

        <form className="space-y-6">
          <AuthInput
            label="Nome completo"
            placeholder="Como devemos te chamar?"
            icon={<UserIcon />}
          />
          <AuthInput
            label="E-mail"
            type="email"
            placeholder="seu@email.ufrpe.br"
            icon={<MailIcon />}
          />

          <div className="grid grid-cols-2 gap-5">
            <MatriculaInput placeholder="2026..." />
            <CourseSelect />
          </div>

          <AuthInput
            label="Senha"
            type="password"
            placeholder="********"
            icon={<LockIcon />}
            action={<EyeIcon className="h-4 w-4 text-[#697163]" />}
          />

          <button
            type="submit"
            className="mt-4 h-14 w-full rounded-full bg-[#287630] text-[13px] font-bold text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-colors hover:bg-[#1f6428]"
          >
            Criar minha conta
          </button>
        </form>

        <div className="mt-9 border-t border-[#ebebe8] pt-8 text-center text-[12px] font-medium text-[#8c9388]">
          Ja possui uma conta?{" "}
          <Link href="/login" className="font-black text-[#287630]">
            Entrar agora
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
