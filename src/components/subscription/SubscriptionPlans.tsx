import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Básico",
    price: "R$ 29,90",
    period: "/mês",
    description: "Ideal para bandas iniciantes",
    features: [
      "Perfil básico no sistema",
      "2 propostas grátis por mês",
      "Aparece na busca geral",
      "Suporte por email"
    ],
    highlighted: false
  },
  {
    name: "Profissional",
    price: "R$ 69,90",
    period: "/mês",
    description: "Para bandas que querem mais visibilidade",
    features: [
      "Perfil destacado",
      "10 propostas por mês",
      "Prioridade na busca",
      "Analytics de performance",
      "Suporte prioritário",
      "Badge de verificação"
    ],
    highlighted: true
  },
  {
    name: "Premium",
    price: "R$ 129,90",
    period: "/mês",
    description: "Máxima visibilidade e recursos",
    features: [
      "Perfil premium",
      "Propostas ilimitadas",
      "Topo da busca garantido",
      "Analytics avançados",
      "Suporte 24/7",
      "Badge premium",
      "Promoção em eventos especiais",
      "Acesso antecipado a recursos"
    ],
    highlighted: false
  }
];

export const SubscriptionPlans = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aumente sua visibilidade e conecte-se com mais estabelecimentos. 
            Quanto maior o plano, melhor sua posição na busca!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.highlighted 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.highlighted ? "Escolher Plano" : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem período de teste gratuito de 7 dias.
            Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};