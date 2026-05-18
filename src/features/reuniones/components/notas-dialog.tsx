'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateReunion } from '@/features/reuniones/api/service';
import type { Reunion } from '@/features/reuniones/api/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reunion: Reunion | null;
}

export function NotasDialog({ open, onOpenChange, reunion }: NotasDialogProps) {
  const queryClient = useQueryClient();
  const [resumen, setResumen] = useState('');

  useEffect(() => {
    setResumen(reunion?.resumen ?? '');
  }, [reunion, open]);

  const mutation = useMutation({
    mutationFn: () => updateReunion(reunion!.id, { resumen: resumen.trim() || null }),
    onSuccess: () => {
      toast.success('Anotaciones guardadas');
      queryClient.invalidateQueries({ queryKey: ['reuniones'] });
      queryClient.invalidateQueries({ queryKey: ['calendario', 'reuniones'] });
      onOpenChange(false);
    },
    onError: () => toast.error('Error al guardar')
  });

  if (!reunion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{reunion.titulo}</DialogTitle>
          <DialogDescription className='flex flex-wrap items-center gap-2 pt-1'>
            <span>
              {format(new Date(reunion.fecha.replace(/-/g, '/')), "dd 'de' MMMM yyyy", {
                locale: es
              })}
            </span>
            <span>·</span>
            <span>{reunion.hora}</span>
            <span>·</span>
            <span>{reunion.duracion} min</span>
          </DialogDescription>
          {reunion.participantes.length > 0 && (
            <div className='flex flex-wrap gap-1 pt-1'>
              {reunion.participantes.map((p, i) => (
                <Badge key={i} variant='secondary' className='text-xs'>
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className='space-y-2 py-1'>
          <Textarea
            placeholder='Anotaciones, decisiones tomadas, próximos pasos...'
            rows={6}
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
          />
        </div>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Guardar anotaciones
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
