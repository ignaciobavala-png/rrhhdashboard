'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { getEmpleadoById, getHomeOfficeEmpleado } from '@/features/legajo/api/service';
import { SectionFechaNacimiento } from './sections/section-fecha-nacimiento';
import { SectionCelular } from './sections/section-celular';
import { SectionEmergencia } from './sections/section-emergencia';
import { SectionPresencialidad } from './sections/section-presencialidad';
import { SectionEmail } from './sections/section-email';
import { SectionDireccion } from './sections/section-direccion';
import { SectionMovilidad } from './sections/section-movilidad';

const SIN_INFO = <span className='text-muted-foreground italic text-xs'>Sin información</span>;

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function LegajoViewPage({ empleadoId }: { empleadoId: string }) {
  const queryClient = useQueryClient();
  const id = Number(empleadoId);

  const { data: empleado } = useQuery({
    queryKey: ['legajo', id],
    queryFn: () => getEmpleadoById(id)
  });

  const { data: homeOffice = [] } = useQuery({
    queryKey: ['legajo', id, 'home_office'],
    queryFn: () => getHomeOfficeEmpleado(id)
  });

  if (!empleado) notFound();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['legajo', id] });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Avatar className='h-16 w-16'>
          <AvatarFallback className='text-lg'>{initials(empleado.nombre_apellido)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className='text-xl font-semibold'>{empleado.nombre_apellido}</h3>
          <p className='text-muted-foreground text-sm'>{empleado.equipo_ingreso ?? 'Sin equipo'}</p>
          <Badge
            variant='outline'
            className={
              empleado.activo
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }
          >
            {empleado.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <SectionFechaNacimiento empleadoId={id} fechaNacimiento={empleado.fecha_nacimiento} />
        <SectionCelular empleadoId={id} celular={empleado.celular} />
        <SectionEmergencia empleadoId={id} contactoEmergencia={empleado.contacto_emergencia} />
      </div>

      <div className='grid gap-4 md:grid-cols-1'>
        <SectionEmail empleadoId={id} email={empleado.email} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <SectionDireccion empleadoId={id} direccion={empleado.direccion} />
        <SectionPresencialidad
          empleadoId={id}
          modalidad={empleado.modalidad}
          homeOffice={homeOffice}
          onDataChange={refresh}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-1'>
        <SectionMovilidad empleadoId={id} movilidad={empleado.movilidad} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Icons.building className='h-4 w-4' /> Datos Laborales
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>DNI</span>
            <span>{empleado.dni ?? SIN_INFO}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Equipo</span>
            <span>{empleado.equipo_ingreso ?? SIN_INFO}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Fecha de Ingreso</span>
            <span>
              {empleado.fecha_ingreso
                ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-AR')
                : SIN_INFO}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
