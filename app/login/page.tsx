import Link from "next/link";
import { AuthCard } from "../components/AuthCard";
import { AuthInput } from "../components/AuthInput";
import { LockIcon } from "../components/AuthIcons";
import { AuthShell } from "../components/AuthShell";
import { MatriculaInput } from "../components/MatriculaInput";

export default function LoginPage() {
  return (
    <AuthShell logoName="Ruralize">
      <AuthCard className="max-w-[450px]">
        <div className="mb-10">
          <h1 className="text-[28px] font-black leading-tight tracking-[-0.03em] text-[#1f6f2a]">
            Bem-vindo
          </h1>
          <p className="mt-3 max-w-[265px] text-[12px] font-medium leading-5 text-[#8a9186]">
            Acesse sua conta para gerenciar suas atividades acadêmicas
            sustentáveis.
          </p>
        </div>

        <form className="space-y-8">
          <MatriculaInput />
          <AuthInput
            label="Senha"
            type="password"
            placeholder="********"
            icon={<LockIcon />}
            action={
              <Link
                href="/login"
                className="text-[10px] font-black normal-case tracking-normal text-[#287630]"
              >
                Esqueci senha
              </Link>
            }
          />

          <button
            type="submit"
            className="h-14 w-full rounded-full bg-[#287630] text-[13px] font-bold text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-colors hover:bg-[#1f6428]"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 border-t border-[#ebebe8] pt-8 text-center text-[12px] font-medium text-[#8c9388]">
          Ainda não possui acesso?{" "}
          <Link href="/perfil" className="font-black text-[#287630]">
            Criar conta
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
