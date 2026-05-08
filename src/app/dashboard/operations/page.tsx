import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Control Operativo'
};

export default function OperationsPage() {
  return (
    <PageContainer
      pageTitle='Control Operativo'
      pageDescription='Vacaciones, ausencias y registro de asistencia'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <h3 className='mb-2 font-semibold'>Solicitudes de Vacaciones</h3>
          <p className='text-muted-foreground text-sm'>
            Calendario interactivo para gestionar solicitudes de vacaciones y ausencias.
            Próximamente.
          </p>
        </div>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <h3 className='mb-2 font-semibold'>Registro de Asistencia</h3>
          <p className='text-muted-foreground text-sm'>
            Marcaje de entrada y salida en tiempo real. Próximamente.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
