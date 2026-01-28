'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import type { Band, Establishment, Musician, ProfileType } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Guitar,
    Loader2,
    Music2
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// =============================================================================
// SCHEMAS
// =============================================================================

const musicianFormSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  instruments: z.string().min(2, 'Informe seus instrumentos'),
  genres: z.string().min(2, 'Informe os gêneros'),
  experience: z.enum(['iniciante', 'intermediario', 'profissional']),
  location: z.string().min(3, 'Localização é obrigatória'),
  bio: z.string().max(500).optional(),
  availability: z.enum(['disponivel', 'ocupado', 'parcial']),
  lookingFor: z.enum(['banda', 'freelance', 'ambos']),
});

const bandFormSchema = z.object({
  name: z.string().min(2, 'Nome da banda é obrigatório'),
  genre: z.string().min(2, 'Gênero é obrigatório'),
  description: z.string().max(1000).optional(),
  location: z.string().min(3, 'Localização é obrigatória'),
  members: z.number().min(1, 'Mínimo de 1 membro'),
  priceRange: z.string().optional(),
});

const establishmentFormSchema = z.object({
  name: z.string().min(2, 'Nome do estabelecimento é obrigatório'),
  type: z.string().min(2, 'Tipo é obrigatório'),
  description: z.string().max(1000).optional(),
  location: z.string().min(3, 'Localização é obrigatória'),
  capacity: z.number().min(1, 'Capacidade mínima de 1'),
  averageBudget: z.string().optional(),
});

type MusicianFormData = z.infer<typeof musicianFormSchema>;
type BandFormData = z.infer<typeof bandFormSchema>;
type EstablishmentFormData = z.infer<typeof establishmentFormSchema>;

// =============================================================================
// CONSTANTS
// =============================================================================

