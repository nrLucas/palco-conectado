import type { ProfileType } from "@/lib/types";

export function getProfilePath(type: string, entityId: string): string | null {
  switch (type as ProfileType) {
    case "banda":
      return `/banda/${entityId}`;
    case "contratante":
      return `/estabelecimento/${entityId}`;
    case "artista_independente":
      return `/musicos`;
    default:
      return null;
  }
}

export function getProfileTypeLabel(type: string): string {
  switch (type) {
    case "banda":
      return "Banda";
    case "contratante":
      return "Estabelecimento";
    case "artista_independente":
      return "Músico";
    default:
      return "Perfil";
  }
}
