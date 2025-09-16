import { NavLink } from "react-router-dom";
import { Music2, Building2, LogIn, LogOut, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "../auth/AuthContext";

export const SiteHeader = () => {
  const { openAuth, requireAuth, isAuthenticated, currentUser, logout } = useAuth();

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
          <NavLink to="/estabelecimentos" className={navCls}>
            <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> Estabelecimentos</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Settings className="mr-2 h-4 w-4" />
                    {currentUser?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <NavLink to="/profile" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" onClick={() => openAuth('login')}>
              <LogIn className="mr-2 h-4 w-4" /> Entrar
            </Button>
          )}
          
          <Button variant="hero" onClick={() => requireAuth('criar-evento')}>
            Criar Evento
          </Button>
        </div>
      </nav>
    </header>
  );
};
