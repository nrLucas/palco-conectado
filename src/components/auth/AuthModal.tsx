import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Informe seu nome"),
});

type SignupValues = z.infer<typeof signupSchema>;

export function AuthModal({
  open,
  onOpenChange,
  mode,
  onModeChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "login" | "signup";
  onModeChange: (m: "login" | "signup") => void;
}) {
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });
  const { login, signup } = useAuth();

  const onLogin = (data: LoginValues) => {
    const success = login(data.email, data.password);
    if (success) {
      onOpenChange(false);
      loginForm.reset();
    }
  };
  
  const onSignup = (data: SignupValues) => {
    const success = signup(data.email, data.password, data.name);
    if (success) {
      onOpenChange(false);
      signupForm.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acesse o PalcoMatch</DialogTitle>
          <DialogDescription>Continue para negociar e reservar shows.</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => onModeChange(v as any)} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@email.com" {...loginForm.register("email")} />
                {loginForm.formState.errors.email && (
                  <p className="text-destructive text-sm">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...loginForm.register("password")} />
                {loginForm.formState.errors.password && (
                  <p className="text-destructive text-sm">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" variant="hero">Entrar</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...signupForm.register("name")} />
                {signupForm.formState.errors.name && (
                  <p className="text-destructive text-sm">{signupForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">E-mail</Label>
                <Input id="email2" type="email" {...signupForm.register("email")} />
                {signupForm.formState.errors.email && (
                  <p className="text-destructive text-sm">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">Senha</Label>
                <Input id="password2" type="password" {...signupForm.register("password")} />
                {signupForm.formState.errors.password && (
                  <p className="text-destructive text-sm">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" variant="hero">Criar conta</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
