"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/app/components/AuthCard";
import { AuthInput } from "@/app/components/AuthInput";
import { EyeIcon, EyeOffIcon, LockIcon } from "@/app/components/AuthIcons";
import { AuthShell } from "@/app/components/AuthShell";
import { Toast } from "@/app/components/Toast";
import { useAuth } from "@/app/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await login({ email, password });

      setToast({
        message: "Login realizado com sucesso!",
        type: "success",
      });

      router.replace("/feed");
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Erro ao entrar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell logoName="Ruralize">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AuthCard className="max-w-[450px]">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-primary-dark">
            Bem-vindo
          </h1>

          <p className="mt-3 max-w-[265px] text-xs font-medium leading-5 text-neutral-muted">
            Acesse sua conta para gerenciar suas atividades acadêmicas
            sustentáveis.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleLogin}>
          <AuthInput
            label="E-mail"
            type="email"
            placeholder="seu@ufrpe.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mb-3 flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-darker">
            <span>Senha</span>

            <Link
              href="/login"
              className="text-[10px] font-bold normal-case tracking-normal text-primary-dark"
            >
              Esqueci senha
            </Link>
          </div>

          <AuthInput
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon />}
            action={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="inline-flex items-center justify-center text-neutral-darker"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-full bg-primary-dark text-sm font-bold text-white shadow-soft transition-colors hover:bg-primary-darker disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#ebebe8] pt-8 text-center text-xs font-medium text-neutral-darker">
          Ainda não possui acesso?{" "}
          <Link href="/cadastro/perfil" className="font-bold text-primary-dark">
            Criar conta
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
