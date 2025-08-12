import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AuthModal } from "./AuthModal";

type Mode = "login" | "signup";

interface AuthContextValue {
  isAuthenticated: boolean;
  openAuth: (mode?: Mode) => void;
  requireAuth: (actionName?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated] = useState(false); // aguardando Supabase
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const openAuth = (m: Mode = "login") => {
    setMode(m);
    setOpen(true);
  };

  const requireAuth = (actionName?: string) => {
    if (!isAuthenticated) {
      if (actionName) {
        toast({
          title: "Faça login para continuar",
          description: `Ação protegida: ${actionName}`,
        });
      }
      openAuth("login");
    }
  };

  const value = useMemo(
    () => ({ isAuthenticated, openAuth, requireAuth }),
    [isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} mode={mode} onModeChange={setMode} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
