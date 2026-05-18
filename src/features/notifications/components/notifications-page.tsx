'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getNotificaciones,
  getProximosEventos,
  marcarLeida,
  marcarTodasLeidas
} from '../api/service';
import type { Notificacion, ProximoEvento } from '../api/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function tiempoRelativo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  if (dias < 7) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function labelDias(n: number): string {
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  return `en ${n} días`;
}

const entidadIcon: Record<string, React.ReactNode> = {
  empleados: <Icons.user className='h-4 w-4' />,
  reuniones: <Icons.meetings className='h-4 w-4' />,
  manuales: <Icons.manuals className='h-4 w-4' />,
  flota_laptops: <Icons.laptop className='h-4 w-4' />,
  lineas_moviles: <Icons.mobile className='h-4 w-4' />,
  puestos: <Icons.legajo className='h-4 w-4' />
};

const accionColor: Record<string, string> = {
  creacion: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  modificacion: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  eliminacion: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

const accionLabel: Record<string, string> = {
  creacion: 'Creación',
  modificacion: 'Modificación',
  eliminacion: 'Eliminación'
};

// ── subcomponents ─────────────────────────────────────────────────────────────

function EventoRow({ ev }: { ev: ProximoEvento }) {
  const urgente = ev.diasRestantes <= 1;
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3',
        urgente ? 'border-amber-500/40 bg-amber-500/5' : 'bg-muted/40'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          ev.tipo === 'reunion'
            ? 'bg-indigo-500/10 text-indigo-600'
            : 'bg-pink-500/10 text-pink-600'
        )}
      >
        {ev.tipo === 'reunion' ? (
          <Icons.meetings className='h-4 w-4' />
        ) : (
          <Icons.sparkles className='h-4 w-4' />
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium truncate'>{ev.titulo}</p>
        <p className='text-xs text-muted-foreground'>
          {ev.tipo === 'reunion' ? 'Reunión' : 'Cumpleaños'}
          {ev.hora ? ` · ${ev.hora}` : ''}
        </p>
      </div>
      <Badge
        variant='outline'
        className={urgente ? 'border-amber-500/50 text-amber-600 dark:text-amber-400' : ''}
      >
        {labelDias(ev.diasRestantes)}
      </Badge>
    </div>
  );
}

function NotifRow({ notif, onRead }: { notif: Notificacion; onRead: (id: number) => void }) {
  const icon = entidadIcon[notif.entidad] ?? <Icons.notification className='h-4 w-4' />;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg px-4 py-3 transition-colors',
        notif.leida ? 'bg-muted/30' : 'bg-muted'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          accionColor[notif.accion] ?? 'bg-muted-foreground/10 text-muted-foreground'
        )}
      >
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <p className={cn('text-sm', notif.leida ? 'text-muted-foreground' : 'font-medium')}>
            {notif.descripcion}
          </p>
          {!notif.leida && <div className='h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500' />}
        </div>
        <div className='mt-0.5 flex items-center gap-2'>
          <Badge
            variant='outline'
            className={cn('text-[10px] px-1.5 py-0', accionColor[notif.accion])}
          >
            {accionLabel[notif.accion]}
          </Badge>
          <span className='text-[11px] text-muted-foreground/60'>
            {tiempoRelativo(notif.created_at)}
          </span>
        </div>
      </div>
      {!notif.leida && (
        <button
          onClick={() => onRead(notif.id)}
          className='mt-0.5 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground'
          title='Marcar como leído'
        >
          <Icons.check className='h-3.5 w-3.5' />
        </button>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

type Tab = 'todos' | 'no-leidos';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('todos');

  const { data: actividad = [], isLoading: loadingActividad } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: getNotificaciones,
    refetchInterval: 30000
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['proximos-eventos'],
    queryFn: getProximosEventos,
    staleTime: 5 * 60 * 1000
  });

  const noLeidas = actividad.filter((n) => !n.leida).length;

  const handleRead = async (id: number) => {
    await marcarLeida(id);
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
  };

  const handleReadAll = async () => {
    await marcarTodasLeidas();
    toast.success('Todas las notificaciones marcadas como leídas');
    queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
  };

  const lista = tab === 'no-leidos' ? actividad.filter((n) => !n.leida) : actividad;

  return (
    <PageContainer
      pageTitle='Notificaciones'
      pageDescription='Historial de actividad y próximos eventos del calendario'
      pageHeaderAction={
        noLeidas > 0 ? (
          <Button variant='outline' size='sm' onClick={handleReadAll}>
            Marcar todo como leído ({noLeidas})
          </Button>
        ) : undefined
      }
    >
      <div className='flex flex-col gap-6 max-w-2xl'>
        {/* ── Próximos eventos ── */}
        {eventos.length > 0 && (
          <section className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Icons.calendar className='h-4 w-4 text-muted-foreground' />
              <h2 className='text-sm font-semibold'>Próximos 5 días</h2>
              <Badge variant='outline' className='text-xs'>
                {eventos.length}
              </Badge>
            </div>
            <div className='flex flex-col gap-2'>
              {eventos.map((ev, i) => (
                <EventoRow key={i} ev={ev} />
              ))}
            </div>
          </section>
        )}

        {/* ── Historial ── */}
        <section className='space-y-3'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Icons.clock className='h-4 w-4 text-muted-foreground' />
              <h2 className='text-sm font-semibold'>Historial de actividad</h2>
            </div>
            <div className='flex rounded-lg border p-0.5 gap-0.5'>
              {(['todos', 'no-leidos'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'rounded px-3 py-1 text-xs font-medium transition-colors',
                    tab === t
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'todos' ? `Todos (${actividad.length})` : `No leídos (${noLeidas})`}
                </button>
              ))}
            </div>
          </div>

          {loadingActividad ? (
            <div className='flex flex-col gap-2'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='h-16 rounded-lg bg-muted animate-pulse' />
              ))}
            </div>
          ) : lista.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground gap-2'>
              <Icons.notification className='h-8 w-8 opacity-30' />
              <p className='text-sm'>
                {tab === 'no-leidos'
                  ? 'No hay notificaciones sin leer.'
                  : 'Sin actividad registrada todavía.'}
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-1.5'>
              {lista.map((n) => (
                <NotifRow key={n.id} notif={n} onRead={handleRead} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
