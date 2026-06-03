"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { PostCard } from "@/app/components/feed/PostCard";
import { FollowButton } from "@/app/components/FollowButton";
import { Toast } from "@/app/components/Toast";
import { getProfileByUser, type ProfileResponse } from "@/app/services/api/profile.api";
import { getPostsByUser, type PostResponse } from "@/app/services/api/posts.api";

export default function UserProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const userId = params.slug;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  async function loadUserData() {
    setLoading(true);
    setError(null);

    try {
      const [profileData, postsData] = await Promise.all([
        getProfileByUser(userId),
        getPostsByUser(userId),
      ]);

      setProfile(profileData);
      setPosts(postsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar perfil";
      setError(message);
      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePostUpdated() {
    loadUserData();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
        <FeedHeader showSearch={false} />
        <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
          <div className="animate-pulse space-y-4">
            <div className="h-[174px] rounded-[28px] bg-[#e0e5d8]" />
            <div className="h-[300px] rounded-[28px] bg-[#e0e5d8]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
        <FeedHeader showSearch={false} />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
          <div className="rounded-[28px] bg-white px-6 py-8 text-center text-sm text-red-600 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
            {error || "Perfil não encontrado"}
          </div>
          <div className="mt-4">
            <Link
              href="/explore"
              className="rounded-full border border-[#d9e0d4] bg-white px-4 py-2 text-sm font-black text-[#1f6f2a] transition hover:bg-[#f4f6f1]"
            >
              Voltar à exploração
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const coverImage = profile.cover_photo_url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85";
  const profileImage = profile.profile_photo_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=85";

  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
      <FeedHeader showSearch={false} />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
        <div className="mb-6 flex items-center justify-between gap-3 text-sm font-black text-[#1f6f2a]">
          <Link
            href="/explore"
            className="rounded-full border border-[#d9e0d4] bg-white px-4 py-2 transition hover:bg-[#f4f6f1]"
          >
            Voltar à exploração
          </Link>
          <span className="rounded-full bg-[#e9f4e4] px-4 py-2 text-[#225f35]">
            Perfil público
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
          <div
            className="h-[174px] bg-[#d7e4c6] bg-cover bg-center"
            role="img"
            aria-label="Capa do perfil"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12)), url("${coverImage}")`,
            }}
          />

          <div className="relative px-6 pb-8 pt-[62px] sm:px-8 lg:px-9">
            <ProfileAvatar name={profile.name} imageUrl={profileImage} />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[620px]">
                <h1 className="text-[30px] font-black leading-tight tracking-[-0.03em] text-[#1e261e]">
                  {profile.name}
                </h1>
                <p className="mt-1 text-[13px] font-black text-[#287630]">
                  {profile.role}
                  {profile.course && ` de ${profile.course}`}
                </p>
                <p className="mt-6 max-w-[590px] text-[12px] font-medium leading-6 text-[#545d50]">
                  {profile.description || "Sem descrição adicionada"}
                </p>
              </div>

              <FollowButton />
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
              className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]"
            >
              Atividades recentes
            </h2>

            {posts.length === 0 ? (
              <div className="mt-5 rounded-[22px] bg-white px-6 py-8 text-center shadow-[0_1px_0_rgba(33,55,30,0.04)]">
                <p className="text-[13px] font-medium text-[#545d50]">
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
  imageUrl: string;
}) {
  return (
    <div className="absolute left-6 top-[-58px] h-[116px] w-[116px] rounded-full bg-white p-[5px] shadow-[0_14px_28px_rgba(33,55,30,0.18)] sm:left-8 lg:left-9">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[#287630]">
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-black text-white">
          {readInitials(name)}
        </span>
        <span
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          aria-hidden="true"
        />
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
    <section className="rounded-[22px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="flex items-center gap-2 text-[#1e261e]">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f4e4] text-[#287630]">
          ✓
        </span>
        <h2 className="text-[15px] font-black tracking-[-0.02em]">
          Informações Acadêmicas
        </h2>
      </div>

      <dl className="mt-7 space-y-6">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            E-mail
          </dt>
          <dd className="mt-2 break-words text-[12px] font-semibold text-[#333b31]">
            {email}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Função
          </dt>
          <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
            {role}
          </dd>
        </div>

        {course && (
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
              Curso
            </dt>
            <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
              {course}
            </dd>
          </div>
        )}

        {department && (
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
              Departamento
            </dt>
            <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
              {department}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Matrícula
          </dt>
          <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
            {registration}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Localização
          </dt>
          <dd className="mt-2 flex items-center gap-2 text-[12px] font-semibold text-[#333b31]">
            <LocationIcon className="h-[14px] w-[14px] text-[#287630]" />
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
