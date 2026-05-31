import type { AuthUser, ProfileUpdatePayload } from "../../lib/auth";

type ProfileRequestBody = {
  profile?: Partial<ProfileUpdatePayload>;
  user?: AuthUser | null;
};

type StoredProfile = ProfileUpdatePayload & {
  updatedAt: string;
};

const globalProfileStore = globalThis as typeof globalThis & {
  __ruralizeProfileStore?: Map<string, StoredProfile>;
};

const profileStore =
  globalProfileStore.__ruralizeProfileStore ??
  new Map<string, StoredProfile>();

globalProfileStore.__ruralizeProfileStore = profileStore;

export async function PATCH(request: Request) {
  const token = readBearerToken(request);

  if (!token) {
    return Response.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | ProfileRequestBody
    | null;
  const profile = body?.profile;

  if (!isProfilePayload(profile)) {
    return Response.json(
      { message: "Dados de perfil inválidos." },
      { status: 400 },
    );
  }

  const storedProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  profileStore.set(token, storedProfile);

  const nextUser: AuthUser = {
    ...(body?.user ?? {}),
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    raw: {
      ...(body?.user?.raw ?? {}),
      name: profile.name,
      email: profile.email,
      roleDescription: profile.roleDescription,
      bio: profile.bio,
      location: profile.location,
      coverImageUrl: profile.coverImageUrl,
      avatarUrl: profile.avatarUrl,
      updatedAt: storedProfile.updatedAt,
    },
  };

  return Response.json({
    user: nextUser,
    profile: storedProfile,
  });
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

function isProfilePayload(
  profile: ProfileRequestBody["profile"],
): profile is ProfileUpdatePayload {
  return Boolean(
    profile &&
      isNonEmptyString(profile.name) &&
      isNonEmptyString(profile.email) &&
      typeof profile.roleDescription === "string" &&
      typeof profile.bio === "string" &&
      typeof profile.location === "string" &&
      typeof profile.coverImageUrl === "string" &&
      typeof profile.avatarUrl === "string",
  );
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}
