import { useAuth } from "./AuthProvider";

export function useAuthenticatedUser() {
  const { user, status, session } = useAuth();

  if (status === "loading") {
    return {
      isReady: false,
      isAuthenticated: false,
      user: null,
      userId: null,
      error: null,
    };
  }

  if (status === "unauthenticated") {
    return {
      isReady: true,
      isAuthenticated: false,
      user: null,
      userId: null,
      error: "Você não está autenticado.",
    };
  }

  if (!user?.id) {
    return {
      isReady: true,
      isAuthenticated: false,
      user: null,
      userId: null,
      error: "ID do usuário não disponível. Tente fazer login novamente.",
    };
  }

  return {
    isReady: true,
    isAuthenticated: true,
    user,
    userId: user.id,
    error: null,
  };
}
