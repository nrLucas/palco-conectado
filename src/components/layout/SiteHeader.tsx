import { NavLink } from "react-router-dom";
import { Music2, Building2, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/AuthContext";

export const SiteHeader = () => {
  const { openAuth, requireAuth } = useAuth();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-primary" : "text-foreground/80 hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold">PalcoMatch</span>
        </NavLink>

        <div className="flex items-center gap-6">
          <NavLink to="/bandas" className={navCls}>
            <span className="inline-flex items-center gap-2"><Music2 className="h-4 w-4" /> Bandas</span>
          </NavLink>
          <NavLink to="/bares" className={navCls}>
            <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> Bares</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => openAuth('login')}>
            <LogIn className="mr-2" /> Entrar
          </Button>
          <Button variant="hero" onClick={() => requireAuth('criar-vaga')}>
            Criar vaga
          </Button>
        </div>
      </nav>
    </header>
  );
};
