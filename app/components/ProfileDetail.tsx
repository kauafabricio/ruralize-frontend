"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProfileByUser,
  updateProfile,
  type ProfileResponse,
  type ProfileUpdate,
} from "@/app/services/api/profile.api";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { Toast } from "@/app/components/Toast";

export function ProfileDetail() {
  const { user } = useAuth();
  const params = useParams();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    profile_photo_url: "",
    cover_photo_url: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      setLoading(true);
      try {
        const data = await getProfileByUser(userId);
        setProfile(data);
        setFormData({
          description: data.description || "",
          profile_photo_url: data.profile_photo_url || "",
          cover_photo_url: data.cover_photo_url || "",
        });
      } catch (err) {
        setToast({
          message:
            err instanceof Error ? err.message : "Erro ao carregar perfil",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  async function handleSaveProfile() {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const payload: ProfileUpdate = {
        description: formData.description || undefined,
        profile_photo_url: formData.profile_photo_url || undefined,
        cover_photo_url: formData.cover_photo_url || undefined,
      };

      await updateProfile(user.id, payload);

      setToast({
        message: "Perfil atualizado com sucesso!",
        type: "success",
      });

      setProfile((prev) =>
        prev
          ? { ...prev, ...payload }
          : null
      );

      setIsEditing(false);
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao atualizar perfil",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-[#f8f8f3] py-8 text-center">
          Carregando perfil...
        </div>
      </RequireAuth>
    );
  }

  if (!profile) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-[#f8f8f3] py-8 text-center text-red-600">
          Perfil não encontrado
        </div>
      </RequireAuth>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f8f8f3]">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Cover Photo */}
        <div className="relative h-64 w-full bg-[#e0e0e0]">
          {formData.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.cover_photo_url}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-r from-[#1f6f2a] to-[#287630]">
              <span className="text-white opacity-50">Sem imagem de capa</span>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Profile Header */}
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#205f36] text-4xl font-black uppercase text-white shadow-[0_4px_12px_rgba(33,55,30,0.2)]">
                {formData.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.profile_photo_url}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  profile.name.substring(0, 2)
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-[#1f6f2a]">
                {profile.name}
              </h1>
              <p className="text-lg text-[#6c7b6d]">
                {profile.role === "student" ? "Estudante" : "Professor"}
              </p>

              {profile.department && (
                <p className="mt-2 text-[#4f5b4e]">
                  Departamento: <strong>{profile.department}</strong>
                </p>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-4 rounded-full bg-[#287630] px-6 py-2 text-white font-bold transition-colors hover:bg-[#1f6428]"
                >
                  {isEditing ? "Cancelar" : "Editar Perfil"}
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="mt-8 space-y-6">
            {/* Description */}
            <section className="rounded-[18px] bg-white p-6 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
              <h2 className="mb-4 text-lg font-black text-[#1f6f2a]">Sobre</h2>

              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva-se..."
                  className="w-full rounded-lg border border-[#e5eadf] p-3 text-[13px] outline-none"
                  rows={4}
                />
              ) : (
                <p className="text-[#20281f]">
                  {formData.description || "Sem descrição"}
                </p>
              )}
            </section>

            {/* Photo URLs (for editing) */}
            {isEditing && (
              <section className="rounded-[18px] bg-white p-6 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
                <h2 className="mb-4 text-lg font-black text-[#1f6f2a]">
                  Imagens
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#4f5b4e]">
                      URL da Foto de Perfil
                    </label>
                    <input
                      type="url"
                      value={formData.profile_photo_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile_photo_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="mt-1 w-full rounded-lg border border-[#e5eadf] p-2 text-[13px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#4f5b4e]">
                      URL da Foto de Capa
                    </label>
                    <input
                      type="url"
                      value={formData.cover_photo_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cover_photo_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="mt-1 w-full rounded-lg border border-[#e5eadf] p-2 text-[13px] outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="mt-6 w-full rounded-full bg-[#287630] py-3 text-white font-bold transition-opacity disabled:opacity-50 hover:bg-[#1f6428]"
                >
                  {isSaving ? "Salvando..." : "Salvar Perfil"}
                </button>
              </section>
            )}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
