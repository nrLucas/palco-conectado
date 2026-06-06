'use client';

import {
  Avatar,
  Button,
  Dropdown,
  Header,
  Label,
  Separator,
} from '@heroui/react';
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
  artista_independente: 'text-[oklch(0.55_0.2_285)]',
  banda: 'text-accent',
  contratante: 'text-success',
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
      <Button variant="ghost" size="sm" onPress={() => openAuthModal('login')}>
        Entrar
      </Button>
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
  const currentColor = activeProfile ? profileColors[activeProfile.type] : 'text-muted';
  const { allowed: canAddProfile, max, current } = canCreateProfile();

  return (
    <Dropdown>
      <Button variant="ghost" className="gap-2 h-auto py-1.5 px-2">
        <Avatar className="h-8 w-8">
          <Avatar.Image src={account.avatarUrl} alt={account.name} />
          <Avatar.Fallback className="text-xs">{initials}</Avatar.Fallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium">{currentProfileName}</span>
          {activeProfile && (
            <span className="text-xs text-muted flex items-center gap-1">
              <CurrentIcon className={`h-3 w-3 ${currentColor}`} />
              {getProfileTypeName(activeProfile.type)}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-muted" />
      </Button>

      <Dropdown.Popover className="w-64">
        <Dropdown.Menu
          onAction={(key) => {
            const id = String(key);
            if (id === 'settings') router.push('/profile');
            else if (id === 'add-profile') router.push('/profile');
            else if (id === 'logout') logout();
            else switchProfile(id);
          }}
        >
          <Header className="px-2 py-1.5">
            <div className="flex flex-col">
              <span className="font-medium">{account.name}</span>
              <span className="text-xs text-muted">{account.email}</span>
            </div>
          </Header>

          <Separator />

          <Header className="text-xs text-muted px-2">
            Seus Perfis ({current}/{max})
          </Header>

          {profiles.map((profile) => {
            const Icon = profileIcons[profile.type];
            const color = profileColors[profile.type];
            const isActive = activeProfile?.id === profile.id;

            return (
              <Dropdown.Item key={profile.id} id={profile.id} textValue={getProfileName(profile as UserProfile & { entityName?: string })}>
                <Icon className={`h-4 w-4 ${color}`} />
                <Label className="flex-1">
                  {getProfileName(profile as UserProfile & { entityName?: string })}
                </Label>
                {isActive && <Check className="h-4 w-4 text-accent" />}
              </Dropdown.Item>
            );
          })}

          {canAddProfile && (
            <Dropdown.Item id="add-profile" textValue="Adicionar perfil">
              <Plus className="h-4 w-4" />
              <Label>Adicionar perfil</Label>
            </Dropdown.Item>
          )}

          <Separator />

          <Dropdown.Item id="settings" textValue="Configurações">
            <Settings className="h-4 w-4" />
            <Label>Configurações</Label>
          </Dropdown.Item>

          <Dropdown.Item id="logout" textValue="Sair" variant="danger">
            <LogOut className="h-4 w-4" />
            <Label>Sair</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
