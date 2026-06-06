'use client';

import {
  Badge,
  Button,
  Dropdown,
  Header,
  Label,
  Separator,
} from '@heroui/react';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';
import { useAuth } from '@/lib/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  if (!isAuthenticated) return null;

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <Dropdown>
      <Button variant="ghost" size="sm" aria-label="Notificações" className="relative min-w-10">
        <Badge.Anchor>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge color="danger" size="sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Badge.Anchor>
      </Button>

      <Dropdown.Popover className="w-80">
        <Dropdown.Menu
          onAction={(key) => {
            if (key === 'view-all') {
              router.push('/propostas');
              return;
            }
            if (typeof key === 'string' && key.startsWith('n-')) {
              void handleMarkRead(key.slice(2));
            }
          }}
        >
          <Header className="flex items-center justify-between px-2 py-1.5">
            <span className="font-medium">Notificações</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto min-h-0 p-0 text-xs" onPress={handleMarkAllRead}>
                Marcar todas
              </Button>
            )}
          </Header>

          <Separator />

          {notifications.length === 0 ? (
            <Header className="p-4 text-sm text-muted text-center font-normal">
              Nenhuma notificação
            </Header>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <Dropdown.Item
                key={n.id}
                id={`n-${n.id}`}
                textValue={n.title}
                className={!n.read ? 'bg-default/60' : undefined}
              >
                <div className="flex flex-col items-start gap-0.5 py-0.5">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-xs text-muted">{n.body}</span>
                </div>
              </Dropdown.Item>
            ))
          )}

          <Separator />

          <Dropdown.Item id="view-all" textValue="Ver propostas" href="/propostas">
            <Label className="w-full text-center text-sm">Ver propostas</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
