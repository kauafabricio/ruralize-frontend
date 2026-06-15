"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { PostCard } from "@/app/components/feed/PostCard";
import { FollowButton } from "@/app/components/FollowButton";
import { Toast } from "@/app/components/Toast";
import { useAuth } from "@/app/components/auth/AuthProvider";
import {
  followUser,
  getFollowStatus,
  unfollowUser,
  getProfileByUser,
  type ProfileResponse,
} from "@/app/services/api/profile.api";
import { getPostsByUser, type PostResponse } from "@/app/services/api/posts.api";
import { translateRole } from "@/app/lib/roleTranslator";

export default function UserProfilePage() {
  const params = useParams<{ slug: string }>();
  const { user: currentUser } = useAuth();
  const userId = params.slug;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  const loadUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileData, postsData] = await Promise.all([
        getProfileByUser(userId),
        getPostsByUser(userId),
      ]);

      setProfile(profileData);
      setPosts(postsData);

      if (currentUser?.id && currentUser.id !== userId) {
        try {
          const followStatus = await getFollowStatus(currentUser.id, userId);
          setIsFollowing(followStatus.is_following);
        } catch {
          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar perfil";

      // Log detalhado do erro
      console.error("Erro completo:", err);
      console.error("Tipo de erro:", err instanceof Error ? "Error" : typeof err);
      console.error("Mensagem:", errorMessage);

      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, userId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadUserData();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadUserData]);

  async function handleFollowToggle() {
    if (!currentUser?.id) {
      setToast({
        message: "Faça login para seguir este usuário.",
        type: "error",
      });
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, userId);
        setIsFollowing(false);
        setToast({
          message: "Você deixou de seguir este usuário.",
          type: "success",
        });
      } else {
        await followUser(currentUser.id, userId);
        setIsFollowing(true);
        setToast({
          message: "Agora você está seguindo este usuário.",
          type: "success",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Não foi possível atualizar o status de seguir";
      console.error("Erro ao alternar seguir:", err);
      setToast({ message: errorMessage, type: "error" });
    }
  }

  function handlePostUpdated() {
    loadUserData();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-neutral-darker">
        <FeedHeader showSearch={false} />
        <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
          <div className="animate-pulse space-y-4">
            <div className="h-[174px] rounded-2xl bg-white" />
            <div className="h-[300px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-white text-neutral-darker">
        <FeedHeader showSearch={false} />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
          <div className="rounded-2xl bg-white px-6 py-8 text-center text-sm text-red-600 shadow-soft-xs">
            {error || "Perfil não encontrado"}
          </div>
          <div className="mt-4">
            <Link
              href="/explore"
              className="rounded-full border border-pastel-support bg-white px-4 py-2 text-sm font-bold text-primary-dark transition hover:bg-white"
            >
              Voltar à exploração
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const coverImage = profile.cover_photo_url || undefined;
  const profileImage = profile.profile_photo_url || undefined;

  return (
    <main className="min-h-screen bg-white text-neutral-darker">
      <FeedHeader showSearch={false} />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
        <div className="mb-6 flex items-center justify-between gap-3 text-sm font-bold text-primary-dark">
          <Link
            href="/explore"
            className="rounded-full border border-pastel-support bg-white px-4 py-2 transition hover:bg-white"
          >
            Voltar à exploração
          </Link>
          <div className="flex items-center gap-3">
            {isOwnProfile && currentUser ? (
              <>
                <span className="rounded-full bg-white">
                  Seu Perfil
                </span>
                <Link
                  href="/perfil"
                  className="rounded-full bg-primary-dark px-4 py-2 text-white transition hover:bg-primary-darker"
                >
                  Editar
                </Link>
              </>
            ) : (
              <>
                <span className="rounded-full bg-white">
                  Perfil público
                </span>
                {currentUser ? (
                  <FollowButton
                    isFollowing={isFollowing}
                    onFollowToggle={handleFollowToggle}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-soft-xs">
          <div
            className="h-[174px] bg-white bg-cover bg-center"
            role="img"
            aria-label="Capa do perfil"
            style={
              coverImage
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12)), url("${coverImage}")`,
                  }
                : {
                    backgroundImage: "linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12))",
                  }
            }
          />

          <div className="relative px-6 pb-8 pt-[62px] sm:px-8 lg:px-9">
            <ProfileAvatar name={profile.name} imageUrl={profileImage} />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[620px]">
                <h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em] text-neutral-darker">
                  {profile.name}
                </h1>
                <p className="mt-1 text-sm font-bold text-primary-dark">
                  {translateRole(profile.role)}
                </p>
                <p className="mt-6 max-w-[590px] text-xs font-medium leading-6 text-neutral-darker">
                  {profile.description || "Sem descrição adicionada"}
                </p>
              </div>

            </div>
          </div>
        </section>

        <div className="mt-9 grid gap-9 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-8">
            <AcademicInfoCard
              email={profile.academic_info?.email || "—"}
              role={profile.role}
              registration={profile.academic_info?.registration || "—"}
              location={profile.academic_info?.campus_location || "—"}
              department={profile.department}
              course={profile.course}
            />
          </aside>

          <section aria-labelledby="profile-activities-title">
            <h2
              id="profile-activities-title"
              className="text-[15px] font-bold tracking-[-0.02em] text-neutral-darker"
            >
              Atividades recentes
            </h2>

            {posts.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-white px-6 py-8 text-center shadow-soft-xs">
                <p className="text-sm font-medium text-neutral-darker">
                  Este usuário ainda não tem postagens.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostUpdated={handlePostUpdated}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  return (
    <div className="absolute left-6 top-[-58px] h-[116px] w-[116px] rounded-full bg-white p-[5px] shadow-soft sm:left-8 lg:left-9">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-primary-dark">
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-bold text-white">
          {readInitials(name)}
        </span>
        {imageUrl ? (
          <span
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${imageUrl}")` }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}

function AcademicInfoCard({
  email,
  role,
  registration,
  location,
  department,
  course,
}: {
  email: string;
  role: string;
  registration: string;
  location: string;
  department?: string | null;
  course?: string | null;
}) {
  return (
    <section className="rounded-2xl bg-white px-6 py-7 shadow-soft-xs">
      <div className="flex items-center gap-2 text-neutral-darker">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary-dark">
          ✓
        </span>
        <h2 className="text-[15px] font-bold tracking-[-0.02em]">
          Informações Acadêmicas
        </h2>
      </div>

      <dl className="mt-7 space-y-6">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-darker">
            E-mail
          </dt>
          <dd className="mt-2 break-words text-xs font-semibold text-neutral-darker">
            {email}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-darker">
            Função
          </dt>
          <dd className="mt-2 text-xs font-semibold text-neutral-darker">
            {role}
          </dd>
        </div>

        {department && (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-darker">
              Departamento
            </dt>
            <dd className="mt-2 text-xs font-semibold text-neutral-darker">
              {department}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-darker">
            Matrícula
          </dt>
          <dd className="mt-2 text-xs font-semibold text-neutral-darker">
            {registration}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-darker">
            Localização
          </dt>
          <dd className="mt-2 flex items-center gap-2 text-xs font-semibold text-neutral-darker">
            <LocationIcon className="h-[14px] w-[14px] text-primary-dark" />
            {location}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function LocationIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function readInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "R";
}
