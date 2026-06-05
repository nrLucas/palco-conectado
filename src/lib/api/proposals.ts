import { apiFetch } from "./client";

export interface ProposalResponse {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  fromUserId: string;
  toUserId: string;
  eventDate: string;
  message: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  fromProfile?: { id: string; type: string; entityId: string };
  toProfile?: { id: string; type: string; entityId: string };
}

export function fetchProposals(direction: "sent" | "received" = "received") {
  return apiFetch<ProposalResponse[]>(
    `/api/proposals?direction=${direction}`
  );
}

export function createProposal(data: {
  toProfileId: string;
  eventDate: string;
  message: string;
  amount: number;
}) {
  return apiFetch<ProposalResponse>("/api/proposals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProposalStatus(
  id: string,
  status: "accepted" | "rejected"
) {
  return apiFetch<ProposalResponse>(`/api/proposals/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function cancelProposal(id: string) {
  return apiFetch<{ success: boolean }>(`/api/proposals/${id}`, {
    method: "DELETE",
  });
}
