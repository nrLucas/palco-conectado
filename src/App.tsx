import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SiteHeader } from "./components/layout/SiteHeader";
import { AuthProvider } from "./components/auth/AuthContext";
import Bandas from "./pages/Bandas";
import Locais from "./pages/Locais";
import BandaPerfil from "./pages/BandaPerfil";
import LocalPerfil from "./pages/LocalPerfil";
import Subscription from "./pages/Subscription";
import { Profile } from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bandas" element={<Bandas />} />
            <Route path="/estabelecimentos" element={<Locais />} />
            <Route path="/banda/:id" element={<BandaPerfil />} />
            <Route path="/estabelecimento/:id" element={<LocalPerfil />} />
            <Route path="/assinatura" element={<Subscription />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
