import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Admin Center'
};

export default function AdminCenterPage() {
  return (
    <PageContainer
      pageTitle='Admin Center'
      pageDescription='Configuración de módulos y personalización del panel'
    >
      <div className='grid gap-6'>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <h3 className='mb-4 font-semibold'>Módulos Activos</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Gestión de Talento</p>
                <p className='text-muted-foreground text-sm'>CRUD de empleados y organigrama</p>
              </div>
              <div className='bg-muted h-6 w-12 animate-pulse rounded-full' />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Expediente Digital</p>
                <p className='text-muted-foreground text-sm'>Documentos y archivos de empleados</p>
              </div>
              <div className='bg-muted h-6 w-12 animate-pulse rounded-full' />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Control Operativo</p>
                <p className='text-muted-foreground text-sm'>Vacaciones y asistencia</p>
              </div>
              <div className='bg-muted h-6 w-12 animate-pulse rounded-full' />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Nómina</p>
                <p className='text-muted-foreground text-sm'>Recibos de sueldo</p>
              </div>
              <div className='bg-muted h-6 w-12 animate-pulse rounded-full' />
            </div>
          </div>
        </div>

        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <h3 className='mb-4 font-semibold'>Personalización</h3>
          <p className='text-muted-foreground text-sm'>
            Carga de logo corporativo y selector de color primario. Próximamente.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
