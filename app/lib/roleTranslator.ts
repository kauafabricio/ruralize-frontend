export function translateRole(role: string | undefined): string {
  if (role === "teacher" || role === "professor") {
    return "Professor";
  }
  if (role === "student" || role === "estudante") {
    return "Estudante";
  }
  return role || "Usuário";
}
