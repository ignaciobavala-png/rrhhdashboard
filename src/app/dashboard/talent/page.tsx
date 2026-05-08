import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Gestión de Talento'
};

export default function TalentPage() {
  return (
    <PageContainer
      pageTitle='Gestión de Talento'
      pageDescription='Administración de empleados, perfiles y organigrama'
      pageHeaderAction={
        <Link href='/dashboard/talent/new' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.add className='mr-2 h-4 w-4' /> Nuevo Empleado
        </Link>
      }
    >
      <div className='grid gap-4'>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <p className='text-muted-foreground'>
            Lista de empleados con búsqueda, filtros y paginación. Próximamente.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
