import { Check, Star } from 'lucide-react';
import { Button, Card } from '@heroui/react';

const plans = [
  {
    name: 'Básico',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Ideal para bandas iniciantes',
    features: [
      'Perfil básico no sistema',
      '2 propostas grátis por mês',
      'Aparece na busca geral',
      'Suporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 69,90',
    period: '/mês',
    description: 'Para bandas que querem mais visibilidade',
    features: [
      'Perfil destacado',
      '10 propostas por mês',
      'Prioridade na busca',
      'Analytics de performance',
      'Suporte prioritário',
      'Badge de verificação',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'R$ 129,90',
    period: '/mês',
    description: 'Máxima visibilidade e recursos',
    features: [
      'Perfil premium',
      'Propostas ilimitadas',
      'Topo da busca garantido',
      'Analytics avançados',
      'Suporte 24/7',
      'Badge premium',
      'Promoção em eventos especiais',
      'Acesso antecipado a recursos',
    ],
    highlighted: false,
  },
];

export const SubscriptionPlans = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-default/30 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Aumente sua visibilidade e conecte-se com mais estabelecimentos. Quanto maior o plano,
            melhor sua posição na busca!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all duration-200 shadow-surface hover:shadow-overlay ${
                plan.highlighted ? 'border-accent shadow-overlay md:scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              <Card.Header className="text-center pb-2">
                <Card.Title className="text-2xl font-display">{plan.name}</Card.Title>
                <Card.Description>{plan.description}</Card.Description>
                <div className="mt-4">
                  <span className="text-4xl font-bold font-display">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
              </Card.Header>

              <Card.Content className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className={`w-full ${plan.highlighted ? 'button--hero' : ''}`} variant={plan.highlighted ? 'primary' : 'outline'}>
                  {plan.highlighted ? 'Escolher Plano' : 'Selecionar'}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted">
            Todos os planos incluem período de teste gratuito de 7 dias. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};
