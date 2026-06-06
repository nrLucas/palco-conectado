import { apiFetch } from "./client";
import type { UserAccount, UserProfile } from "@/lib/types";

export interface MeResponse extends UserAccount {
  activeProfile: UserProfile | null;
  activeEntity: Record<string, unknown> | null;
}

export function fetchMe() {
  return apiFetch<MeResponse>("/api/me");
}

export function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  return apiFetch<{ id: string; email: string; name: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function switchActiveProfile(profileId: string) {
  return apiFetch<{ activeProfileId: string }>("/api/profiles/active", {
    method: "PATCH",
    body: JSON.stringify({ profileId }),
  });
}

export function createProfile(data: Record<string, unknown>) {
  return apiFetch<UserProfile>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteProfile(id: string) {
  return apiFetch<{ success: boolean }>(`/api/profiles/${id}`, {
    method: "DELETE",
  });
}

export function requestPasswordReset(email: string) {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(data: {
  email: string;
  token: string;
  password: string;
}) {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
