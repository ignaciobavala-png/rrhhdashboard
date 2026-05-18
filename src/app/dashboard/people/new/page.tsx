import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Nuevo Empleado'
};

export default function NewEmployeePage() {
  return (
    <PageContainer
      pageTitle='Nuevo Empleado'
      pageDescription='Registrar un nuevo empleado en el sistema'
      pageHeaderAction={
        <Link
          href='/dashboard/people'
          className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm')}
        >
          <Icons.chevronLeft className='mr-2 h-4 w-4' /> Volver
        </Link>
      }
    >
      <div className='grid gap-4'>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <p className='text-muted-foreground'>
            Formulario de registro de empleado con TanStack Form + Zod. Próximamente.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
