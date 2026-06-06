"use client";

import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export interface ProposalTarget {
  toProfileId: string;
  targetName: string;
}

export function useProposalAction() {
  const { isAuthenticated, openAuthModal, canSendProposal } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<ProposalTarget | null>(null);

  const openProposal = useCallback(
    (params: { profileId?: string | null; targetName: string }) => {
      if (!isAuthenticated) {
        openAuthModal("login");
        return;
      }

      const { allowed, reason } = canSendProposal();
      if (!allowed) {
        if (reason?.includes("upgrade")) {
          router.push("/assinatura");
        } else {
          toast({
            title: "Não foi possível enviar",
            description: reason ?? "Verifique seu perfil ativo",
            variant: "destructive",
          });
        }
        return;
      }

      if (!params.profileId) {
        toast({
          title: "Perfil indisponível",
          description: "Este perfil ainda não pode receber propostas.",
          variant: "destructive",
        });
        return;
      }

      setTarget({ toProfileId: params.profileId, targetName: params.targetName });
      setModalOpen(true);
    },
    [isAuthenticated, openAuthModal, canSendProposal, router],
  );

  const closeProposal = useCallback(() => {
    setModalOpen(false);
    setTarget(null);
  }, []);

  return {
    openProposal,
    modalOpen,
    setModalOpen,
    target,
    closeProposal,
  };
}
