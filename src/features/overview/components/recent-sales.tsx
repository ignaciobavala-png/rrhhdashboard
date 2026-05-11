'use client';

import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

function initials(nombreApellido: string): string {
  const parts = nombreApellido.split(/[\s,]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function RecentSales() {
  const { data: empleados = [], isLoading } = useQuery({
    queryKey: ['overview', 'empleados-recientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empleados')
        .select('id, nombre_apellido, equipo_ingreso, fecha_ingreso')
        .eq('activo', true)
        .order('fecha_ingreso', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    }
  });

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Ingresos Recientes</CardTitle>
        <CardDescription>Últimos empleados activos incorporados</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <div className='space-y-1 flex-1'>
                  <Skeleton className='h-3 w-32' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </div>
            ))}
          </div>
        ) : empleados.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>Sin información disponible.</p>
        ) : (
          <div className='space-y-6'>
            {empleados.map((emp) => (
              <div key={emp.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarFallback className='text-xs'>
                    {initials(emp.nombre_apellido)}
                  </AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>{emp.nombre_apellido}</p>
                  <p className='text-muted-foreground text-sm'>
                    {emp.equipo_ingreso ?? <span className='italic'>Sin equipo</span>}
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  {emp.fecha_ingreso ? (
                    new Date(emp.fecha_ingreso).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })
                  ) : (
                    <span className='italic'>Sin fecha</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
