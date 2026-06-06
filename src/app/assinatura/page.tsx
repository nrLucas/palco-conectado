'use client';

import { Button, Card } from '@heroui/react';
import { toast } from '@/hooks/use-toast';
import { Check, Star } from 'lucide-react';

export default function SubscriptionPage() {
  const handleSubscribe = (plan: string) => {
    toast({
      title: 'Plano selecionado',
      description: `Você selecionou o plano ${plan}. Redirecionando para pagamento...`,
    });
  };

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      description: 'Para quem está começando',
      features: ['Perfil básico', '2 propostas por mês', 'Busca de shows'],
      buttonText: 'Atual',
      disabled: true,
    },
    {
      name: 'Profissional',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Para bandas e músicos ativos',
      features: [
        'Perfil destacado',
        '10 propostas por mês',
        'Ver quem visitou seu perfil',
        'Suporte prioritário',
      ],
      buttonText: 'Assinar Profissional',
      popular: true,
    },
    {
      name: 'Premium',
      price: 'R$ 59,90',
      period: '/mês',
      description: 'Para quem toca todo fim de semana',
      features: [
        'Perfil verificado',
        'Propostas ilimitadas',
        'Destaque na busca',
        'Gestão de agenda completa',
      ],
      buttonText: 'Assinar Premium',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold mb-4">Escolha seu plano</h1>
        <p className="text-xl text-muted">Desbloqueie todo o potencial da sua carreira musical</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col shadow-surface ${
              plan.popular ? 'border-accent shadow-overlay md:scale-105 z-10' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 text-center">
                <span className="bg-accent text-accent-foreground text-sm font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Mais Popular
                </span>
              </div>
            )}
            <Card.Header>
              <Card.Title className="text-2xl font-display">{plan.name}</Card.Title>
              <Card.Description>{plan.description}</Card.Description>
            </Card.Header>
            <Card.Content className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold font-display">{plan.price}</span>
                {plan.period && <span className="text-muted">{plan.period}</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card.Content>
            <Card.Footer>
              <Button
                className={`w-full ${plan.popular ? 'button--hero' : ''}`}
                variant={plan.popular ? 'primary' : 'outline'}
                isDisabled={plan.disabled}
                onPress={() => handleSubscribe(plan.name)}
              >
                {plan.buttonText}
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}
