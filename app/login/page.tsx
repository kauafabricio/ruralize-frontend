"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthCard } from "../components/AuthCard";
import { AuthInput } from "../components/AuthInput";
import { LockIcon } from "../components/AuthIcons";
import { AuthShell } from "../components/AuthShell";
import { Toast } from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://rural-backend.vercel.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      // ✅ sucesso
      setToast({
        message: "Login realizado com sucesso!",
        type: "success",
      });

      // 👉 se existir token:
      // localStorage.setItem("token", data.token);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);

    } catch (err: any) {
      setToast({
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell logoName="Ruralize">
      {/* 🔥 TOAST */}
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
            Acesse sua conta para gerenciar suas atividades acadêmicas
            sustentáveis.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleLogin}>
          {/* EMAIL */}
          <AuthInput
            label="E-mail"
            type="email"
            placeholder="seu@ufrpe.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* SENHA */}
          <AuthInput
            label="Senha"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            disabled={loading}
            className="h-14 w-full rounded-full bg-[#287630] text-[13px] font-bold text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-colors hover:bg-[#1f6428] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
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