const ROLE_OPTIONS = [
  {
    type: 'artista_independente' as ProfileType,
    icon: Guitar,
    title: 'Artista Independente',
    description: 'Você é músico e busca oportunidades solo ou em bandas',
    color: 'from-violet-500/20 to-purple-500/5',
    borderColor: 'border-violet-500/50',
    iconColor: 'text-violet-500',
  },
  {
    type: 'banda' as ProfileType,
    icon: Music2,
    title: 'Banda',
    description: 'Sua banda busca shows em bares, restaurantes e eventos',
    color: 'from-amber-500/20 to-orange-500/5',
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-500',
  },
  {
    type: 'contratante' as ProfileType,
    icon: Building2,
    title: 'Contratante',
    description: 'Você possui bar, restaurante ou espaço para eventos',
    color: 'from-emerald-500/20 to-teal-500/5',
    borderColor: 'border-emerald-500/50',
    iconColor: 'text-emerald-500',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function OnboardingWizard() {
  const { account, needsOnboarding, addProfile, completeOnboarding } = useAuth();
  const [step, setStep] = useState<'role' | 'form' | 'complete'>('role');
  const [selectedRole, setSelectedRole] = useState<ProfileType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms for each profile type
  const musicianForm = useForm<MusicianFormData>({
    resolver: zodResolver(musicianFormSchema),
    defaultValues: {
      name: account?.name || '',
      instruments: '',
      genres: '',
      experience: 'intermediario',
      location: '',
      bio: '',
      availability: 'disponivel',
      lookingFor: 'ambos',
    },
  });

  const bandForm = useForm<BandFormData>({
    resolver: zodResolver(bandFormSchema),
    defaultValues: {
      name: '',
      genre: '',
      description: '',
      location: '',
      members: 4,
      priceRange: '',
    },
  });

  const establishmentForm = useForm<EstablishmentFormData>({
    resolver: zodResolver(establishmentFormSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      location: '',
      capacity: 50,
      averageBudget: '',
    },
  });

  if (!needsOnboarding) return null;

  const handleRoleSelect = (role: ProfileType) => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
  };

  const handleMusicianSubmit = async (data: MusicianFormData) => {
    if (!account) return;
    setIsSubmitting(true);

    try {
      const musician: Musician = {
        id: `musician-${Date.now()}`,
        userId: account.id,
        name: data.name,
        instruments: data.instruments.split(',').map(i => i.trim()),
        genres: data.genres.split(',').map(g => g.trim()),
        experience: data.experience,
        location: data.location,
        bio: data.bio || '',
        availability: data.availability,
        lookingFor: data.lookingFor,
        rating: 5.0,
        totalGigs: 0,
        createdAt: new Date().toISOString(),
      };

      storage.saveMusician(musician);
      addProfile('artista_independente', musician.id, 'owner');
      setStep('complete');

      toast({
        title: 'Perfil criado!',
        description: 'Seu perfil de artista foi criado com sucesso.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBandSubmit = async (data: BandFormData) => {
    if (!account) return;
    setIsSubmitting(true);

    try {
      const band: Band = {
        id: `band-${Date.now()}`,
        userId: account.id,
        name: data.name,
        genre: data.genre,
        description: data.description || '',
        location: data.location,
        members: data.members,
        priceRange: data.priceRange || '',
        rating: 5.0,
        totalShows: 0,
        createdAt: new Date().toISOString(),
      };

      storage.saveBand(band);
      addProfile('banda', band.id, 'owner');
      setStep('complete');

      toast({
        title: 'Banda criada!',
        description: 'O perfil da sua banda foi criado com sucesso.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstablishmentSubmit = async (data: EstablishmentFormData) => {
    if (!account) return;
    setIsSubmitting(true);

    try {
      const establishment: Establishment = {
        id: `est-${Date.now()}`,
        userId: account.id,
        name: data.name,
        type: data.type,
        description: data.description || '',
        location: data.location,
        capacity: data.capacity,
        averageBudget: data.averageBudget || '',
        rating: 5.0,
        totalEvents: 0,
        createdAt: new Date().toISOString(),
      };

      storage.saveEstablishment(establishment);
      addProfile('contratante', establishment.id, 'owner');
      setStep('complete');

      toast({
        title: 'Estabelecimento criado!',
        description: 'O perfil do seu estabelecimento foi criado com sucesso.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <Dialog open={needsOnboarding} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg md:max-w-xl overflow-hidden" hideCloseButton>
        {/* Gradient Top Border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-2xl">
                  Bem-vindo(a), {account?.name}! 🎉
                </DialogTitle>
                <DialogDescription>
                  Como você vai usar o PalcoMatch?
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 pt-2">
                {ROLE_OPTIONS.map((role) => (
                  <Card
                    key={role.type}
                    className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br ${role.color} ${role.borderColor}`}
                    onClick={() => handleRoleSelect(role.type)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`p-3 rounded-full bg-background/80 ${role.iconColor}`}>
                        <role.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Você poderá adicionar mais perfis depois
              </p>
            </motion.div>
          )}

          {/* Step 2: Profile Form */}
          {step === 'form' && selectedRole && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit -ml-2 mb-2"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
                <DialogTitle>
                  {selectedRole === 'artista_independente' && 'Configure seu perfil de Artista'}
                  {selectedRole === 'banda' && 'Configure sua Banda'}
                  {selectedRole === 'contratante' && 'Configure seu Estabelecimento'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações básicas
                </DialogDescription>
              </DialogHeader>

              {/* Musician Form */}
              {selectedRole === 'artista_independente' && (
                <form onSubmit={musicianForm.handleSubmit(handleMusicianSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="musician-name">Nome artístico</Label>
                    <Input id="musician-name" {...musicianForm.register('name')} />
                    {musicianForm.formState.errors.name && (
                      <p className="text-destructive text-sm">{musicianForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="instruments">Instrumentos</Label>
                      <Input
                        id="instruments"
                        placeholder="Guitarra, Baixo..."
                        {...musicianForm.register('instruments')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genres">Gêneros</Label>
                      <Input
                        id="genres"
                        placeholder="Rock, Jazz..."
                        {...musicianForm.register('genres')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Experiência</Label>
                      <Select
                        value={musicianForm.watch('experience')}
                        onValueChange={(v) => musicianForm.setValue('experience', v as 'iniciante' | 'intermediario' | 'profissional')}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iniciante">Iniciante</SelectItem>
                          <SelectItem value="intermediario">Intermediário</SelectItem>
                          <SelectItem value="profissional">Profissional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Busco</Label>
                      <Select
                        value={musicianForm.watch('lookingFor')}
                        onValueChange={(v) => musicianForm.setValue('lookingFor', v as 'banda' | 'freelance' | 'ambos')}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banda">Banda fixa</SelectItem>
                          <SelectItem value="freelance">Freelances</SelectItem>
                          <SelectItem value="ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input id="location" placeholder="São Paulo, SP" {...musicianForm.register('location')} />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Criar perfil
                  </Button>
                </form>
              )}

              {/* Band Form */}
              {selectedRole === 'banda' && (
                <form onSubmit={bandForm.handleSubmit(handleBandSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="band-name">Nome da banda</Label>
                    <Input id="band-name" {...bandForm.register('name')} />
                    {bandForm.formState.errors.name && (
                      <p className="text-destructive text-sm">{bandForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="genre">Gênero principal</Label>
                      <Input id="genre" placeholder="Rock, MPB..." {...bandForm.register('genre')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="members">Membros</Label>
                      <Input
                        id="members"
                        type="number"
                        min={1}
                        {...bandForm.register('members', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="band-location">Localização</Label>
                    <Input id="band-location" placeholder="São Paulo, SP" {...bandForm.register('location')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceRange">Faixa de preço</Label>
                    <Input id="priceRange" placeholder="R$ 1.000 - R$ 3.000" {...bandForm.register('priceRange')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="band-description">Descrição</Label>
                    <Textarea id="band-description" rows={2} {...bandForm.register('description')} />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Criar banda
                  </Button>
                </form>
              )}

              {/* Establishment Form */}
              {selectedRole === 'contratante' && (
                <form onSubmit={establishmentForm.handleSubmit(handleEstablishmentSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="est-name">Nome do estabelecimento</Label>
                    <Input id="est-name" {...establishmentForm.register('name')} />
                    {establishmentForm.formState.errors.name && (
                      <p className="text-destructive text-sm">{establishmentForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={establishmentForm.watch('type')}
                        onValueChange={(v) => establishmentForm.setValue('type', v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="restaurante">Restaurante</SelectItem>
                          <SelectItem value="casa-de-show">Casa de Show</SelectItem>
                          <SelectItem value="cafe">Café</SelectItem>
                          <SelectItem value="centro-cultural">Centro Cultural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min={1}
                        {...establishmentForm.register('capacity', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="est-location">Localização</Label>
                    <Input id="est-location" placeholder="Vila Madalena, São Paulo" {...establishmentForm.register('location')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="averageBudget">Orçamento médio</Label>
                    <Input id="averageBudget" placeholder="R$ 1.000 - R$ 5.000" {...establishmentForm.register('averageBudget')} />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Criar estabelecimento
                  </Button>
                </form>
              )}
            </motion.div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              
              <DialogTitle className="text-2xl mb-2">Tudo pronto! 🎉</DialogTitle>
              <DialogDescription className="mb-6">
                Seu perfil foi criado com sucesso. Agora você pode explorar o PalcoMatch
                e começar a fazer conexões.
              </DialogDescription>

              <Button onClick={handleComplete} size="lg" className="gap-2">
                Começar a explorar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
