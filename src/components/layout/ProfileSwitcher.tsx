'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import type { ProfileType, UserProfile } from '@/lib/types';
import {
  Building2,
  Check,
  ChevronDown,
  Guitar,
  LogOut,
  Music2,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const profileIcons: Record<ProfileType, typeof Guitar> = {
  artista_independente: Guitar,
  banda: Music2,
  contratante: Building2,
};

const profileColors: Record<ProfileType, string> = {
  artista_independente: 'text-violet-500',
  banda: 'text-amber-500',
  contratante: 'text-emerald-500',
};

function getProfileName(profile: UserProfile & { entityName?: string }): string {
  return profile.entityName || 'Perfil';
}

function getProfileTypeName(type: ProfileType): string {
  const names: Record<ProfileType, string> = {
    artista_independente: 'Artista',
    banda: 'Banda',
    contratante: 'Contratante',
  };
  return names[type];
}

export function ProfileSwitcher() {
  const {
    account,
    isAuthenticated,
    activeProfile,
    profiles,
    switchProfile,
    logout,
    openAuthModal,
    canCreateProfile,
  } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !account) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => openAuthModal('login')}>
          Entrar
        </Button>
      </div>
    );
  }

  const initials = account.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentProfileName = activeProfile
    ? getProfileName(activeProfile as UserProfile & { entityName?: string })
    : account.name;
  const CurrentIcon = activeProfile ? profileIcons[activeProfile.type] : User;
  const currentColor = activeProfile ? profileColors[activeProfile.type] : 'text-muted-foreground';
  const { allowed: canAddProfile, max, current } = canCreateProfile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-auto py-1.5 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={account.avatarUrl} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{currentProfileName}</span>
            {activeProfile && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CurrentIcon className={`h-3 w-3 ${currentColor}`} />
                {getProfileTypeName(activeProfile.type)}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="font-medium">{account.name}</span>
            <span className="text-xs text-muted-foreground">{account.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Seus Perfis ({current}/{max})
        </DropdownMenuLabel>

        {profiles.map((profile) => {
          const Icon = profileIcons[profile.type];
          const color = profileColors[profile.type];
          const isActive = activeProfile?.id === profile.id;

          return (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => switchProfile(profile.id)}
              className="cursor-pointer"
            >
              <Icon className={`h-4 w-4 mr-2 ${color}`} />
              <span className="flex-1">
                {getProfileName(profile as UserProfile & { entityName?: string })}
              </span>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}

        {canAddProfile && (
          <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            <span>Adicionar perfil</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          <span>Configurações</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
