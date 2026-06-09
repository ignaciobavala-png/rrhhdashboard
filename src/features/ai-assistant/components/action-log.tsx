'use client';

import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { ProposedAction } from '../api/types';

export type LogEntry = {
  id: string;
  timestamp: Date;
  mode: 'chat' | 'build';
  userMessage: string;
  action?: ProposedAction;
};

const STATUS_CONFIG = {
  pending: { label: 'pendiente', className: 'text-muted-foreground', icon: 'clock' },
  approved: { label: 'aprobando…', className: 'text-amber-600', icon: 'spinner' },
  rejected: { label: 'rechazado', className: 'text-muted-foreground', icon: 'xCircle' },
  executed: { label: 'ejecutado', className: 'text-emerald-600', icon: 'circleCheck' },
  error: { label: 'error', className: 'text-red-600', icon: 'alertCircle' }
} as const;

const RISK_BADGE = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
};

type Props = {
  entries: LogEntry[];
};

export function ActionLog({ entries }: Props) {
  const actionEntries = entries.filter((e) => e.action);

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-2'>
          <Icons.clock className='h-4 w-4 text-muted-foreground' />
          <span className='font-medium text-sm'>Log de acciones</span>
          {actionEntries.length > 0 && (
            <Badge variant='outline' className='text-[10px]'>
              {actionEntries.length}
            </Badge>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-3 space-y-2'>
        {actionEntries.length === 0 && (
          <div className='flex flex-col items-center gap-2 py-12 text-center'>
            <Icons.clock className='h-8 w-8 text-muted-foreground/30' />
            <p className='text-xs text-muted-foreground'>
              Las acciones propuestas en Modo Build aparecerán acá
            </p>
          </div>
        )}

        {actionEntries.map((entry) => {
          const action = entry.action!;
          const status = STATUS_CONFIG[action.status];
          const StatusIcon = Icons[status.icon as keyof typeof Icons];

          return (
            <div key={entry.id} className='rounded-lg border bg-card p-3 space-y-1.5 text-xs'>
              <div className='flex items-start justify-between gap-2'>
                <p className='text-muted-foreground line-clamp-2 flex-1'>{entry.userMessage}</p>
                <span className='text-[10px] text-muted-foreground/60 shrink-0'>
                  {entry.timestamp.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className='flex items-center gap-1.5 flex-wrap'>
                <Badge variant='outline' className='text-[10px] font-mono'>
                  {action.type}
                </Badge>
                <Badge variant='outline' className='text-[10px]'>
                  {action.table}
                </Badge>
                {action.risk && (
                  <Badge variant='outline' className={`text-[10px] ${RISK_BADGE[action.risk]}`}>
                    {action.risk}
                  </Badge>
                )}
              </div>

              <p className='text-muted-foreground line-clamp-2'>{action.description}</p>

              <div className={`flex items-center gap-1.5 font-medium ${status.className}`}>
                <StatusIcon
                  className={`h-3 w-3 ${action.status === 'approved' ? 'animate-spin' : ''}`}
                />
                <span>{status.label}</span>
                {action.status === 'executed' && action.result && (
                  <span className='text-muted-foreground font-normal'>
                    — {action.result.affected}{' '}
                    {action.result.affected === 1 ? 'registro' : 'registros'}
                  </span>
                )}
                {action.status === 'error' && action.result?.error && (
                  <span
                    className='text-muted-foreground font-normal truncate max-w-[120px]'
                    title={action.result.error}
                  >
                    — {action.result.error}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {actionEntries.length > 0 && (
        <div className='border-t px-4 py-2 text-xs text-muted-foreground'>
          {actionEntries.filter((e) => e.action?.status === 'executed').length} ejecutadas ·{' '}
          {actionEntries.filter((e) => e.action?.status === 'rejected').length} rechazadas ·{' '}
          {actionEntries.filter((e) => e.action?.status === 'error').length} con error
        </div>
      )}
    </div>
  );
}
