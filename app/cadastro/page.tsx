"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Toast } from "../components/Toast";

export default function CadastroPage() {
  const searchParams = useSearchParams();
  const perfil = searchParams.get("perfil");

  const role = perfil === "professor" ? "teacher" : "student";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registration, setRegistration] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const body: any = {
        name,
        email,
        password,
        role,
      };

      // 👇 só adiciona se for aluno
      if (role === "student") {
        if (!registration || !course) {
          throw new Error("Preencha todos os campos de aluno");
        }

        body.registration = Number(registration);
        body.course = course;
      }

      const response = await fetch(
        "https://rural-backend.vercel.app/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao cadastrar");
      }

      // ✅ sucesso
      setToast({
        message: "Conta criada com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        window.location.href = "/login";
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
    <AuthShell>
      {/* 🔥 TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AuthCard className="max-w-[530px]">
        <p className="mx-auto mb-8 max-w-[285px] text-center text-[12px] font-semibold leading-5 text-[#30372f]">
          Crie sua conta para começar sua jornada sustentável na UFRPE
        </p>

        <form className="space-y-6" onSubmit={handleRegister}>
          <AuthInput
            label="Nome completo"
            placeholder="Como devemos te chamar?"
            icon={<UserIcon />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <AuthInput
            label="E-mail"
            type="email"
            placeholder="seu@email.ufrpe.br"
            icon={<MailIcon />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* 👇 Só aparece para ALUNO */}
          {role === "student" && (
            <div className="grid grid-cols-2 gap-5">
              <MatriculaInput
                value={registration}
                onChange={(e: any) => setRegistration(e.target.value)}
              />
              <CourseSelect
                value={course}
                onChange={(value) => setCourse(value)}
              />
            </div>
          )}

          <AuthInput
            label="Senha"
            type="password"
            placeholder="********"
            icon={<LockIcon />}
            action={<EyeIcon className="h-4 w-4 text-[#697163]" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 h-14 w-full rounded-full bg-[#287630] text-[13px] font-bold text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-colors hover:bg-[#1f6428] disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar minha conta"}
          </button>
        </form>

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