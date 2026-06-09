import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { ColumnType } from '../api/types';

const BOOLEAN_TRUE = new Set(['si', 'sí', 'yes', 'true', 'activo', '✓', 'x']);

type Props = {
  value: string;
  type: ColumnType;
};

export function SmartCell({ value, type }: Props) {
  if (!value || value.trim() === '') {
    return <span className='text-muted-foreground/40'>—</span>;
  }

  switch (type) {
    case 'boolean': {
      const isTrue = BOOLEAN_TRUE.has(value.trim().toLowerCase());
      return (
        <Badge variant={isTrue ? 'default' : 'secondary'} className='text-xs'>
          {value}
        </Badge>
      );
    }

    case 'email':
      return (
        <a
          href={`mailto:${value}`}
          className='text-primary hover:underline flex items-center gap-1'
        >
          <Icons.send className='h-3 w-3' />
          {value}
        </a>
      );

    case 'url':
      return (
        <a
          href={value}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:underline flex items-center gap-1'
        >
          <Icons.externalLink className='h-3 w-3' />
          {value.replace(/^https?:\/\//, '').split('/')[0]}
        </a>
      );

    case 'number':
      return (
        <span className='tabular-nums'>
          {Number(value.replace(/,/g, '')).toLocaleString('es-AR')}
        </span>
      );

    case 'currency':
      return <span className='tabular-nums font-medium'>{value}</span>;

    case 'percentage':
      return <span className='tabular-nums'>{value}</span>;

    case 'date': {
      // Try to render as a readable date
      const d = new Date(value.replace(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/, '$3-$2-$1'));
      const readable = isNaN(d.getTime())
        ? value
        : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
      return <span>{readable}</span>;
    }

    default:
      return <span>{value}</span>;
  }
}
