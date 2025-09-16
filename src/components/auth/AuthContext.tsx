import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { AuthModal } from "./AuthModal";
import { mockDataManager, User } from "@/lib/mockData";

type Mode = "login" | "signup";

interface AuthContextValue {
  isAuthenticated: boolean;
  currentUser: User | null;
  openAuth: (mode?: Mode) => void;
  requireAuth: (actionName?: string) => void;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  canSendProposal: () => { canSend: boolean; reason?: string };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const user = mockDataManager.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const openAuth = (m: Mode = "login") => {
    setMode(m);
    setOpen(true);
  };

  const login = (email: string, password: string): boolean => {
    const users = mockDataManager.getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      mockDataManager.setCurrentUser(user);
      setCurrentUser(user);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${user.name}`,
      });
      return true;
    }
    
    toast({
      title: "Erro no login",
      description: "Email ou senha incorretos",
      variant: "destructive"
    });
    return false;
  };

  const signup = (email: string, password: string, name: string): boolean => {
    const users = mockDataManager.getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      toast({
        title: "Erro no cadastro",
        description: "Este email já está em uso",
        variant: "destructive"
      });
      return false;
    }
    
    const newUser = mockDataManager.createUser(email, password, name);
    mockDataManager.setCurrentUser(newUser);
    setCurrentUser(newUser);
    
    toast({
      title: "Cadastro realizado com sucesso!",
      description: `Bem-vindo(a), ${newUser.name}`,
    });
    return true;
  };

  const logout = () => {
    mockDataManager.setCurrentUser(null);
    setCurrentUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const canSendProposal = () => {
    if (!currentUser) {
      return { canSend: false, reason: "Faça login para enviar propostas" };
    }

    const proposalsUsed = currentUser.proposalsUsed || 0;
    const proposalsLimit = currentUser.proposalsLimit || 2;

    if (proposalsUsed >= proposalsLimit) {
      return { canSend: false, reason: "Limite de propostas atingido. Faça upgrade do seu plano!" };
    }

    return { canSend: true };
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
      return false;
    }
    return true;
  };

  const value = useMemo(
    () => ({ 
      isAuthenticated, 
      currentUser, 
      openAuth, 
      requireAuth, 
      login, 
      signup, 
      logout, 
      canSendProposal 
    }),
    [isAuthenticated, currentUser]
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
