'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';

const estadoColors: Record<string, string> = {
  Activo: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Vacaciones: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Licencia: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Ausente: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

export default function LegajoViewPage({ empleadoId }: { empleadoId: string }) {
  const { data: empleado } = useSuspenseQuery({
    queryKey: ['legajo', empleadoId],
    queryFn: async () => {
      const { fakeLegajo } = await import('@/constants/mock-api-legajo');
      return fakeLegajo.getEmpleadoById(Number(empleadoId));
    }
  });

  if (!empleado) notFound();

  const initials = `${empleado.nombre[0]}${empleado.apellido[0]}`;

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={empleado.avatar} alt={empleado.nombre} />
          <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className='text-xl font-semibold'>
            {empleado.nombre} {empleado.apellido}
          </h3>
          <p className='text-muted-foreground text-sm'>
            {empleado.puesto} · {empleado.departamento}
          </p>
          <Badge variant='outline' className={estadoColors[empleado.estado] ?? ''}>
            {empleado.estado}
          </Badge>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.user className='h-4 w-4' /> Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>DNI</span>
              <span>{empleado.dni}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Email</span>
              <span>{empleado.email}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Teléfono</span>
              <span>{empleado.telefono}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Dirección</span>
              <span>{empleado.direccion}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Fecha de Nacimiento</span>
              <span>{new Date(empleado.fecha_nacimiento).toLocaleDateString('es-AR')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.building className='h-4 w-4' /> Datos Laborales
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Puesto</span>
              <span>{empleado.puesto}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Departamento</span>
              <span>{empleado.departamento}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Seniority</span>
              <Badge variant='outline'>{empleado.seniority}</Badge>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Salario</span>
              <span className='tabular-nums'>${empleado.salario.toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Modalidad</span>
              <Badge
                variant='outline'
                className={
                  empleado.modalidad === 'home_office'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : empleado.modalidad === 'presencial'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }
              >
                {empleado.modalidad === 'home_office'
                  ? 'Home Office'
                  : empleado.modalidad === 'presencial'
                    ? 'Presencial'
                    : 'Híbrido'}
              </Badge>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Fecha de Ingreso</span>
              <span>{new Date(empleado.fecha_ingreso).toLocaleDateString('es-AR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
