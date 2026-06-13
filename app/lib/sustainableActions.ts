export interface SustainableAction {
  id: string;
  name: string;
  icon: string;
  isDefault: boolean;
  createdBy?: string;
  createdAt?: string;
}

export const DEFAULT_SUSTAINABLE_ACTIONS: SustainableAction[] = [
  {
    id: "tree-planting",
    name: "Plantio de Árvores",
    icon: "🌱",
    isDefault: true,
  },
  {
    id: "recycling",
    name: "Reciclagem",
    icon: "♻️",
    isDefault: true,
  },
  {
    id: "water-conservation",
    name: "Conservação de Água",
    icon: "💧",
    isDefault: true,
  },
  {
    id: "energy-efficiency",
    name: "Eficiência Energética",
    icon: "⚡",
    isDefault: true,
  },
  {
    id: "composting",
    name: "Compostagem",
    icon: "🌿",
    isDefault: true,
  },
  {
    id: "biodiversity",
    name: "Biodiversidade",
    icon: "🦋",
    isDefault: true,
  },
  {
    id: "sustainable-agriculture",
    name: "Agricultura Sustentável",
    icon: "🌾",
    isDefault: true,
  },
  {
    id: "clean-energy",
    name: "Energia Limpa",
    icon: "☀️",
    isDefault: true,
  },
  {
    id: "pollution-reduction",
    name: "Redução de Poluição",
    icon: "🌍",
    isDefault: true,
  },
  {
    id: "education",
    name: "Educação Ambiental",
    icon: "📚",
    isDefault: true,
  },
];

export const LEGACY_ACTION_MAP: Record<string, string> = {
  general: "tree-planting",
  events: "tree-planting",
  warnings: "pollution-reduction",
  projects: "sustainable-agriculture",
};

export function getActionById(id: string): SustainableAction | undefined {
  return DEFAULT_SUSTAINABLE_ACTIONS.find((action) => action.id === id);
}

export function getActionByLegacyName(
  legacyName: string
): SustainableAction | undefined {
  const mappedId = LEGACY_ACTION_MAP[legacyName] || legacyName;
  return getActionById(mappedId);
}

export function getAllActions(): SustainableAction[] {
  return [...DEFAULT_SUSTAINABLE_ACTIONS];
}

export function getActionIcon(actionId: string): string {
  if (!actionId || actionId === "general") {
    return "🌍";
  }
  return getActionById(actionId)?.icon || "🌍";
}

export function getActionName(actionId: string): string {
  if (!actionId || actionId === "general") {
    return "Sem ação";
  }
  return getActionById(actionId)?.name || actionId;
}
