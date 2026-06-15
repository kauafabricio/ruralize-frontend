"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { PostCard } from "@/app/components/feed/PostCard";
import { SuggestionsCard as BackendSuggestionsCard } from "@/app/components/feed/SideCards";
import { getPostsByUser, type PostResponse } from "@/app/services/api/posts.api";
import { getProfileByUser, updateProfile as updateProfileAPI } from "@/app/services/api/profile.api";
import { resolveBackendImageUrl } from "@/app/lib/imageUrl";
import { readFileAsDataUrl } from "@/app/lib/fileReader";
import {
  HeartIcon,
  MessageIcon,
  MoreIcon,
} from "@/app/components/feed/FeedIcons";

type EditableProfile = {
  name: string;
  email: string;
  roleDescription: string;
  bio: string;
  location: string;
};

type ProfileFieldName = keyof EditableProfile;

const activityImage =
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1400&q=85";

export default function PerfilPage() {
  return (
    <RequireAuth>
      <PerfilContent />
    </RequireAuth>
  );
}

function PerfilContent() {
  const { updateProfile, user } = useAuth();
  const initialEmail = user?.email ?? "";
  const initialDisplayName = user?.name ?? readNameFromEmail(user?.email) ?? "";
  const registration =
    readProfileValue(user?.raw, [
      "registration",
      "matricula",
      "enrollment",
      "studentRegistration",
    ]) ?? "Não informada";
  const roleLabel = formatRole(user?.role);

  // States for profile loading
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const initialProfile: EditableProfile = {
    name: initialDisplayName,
    email: initialEmail,
    roleDescription: roleLabel,
    bio: "",
    location: "",
  };

  const [editMode, setEditMode] = useState(false);
  const [savedProfile, setSavedProfile] =
    useState<EditableProfile>(initialProfile);
  const [draftProfile, setDraftProfile] =
    useState<EditableProfile>(initialProfile);
  const [savedCoverImage, setSavedCoverImage] = useState<string | null>(null);
  const [draftCoverImage, setDraftCoverImage] = useState<string | null>(null);
  const [savedAvatarImage, setSavedAvatarImage] = useState<string | null>(null);
  const [draftAvatarImage, setDraftAvatarImage] = useState<string | null>(null);
  const [saveFeedbackOpen, setSaveFeedbackOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userPosts, setUserPosts] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const subtitle = `${savedProfile.roleDescription || roleLabel} - UFRPE`;

  // Load profile from API
  useEffect(() => {
    async function loadProfileFromAPI() {
      if (!user?.id) return;

      try {
        setProfileError(null);
        const profileData = await getProfileByUser(user.id);

        const newProfile: EditableProfile = {
          name: profileData.name || initialDisplayName,
          email: profileData.academic_info?.email || initialEmail,
          roleDescription: formatRole(profileData.role) || roleLabel,
          bio: profileData.description || "",
          location: profileData.academic_info?.campus_location || "",
        };

        setSavedProfile(newProfile);
        setDraftProfile(newProfile);

        setSavedAvatarImage(profileData.profile_photo_url ?? null);
        setDraftAvatarImage(profileData.profile_photo_url ?? null);
        setSavedCoverImage(profileData.cover_photo_url ?? null);
        setDraftCoverImage(profileData.cover_photo_url ?? null);

        setProfileLoaded(true);
      } catch (err) {
        console.error("Erro ao carregar perfil da API:", err);
        setProfileError(err instanceof Error ? err.message : "Erro ao carregar perfil");
        // Keep using initial profile on error
        setProfileLoaded(true);
      }
    }

    loadProfileFromAPI();
  }, [user?.id]);


  function handleDraftChange(field: ProfileFieldName, value: string) {
    setDraftProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAvatarFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraftAvatarImage(dataUrl);
    } catch (error) {
      console.error("Erro ao ler arquivo de avatar:", error);
    }
  }

  async function handleCoverFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraftCoverImage(dataUrl);
    } catch (error) {
      console.error("Erro ao ler arquivo de capa:", error);
    }
  }

  function handleOpenEdit() {
    setSaveError(null);
    setDraftProfile(savedProfile);
    setDraftCoverImage(savedCoverImage);
    setDraftAvatarImage(savedAvatarImage);
    setEditMode(true);
  }

  function handleCancelEdit() {
    setSaveError(null);
    setDraftProfile(savedProfile);
    setDraftCoverImage(savedCoverImage);
    setDraftAvatarImage(savedAvatarImage);
    setEditMode(false);
  }

  useEffect(() => {
    if (user?.id) {
      loadUserPosts();
    }
  }, [user?.id]);

  async function loadUserPosts() {
    if (!user?.id) return;

    setLoadingPosts(true);
    try {
      const posts = await getPostsByUser(user.id);
      setUserPosts(posts);
    } catch (err) {
      console.error("Erro ao carregar postagens:", err);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function handleSaveEdit() {
    setSavingProfile(true);
    setSaveError(null);

    try {
      if (!user?.id) {
        throw new Error("ID do usuário não encontrado");
      }

      // Prepare update payload - only send editable fields
      const updatePayload = {
        name: draftProfile.name,
        description: draftProfile.bio,
        campus_location: draftProfile.location,
        profile_photo_url: draftAvatarImage,
        cover_photo_url: draftCoverImage,
      };

      console.log("Enviando atualização:", { userId: user.id, payload: updatePayload });

      // Call API to update profile
      const result = await updateProfileAPI(user.id, updatePayload);

      console.log("Resposta da API:", result);

      // Refetch profile to confirm changes
      const updatedProfile = await getProfileByUser(user.id);
      console.log("Perfil atualizado do banco:", updatedProfile);

      setSavedProfile(draftProfile);
      setSavedAvatarImage(draftAvatarImage);
      setSavedCoverImage(draftCoverImage);

      try {
        await updateProfile({
          name: draftProfile.name,
          email: draftProfile.email,
          roleDescription: draftProfile.roleDescription,
          bio: draftProfile.bio,
          location: draftProfile.location,
          coverImageUrl: draftCoverImage ?? "",
          avatarUrl: draftAvatarImage ?? "",
        });
      } catch (sessionError) {
        console.warn(
          "Não foi possível sincronizar a sessão após salvar o perfil:",
          sessionError,
        );
      }

      setEditMode(false);
      setSaveFeedbackOpen(true);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o perfil.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f8f3] text-[#222a20]">
      <FeedHeader showSearch={false} />

      {editMode ? (
        <EditProfileScreen
          profile={draftProfile}
          avatarUrl={draftAvatarImage}
          coverUrl={draftCoverImage}
          onChange={handleDraftChange}
          onAvatarFileChange={handleAvatarFileChange}
          onCoverFileChange={handleCoverFileChange}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
          saveError={saveError}
          saving={savingProfile}
        />
      ) : (
        <>
          <ProfileOverview
            profile={savedProfile}
            subtitle={subtitle}
            registration={registration}
            coverImageUrl={savedCoverImage ? resolveBackendImageUrl(savedCoverImage) || savedCoverImage : undefined}
            avatarImageUrl={savedAvatarImage ? resolveBackendImageUrl(savedAvatarImage) || savedAvatarImage : undefined}
            onEdit={handleOpenEdit}
            userPosts={userPosts}
            loadingPosts={loadingPosts}
            onPostUpdated={loadUserPosts}
          />
          <Footer />
        </>
      )}

      {saveFeedbackOpen ? (
        <SaveSuccessModal onClose={() => setSaveFeedbackOpen(false)} />
      ) : null}
    </main>
  );
}

function ProfileOverview({
  profile,
  subtitle,
  registration,
  coverImageUrl,
  avatarImageUrl,
  onEdit,
  userPosts,
  loadingPosts,
  onPostUpdated,
}: {
  profile: EditableProfile;
  subtitle: string;
  registration: string;
  coverImageUrl?: string | null;
  avatarImageUrl?: string | null;
  onEdit: () => void;
  userPosts: PostResponse[];
  loadingPosts: boolean;
  onPostUpdated: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1132px] flex-1 px-4 pb-20 pt-10 sm:px-6 lg:px-1">
      <ProfileHero
        displayName={profile.name}
        subtitle={subtitle}
        bio={profile.bio}
        coverImageUrl={coverImageUrl}
        avatarImageUrl={avatarImageUrl}
        onEdit={onEdit}
      />

      <div className="mt-9 grid gap-9 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-8">
          <BackendSuggestionsCard />
          <AcademicInfoCard
            email={profile.email}
            roleDescription={profile.roleDescription}
            registration={registration}
            location={profile.location}
          />
        </aside>

        <section aria-labelledby="profile-activities-title">
          <h2
            id="profile-activities-title"
            className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]"
          >
            Minhas Atividades
          </h2>

          {loadingPosts ? (
            <div className="mt-5 space-y-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] animate-pulse rounded-[22px] bg-[#e0e5d8]"
                />
              ))}
            </div>
          ) : userPosts.length === 0 ? (
            <div className="mt-5 rounded-[22px] bg-white px-6 py-8 text-center shadow-[0_1px_0_rgba(33,55,30,0.04)]">
              <p className="text-[13px] font-medium text-[#545d50]">
                Você ainda não tem postagens. Comece compartilhando suas ideias no feed!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={onPostUpdated}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProfileHero({
  displayName,
  subtitle,
  bio,
  coverImageUrl,
  avatarImageUrl,
  onEdit,
}: {
  displayName: string;
  subtitle: string;
  bio: string;
  coverImageUrl?: string | null;
  avatarImageUrl?: string | null;
  onEdit: () => void;
}) {
  const coverBackgroundStyle = coverImageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12)), url("${coverImageUrl}")`,
      }
    : {
        backgroundImage: "linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12))",
      };

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div
        className="h-[174px] bg-[#d7e4c6] bg-cover bg-center"
        role="img"
        aria-label="Campo cultivado ao nascer do sol"
        style={coverBackgroundStyle}
      />

      <div className="relative px-6 pb-8 pt-[62px] sm:px-8 lg:px-9">
        <ProfileAvatar name={displayName} imageUrl={avatarImageUrl} />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[620px]">
            <h1 className="text-[30px] font-black leading-tight tracking-[-0.03em] text-[#1e261e]">
              {displayName}
            </h1>
            <p className="mt-1 text-[13px] font-black text-[#287630]">
              {subtitle}
            </p>
            <p className="mt-6 max-w-[590px] text-[12px] font-medium leading-6 text-[#545d50]">
              {bio}
            </p>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-[#95ee9d] px-6 text-[12px] font-black text-[#1f6f2a] shadow-[0_10px_18px_rgba(40,118,48,0.12)] transition-colors hover:bg-[#82e78d]"
          >
            <PencilIcon className="h-[14px] w-[14px]" />
            Editar Perfil
          </button>
        </div>
      </div>
    </section>
  );
}

function EditProfileScreen({
  profile,
  avatarUrl,
  coverUrl,
  onChange,
  onAvatarFileChange,
  onCoverFileChange,
  onCancel,
  onSave,
  saveError,
  saving,
}: {
  profile: EditableProfile;
  avatarUrl: string | null;
  coverUrl: string | null;
  onChange: (field: ProfileFieldName, value: string) => void;
  onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCoverFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  saveError: string | null;
  saving: boolean;
}) {

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-1 flex-col px-4 pb-12 pt-10 sm:px-6 lg:px-1">
      <section aria-labelledby="edit-profile-title">
        <div className="px-0 sm:px-1">
          <h1
            id="edit-profile-title"
            className="text-[30px] font-black leading-tight tracking-[-0.03em] text-[#222a20]"
          >
            Editar Perfil
          </h1>
          <p className="mt-2 text-[13px] font-medium text-[#4f594c]">
            Atualize suas informações básicas.
          </p>
        </div>

        <form
          className="mt-9 rounded-[28px] bg-white px-6 pb-8 pt-8 shadow-[0_22px_50px_rgba(33,55,30,0.08)] sm:px-9 lg:px-10"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <div className="grid gap-x-8 gap-y-7 lg:grid-cols-2">
            <ProfileField
              label="Nome Completo"
              value={profile.name}
              onChange={(value) => onChange("name", value)}
            />

            <ProfileField
              label="Bio / Resumo Profissional"
              value={profile.bio}
              onChange={(value) => onChange("bio", value)}
              multiline
              className="lg:col-span-2"
            />

            <ProfileField
              label="Localização"
              value={profile.location}
              icon={<LocationIcon className="h-[15px] w-[15px]" />}
              onChange={(value) => onChange("location", value)}
              className="lg:col-span-2"
            />
          </div>

          <section className="mt-8 rounded-[18px] bg-[#f7f8f3] p-6 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
            <h3 className="mb-4 text-base font-black text-[#1f6f2a]">
              Fotos de Perfil e Capa
            </h3>
            <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <p className="text-[12px] font-black text-[#4f5b6a]">
                  Selecione arquivos de imagem do seu dispositivo para avatar e capa.
                </p>
              </div>

              <div className="lg:col-span-2">
                <div className="grid gap-4 rounded-[18px] border border-[#d9e0d4] bg-white p-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[18px] border border-[#d9e0d4] p-4">
                      <p className="text-[12px] font-black text-[#4f5b6a]">
                        Avatar selecionado
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-full bg-[#e8f0de]">
                          {avatarUrl ? (
                            <img
                              src={resolveBackendImageUrl(avatarUrl) ?? avatarUrl}
                              alt="Prévia do avatar selecionado"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#4f5b6a]">
                              Nenhuma imagem
                            </div>
                          )}
                        </div>
                        <label className="inline-flex cursor-pointer items-center rounded-full bg-[#eef8ea] px-4 py-2 text-[12px] font-semibold text-[#1f6f2a] transition hover:bg-white">
                          Selecionar arquivo
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={onAvatarFileChange}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#d9e0d4] p-4">
                      <p className="text-[12px] font-black text-[#4f5b6a]">
                        Capa selecionada
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="h-20 min-w-[120px] overflow-hidden rounded-[18px] bg-[#e8f0de]">
                          {coverUrl ? (
                            <img
                              src={resolveBackendImageUrl(coverUrl) ?? coverUrl}
                              alt="Prévia da capa selecionada"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#4f5b6a]">
                              Nenhuma imagem
                            </div>
                          )}
                        </div>
                        <label className="inline-flex cursor-pointer items-center rounded-full bg-[#eef8ea] px-4 py-2 text-[12px] font-semibold text-[#1f6f2a] transition hover:bg-white">
                          Selecionar arquivo
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={onCoverFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                  <div className="lg:col-span-2">
                <div className="rounded-[18px] border border-[#d9e0d4] bg-white p-5">
                  <p className="text-[12px] font-black text-[#4f5b6a]">
                    Apenas imagens carregadas são suportadas.
                  </p>
                  <p className="mt-3 text-[12px] text-[#6b7367]">
                    Selecione arquivos de avatar e capa do seu dispositivo. Links
                    externos não são aceitos neste formulário.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eceee8] pt-6 sm:flex-row sm:items-center sm:justify-end">
            {saveError ? (
              <p className="mr-auto text-[12px] font-semibold text-[#b42318]">
                {saveError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="h-11 rounded-full px-6 text-[12px] font-black text-[#287630] transition-colors hover:bg-[#f2f5ef]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-full bg-[#287630] px-7 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.24)] transition-colors hover:bg-[#1f6428] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </section>

      <p className="mt-10 text-center text-[11px] font-medium text-[#a0a69b]">
        Outros dados como matrícula, curso e departamento são gerenciados pelo SIGA.
      </p>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  type = "text",
  icon,
  multiline = false,
  disabled = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const fieldClasses = `mt-2 w-full border-0 bg-[#e4e4e0] text-[13px] font-medium text-[#262d25] outline-none transition-colors placeholder:text-[#9da49a] focus:bg-[#eeeeea] disabled:bg-[#f1f1ee] disabled:text-[#a0a69b] ${
    icon ? "pl-10 pr-4" : "px-4"
  } ${multiline ? "min-h-[104px] resize-none py-4 leading-6" : "h-11 py-0"}`;

  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-black text-[#3c463b]">{label}</span>
      <span className="relative mt-2 block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#697163]">
            {icon}
          </span>
        ) : null}

        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            disabled={disabled}
            readOnly={!onChange}
            className={fieldClasses}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            disabled={disabled}
            readOnly={!onChange}
            className={fieldClasses}
          />
        )}
      </span>
    </label>
  );
}

function SaveSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173b22]/72 px-4 py-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-success-title"
        className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] bg-[#fffef9] px-8 pb-9 pt-10 text-center shadow-[0_24px_70px_rgba(11,35,17,0.28)]"
      >
        <div className="mx-auto flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#c8ffd0] shadow-[0_0_46px_rgba(149,238,157,0.72)]">
          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#287630] text-white">
            <CheckIcon className="h-[25px] w-[25px]" />
          </span>
        </div>

        <h2
          id="save-success-title"
          className="mx-auto mt-7 max-w-[290px] text-[24px] font-black leading-[1.12] tracking-[-0.03em] text-[#1f6f2a]"
        >
          Alterações salvas com sucesso!
        </h2>

        <p className="mx-auto mt-5 max-w-[300px] text-[13px] font-medium leading-6 text-[#5d6659]">
          Suas informações de perfil foram atualizadas em nossa rede. Agora sua
          jornada no <strong className="font-black text-[#1f6f2a]">Ruralize</strong>{" "}
          está sincronizada com seus novos dados.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 h-14 w-full rounded-full bg-[#287630] text-[13px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.24)] transition-colors hover:bg-[#1f6428]"
        >
          Entendido
        </button>

        <span
          className="pointer-events-none absolute -bottom-6 -right-5 h-20 w-20 rounded-full border-[10px] border-[#dfeedd]"
          aria-hidden="true"
        />
      </section>
    </div>
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
    <div className="absolute left-6 top-[-58px] h-[116px] w-[116px] rounded-full bg-white p-[5px] shadow-[0_14px_28px_rgba(33,55,30,0.18)] sm:left-8 lg:left-9">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[#287630]">
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-black text-white">
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

function EditAvatar({
  name,
  imageUrl,
  onImageChange,
}: {
  name: string;
  imageUrl?: string | null;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="absolute left-6 top-[118px] h-[96px] w-[96px] rounded-[22px] bg-white p-[4px] shadow-[0_16px_28px_rgba(33,55,30,0.2)] sm:left-8 sm:top-[124px] lg:left-9">
      <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-[#287630]">
        <span className="absolute inset-0 flex items-center justify-center text-[23px] font-black text-white">
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
      <label
        className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#eef8ea] text-[#1f6f2a] shadow-[0_8px_18px_rgba(33,55,30,0.16)] ring-4 ring-white transition-colors hover:bg-white"
        title="Alterar foto de perfil"
        aria-label="Alterar foto de perfil"
      >
        <PencilIcon className="h-[14px] w-[14px]" />
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onImageChange}
        />
      </label>
    </div>
  );
}

function AcademicInfoCard({
  email,
  roleDescription,
  registration,
  location,
}: {
  email: string;
  roleDescription: string;
  registration: string;
  location: string;
}) {
  return (
    <section className="rounded-[22px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="flex items-center gap-2 text-[#1e261e]">
        <LeafIcon className="h-[16px] w-[16px] text-[#287630]" />
        <h2 className="text-[15px] font-black tracking-[-0.02em]">
          Informações Acadêmicas
        </h2>
      </div>

      <dl className="mt-7 space-y-6">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Email institucional
          </dt>
          <dd className="mt-2 break-words text-[12px] font-semibold text-[#333b31]">
            {email}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Cargo/Função
          </dt>
          <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
            {roleDescription}
          </dd>
        </div>

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

function ActivityPost({ displayName }: { displayName: string }) {
  return (
    <article className="mt-5 overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <MiniAvatar color="bg-[#205f36]" variant={0} />
            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-black leading-4 text-[#242b23]">
                {displayName}
              </h3>
              <p className="truncate text-[10px] font-semibold leading-3 text-[#8a9186]">
                Postado há 2 horas
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#20281f] transition-colors hover:bg-[#f2f3ee]"
            aria-label="Mais opções da publicação"
          >
            <MoreIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 text-[13px] font-medium leading-6 text-[#30372f]">
          Ainda não há publicações recentes no seu perfil. As atualizações do
          feed estarão disponíveis assim que você começar a usar a plataforma.
        </p>
      </div>

      <div
        className="mt-6 h-[260px] bg-[#d7e6c8] bg-cover bg-center sm:h-[318px]"
        role="img"
        aria-label="Mudas verdes em cultivo"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0), rgba(23, 73, 27, 0.08)), url("${activityImage}")`,
        }}
      />

      <div className="flex h-[64px] items-center gap-7 px-6 text-[#20281f]">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <HeartIcon className="h-[18px] w-[18px]" />
          24
        </span>
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <MessageIcon className="h-[18px] w-[18px]" />8
        </span>
      </div>
    </article>
  );
}

