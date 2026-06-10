import type { LucideIcon } from "lucide-react";
import { Layout, Palette, Server, Sparkles } from "lucide-react";
import type { PersonaId } from "../../../shared";
import type { Role } from "../../types/role";

const ROLE_ICON_MAP: Record<PersonaId, LucideIcon> = {
  frontend: Layout,
  backend: Server,
  uiux: Palette,
  general: Sparkles,
};

export function iconForRole(role: Role): LucideIcon {
  if (role.source === "builtin" && role.id in ROLE_ICON_MAP) {
    return ROLE_ICON_MAP[role.id as PersonaId];
  }

  return Sparkles;
}
