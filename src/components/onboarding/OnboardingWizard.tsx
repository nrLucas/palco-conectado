'use client';

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
  TextField,
} from '@heroui/react';
import { toast } from '@/hooks/use-toast';
import { createProfile } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth';
import type { ProfileType } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Guitar,
  Loader2,
  Music2,
} from 'lucide-react';
import { useState } from 'react';
import type { Key } from 'react';
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
  const { account, needsOnboarding, completeOnboarding } = useAuth();
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
      await createProfile({
        type: 'artista_independente',
        musician: {
          name: data.name,
          instruments: data.instruments.split(',').map((i) => i.trim()),
          genres: data.genres.split(',').map((g) => g.trim()),
          experience: data.experience,
          location: data.location,
          bio: data.bio || '',
          availability: data.availability,
          lookingFor: data.lookingFor,
        },
      });
      setStep('complete');
      toast({
        title: 'Perfil criado!',
        description: 'Seu perfil de artista foi criado com sucesso.',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o perfil',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBandSubmit = async (data: BandFormData) => {
    if (!account) return;
    setIsSubmitting(true);

    try {
      await createProfile({
        type: 'banda',
        band: {
          name: data.name,
          genre: data.genre,
          description: data.description || '',
          location: data.location,
          members: data.members,
          priceRange: data.priceRange || '',
        },
      });
      setStep('complete');
      toast({
        title: 'Banda criada!',
        description: 'O perfil da sua banda foi criado com sucesso.',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a banda',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstablishmentSubmit = async (data: EstablishmentFormData) => {
    if (!account) return;
    setIsSubmitting(true);

    try {
      await createProfile({
        type: 'contratante',
        establishment: {
          name: data.name,
          type: data.type,
          description: data.description || '',
          location: data.location,
          capacity: data.capacity,
          averageBudget: data.averageBudget || '',
        },
      });
      setStep('complete');
      toast({
        title: 'Estabelecimento criado!',
        description: 'O perfil do seu estabelecimento foi criado com sucesso.',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o estabelecimento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <Modal.Backdrop isOpen={needsOnboarding} onOpenChange={() => {}}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg md:max-w-xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-accent via-accent/80 to-accent/40" />

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
                <Modal.Header className="flex flex-col items-center text-center pb-4">
                  <Modal.Heading className="text-2xl">
                    Bem-vindo(a), {account?.name}! 🎉
                  </Modal.Heading>
                  <p className="text-sm text-muted mt-1">
                    Como você vai usar o PalcoMatch?
                  </p>
                </Modal.Header>

                <Modal.Body>
                  <div className="grid gap-3 pt-2">
                    {ROLE_OPTIONS.map((role) => (
                      <Button
                        key={role.type}
                        variant="ghost"
                        className="h-auto w-full p-0"
                        onPress={() => handleRoleSelect(role.type)}
                      >
                        <Card
                          className={`w-full cursor-pointer border bg-surface shadow-none ${role.borderColor}`}
                        >
                          <Card.Content className="flex items-center gap-4 p-4">
                            <div className={`p-3 rounded-full bg-background/80 ${role.iconColor}`}>
                              <role.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold">{role.title}</h3>
                              <p className="text-sm text-muted">{role.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted" />
                          </Card.Content>
                        </Card>
                      </Button>
                    ))}
                  </div>

                  <p className="text-xs text-muted text-center mt-4">
                    Você poderá adicionar mais perfis depois
                  </p>
                </Modal.Body>
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
                <Modal.Header className="pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit -ml-2 mb-2"
                    onPress={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                  </Button>
                  <Modal.Heading>
                    {selectedRole === 'artista_independente' && 'Configure seu perfil de Artista'}
                    {selectedRole === 'banda' && 'Configure sua Banda'}
                    {selectedRole === 'contratante' && 'Configure seu Estabelecimento'}
                  </Modal.Heading>
                  <p className="text-sm text-muted mt-1">
                    Preencha as informações básicas
                  </p>
                </Modal.Header>

                <Modal.Body>
                  {/* Musician Form */}
                  {selectedRole === 'artista_independente' && (
                    <form onSubmit={musicianForm.handleSubmit(handleMusicianSubmit)} className="space-y-4">
                      <TextField isInvalid={!!musicianForm.formState.errors.name}>
                        <Label htmlFor="musician-name">Nome artístico</Label>
                        <Input id="musician-name" {...musicianForm.register('name')} />
                        {musicianForm.formState.errors.name && (
                          <FieldError>{musicianForm.formState.errors.name.message}</FieldError>
                        )}
                      </TextField>

                      <div className="grid grid-cols-2 gap-3">
                        <TextField>
                          <Label htmlFor="instruments">Instrumentos</Label>
                          <Input
                            id="instruments"
                            placeholder="Guitarra, Baixo..."
                            {...musicianForm.register('instruments')}
                          />
                        </TextField>
                        <TextField>
                          <Label htmlFor="genres">Gêneros</Label>
                          <Input
                            id="genres"
                            placeholder="Rock, Jazz..."
                            {...musicianForm.register('genres')}
                          />
                        </TextField>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={musicianForm.watch('experience')}
                          onChange={(key: Key | Key[] | null) =>
                            musicianForm.setValue(
                              'experience',
                              String(key) as 'iniciante' | 'intermediario' | 'profissional',
                            )
                          }
                        >
                          <Label>Experiência</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="iniciante" textValue="Iniciante">
                                Iniciante
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="intermediario" textValue="Intermediário">
                                Intermediário
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="profissional" textValue="Profissional">
                                Profissional
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                        </Select>
                        <Select
                          value={musicianForm.watch('lookingFor')}
                          onChange={(key: Key | Key[] | null) =>
                            musicianForm.setValue(
                              'lookingFor',
                              String(key) as 'banda' | 'freelance' | 'ambos',
                            )
                          }
                        >
                          <Label>Busco</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="banda" textValue="Banda fixa">
                                Banda fixa
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="freelance" textValue="Freelances">
                                Freelances
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="ambos" textValue="Ambos">
                                Ambos
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>

                      <TextField>
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          placeholder="São Paulo, SP"
                          {...musicianForm.register('location')}
                        />
                      </TextField>

                      <Button type="submit" className="w-full" isDisabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Criar perfil
                      </Button>
                    </form>
                  )}

                  {/* Band Form */}
                  {selectedRole === 'banda' && (
                    <form onSubmit={bandForm.handleSubmit(handleBandSubmit)} className="space-y-4">
                      <TextField isInvalid={!!bandForm.formState.errors.name}>
                        <Label htmlFor="band-name">Nome da banda</Label>
                        <Input id="band-name" {...bandForm.register('name')} />
                        {bandForm.formState.errors.name && (
                          <FieldError>{bandForm.formState.errors.name.message}</FieldError>
                        )}
                      </TextField>

                      <div className="grid grid-cols-2 gap-3">
                        <TextField>
                          <Label htmlFor="genre">Gênero principal</Label>
                          <Input
                            id="genre"
                            placeholder="Rock, MPB..."
                            {...bandForm.register('genre')}
                          />
                        </TextField>
                        <TextField>
                          <Label htmlFor="members">Membros</Label>
                          <Input
                            id="members"
                            type="number"
                            min={1}
                            {...bandForm.register('members', { valueAsNumber: true })}
                          />
                        </TextField>
                      </div>

                      <TextField>
                        <Label htmlFor="band-location">Localização</Label>
                        <Input
                          id="band-location"
                          placeholder="São Paulo, SP"
                          {...bandForm.register('location')}
                        />
                      </TextField>

                      <TextField>
                        <Label htmlFor="priceRange">Faixa de preço</Label>
                        <Input
                          id="priceRange"
                          placeholder="R$ 1.000 - R$ 3.000"
                          {...bandForm.register('priceRange')}
                        />
                      </TextField>

                      <TextField>
                        <Label htmlFor="band-description">Descrição</Label>
                        <TextArea id="band-description" rows={2} {...bandForm.register('description')} />
                      </TextField>

                      <Button type="submit" className="w-full" isDisabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Criar banda
                      </Button>
                    </form>
                  )}

                  {/* Establishment Form */}
                  {selectedRole === 'contratante' && (
                    <form
                      onSubmit={establishmentForm.handleSubmit(handleEstablishmentSubmit)}
                      className="space-y-4"
                    >
                      <TextField isInvalid={!!establishmentForm.formState.errors.name}>
                        <Label htmlFor="est-name">Nome do estabelecimento</Label>
                        <Input id="est-name" {...establishmentForm.register('name')} />
                        {establishmentForm.formState.errors.name && (
                          <FieldError>{establishmentForm.formState.errors.name.message}</FieldError>
                        )}
                      </TextField>

                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={establishmentForm.watch('type')}
                          onChange={(key: Key | Key[] | null) =>
                            establishmentForm.setValue('type', String(key ?? ''))
                          }
                          placeholder="Selecione"
                        >
                          <Label>Tipo</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item id="bar" textValue="Bar">
                                Bar
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="restaurante" textValue="Restaurante">
                                Restaurante
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="casa-de-show" textValue="Casa de Show">
                                Casa de Show
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="cafe" textValue="Café">
                                Café
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item id="centro-cultural" textValue="Centro Cultural">
                                Centro Cultural
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                        </Select>
                        <TextField>
                          <Label htmlFor="capacity">Capacidade</Label>
                          <Input
                            id="capacity"
                            type="number"
                            min={1}
                            {...establishmentForm.register('capacity', { valueAsNumber: true })}
                          />
                        </TextField>
                      </div>

                      <TextField>
                        <Label htmlFor="est-location">Localização</Label>
                        <Input
                          id="est-location"
                          placeholder="Vila Madalena, São Paulo"
                          {...establishmentForm.register('location')}
                        />
                      </TextField>

                      <TextField>
                        <Label htmlFor="averageBudget">Orçamento médio</Label>
                        <Input
                          id="averageBudget"
                          placeholder="R$ 1.000 - R$ 5.000"
                          {...establishmentForm.register('averageBudget')}
                        />
                      </TextField>

                      <Button type="submit" className="w-full" isDisabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Criar estabelecimento
                      </Button>
                    </form>
                  )}
                </Modal.Body>
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

                <Modal.Heading className="text-2xl mb-2">Tudo pronto! 🎉</Modal.Heading>
                <p className="text-sm text-muted mb-6">
                  Seu perfil foi criado com sucesso. Agora você pode explorar o PalcoMatch
                  e começar a fazer conexões.
                </p>

                <Button onPress={handleComplete} size="lg" className="gap-2">
                  Começar a explorar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