function MiniAvatar({
  color,
  variant,
}: {
  color: string;
  variant: number;
}) {
  return (
    <div
      className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full ${color} ring-2 ring-[#e8efdf]`}
    >
      <span className="absolute left-[11px] top-[7px] h-[10px] w-[15px] rounded-full bg-[#e9b37f]" />
      <span
        className={`absolute top-[13px] h-[9px] rounded-t-full ${
          variant === 0
            ? "left-[8px] w-[24px] bg-[#352a20]"
            : "left-[10px] w-[20px] bg-[#183f42]"
        }`}
      />
      <span className="absolute bottom-0 left-[7px] h-[18px] w-[27px] rounded-t-[16px] bg-[#dfead7]" />
      <span className="absolute bottom-[2px] left-[13px] h-[10px] w-[14px] rounded-t-full bg-[#275f35]" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#eceee8] bg-[#fbfbf7] py-10 text-center">
      <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#b4b9af]">
        <a href="#" className="transition-colors hover:text-[#287630]">
          Sobre
        </a>
        <a href="#" className="transition-colors hover:text-[#287630]">
          Contato
        </a>
        <a href="#" className="transition-colors hover:text-[#287630]">
          UFRPE
        </a>
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c0c5bb]">
        &copy; 2026 Ruralize UFRPE
      </p>
    </footer>
  );
}

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m16.9 4.1 3 3L8 19l-4 1 1-4Z" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  );
}

function LeafIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 8 3 14c0 3 2 5 5 5" />
      <path d="M9 15c2-4 5-6 10-8" />
    </svg>
  );
}

function AtSignIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
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

function readProfileValue(
  raw: Record<string, unknown> | undefined,
  keys: string[],
) {
  if (!raw) {
    return null;
  }

  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function readNameFromEmail(email: string | undefined) {
  if (!email) {
    return null;
  }

  const [namePart] = email.split("@");

  if (!namePart) {
    return null;
  }

  return namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "R";
}

function formatRole(role: string | undefined) {
  if (role === "teacher" || role === "professor") {
    return "Professor";
  }

  return "Estudante";
}

function formatRoleDescription(roleLabel: string) {
  return roleLabel;
}
