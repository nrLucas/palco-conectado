import { apiFetch } from "./client";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "proposal_received" | "proposal_accepted" | "proposal_rejected";
  title: string;
  body: string;
  read: boolean;
  proposalId: string | null;
  createdAt: string;
}

export function fetchNotifications(unreadOnly = false) {
  return apiFetch<{
    notifications: NotificationItem[];
    unreadCount: number;
  }>(`/api/notifications${unreadOnly ? "?unread=true" : ""}`);
}

export function markNotificationRead(id: string) {
  return apiFetch<NotificationItem>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead() {
  return apiFetch<{ success: boolean }>("/api/notifications/read-all", {
    method: "PATCH",
  });
}
