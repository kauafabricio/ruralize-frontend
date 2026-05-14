"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard } from "../components/AuthCard";
import { AuthInput } from "../components/AuthInput";
import { EyeIcon, EyeOffIcon, LockIcon } from "../components/AuthIcons";
import { AuthShell } from "../components/AuthShell";
import { Toast } from "../components/Toast";
import { useAuth } from "../components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(readNextPathFromLocation() ?? "/feed");
    }
  }, [isAuthenticated, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });

      setToast({
        message: "Login realizado com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        router.replace(readNextPathFromLocation() ?? "/feed");
      }, 1500);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Erro ao fazer login",
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
          <h1 className="text-[28px] font-black leading-tight tracking-[-0.03em] text-[#1f6f2a]">
            Bem-vindo
          </h1>
          <p className="mt-3 max-w-[265px] text-[12px] font-medium leading-5 text-[#8a9186]">
            Acesse sua conta para gerenciar suas atividades academicas
            sustentaveis.
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

          <div className="mb-3 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#262b23]">
            <span>Senha</span>
            <Link
              href="/login"
              className="text-[10px] font-black normal-case tracking-normal text-[#287630]"
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
                className="inline-flex items-center justify-center text-[#697163]"
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
            className="h-14 w-full rounded-full bg-[#287630] text-[13px] font-bold text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-colors hover:bg-[#1f6428] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#ebebe8] pt-8 text-center text-[12px] font-medium text-[#8c9388]">
          Ainda nao possui acesso?{" "}
          <Link href="/cadastro/perfil" className="font-black text-[#287630]">
            Criar conta
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

function readSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return null;
  }

  return nextPath;
}

function readNextPathFromLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  return readSafeNextPath(
    new URLSearchParams(window.location.search).get("next"),
  );
}
