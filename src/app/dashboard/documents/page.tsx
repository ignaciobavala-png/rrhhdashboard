import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard: Expediente Digital'
};

export default function DocumentsPage() {
  return (
    <PageContainer
      pageTitle='Expediente Digital'
      pageDescription='Gestión de documentos y archivos de empleados'
      pageHeaderAction={
        <button className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.upload className='mr-2 h-4 w-4' /> Subir Documento
        </button>
      }
    >
      <div className='grid gap-4'>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <p className='text-muted-foreground'>
            Repositorio central de documentos: contratos, identificaciones, certificados.
            Próximamente.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
