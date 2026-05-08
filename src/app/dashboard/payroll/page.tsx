import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Salarios'
};

export default function PayrollPage() {
  return (
    <PageContainer
      pageTitle='Salarios'
      pageDescription='Visualización y descarga de recibos de sueldo'
    >
      <div className='grid gap-4'>
        <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
          <p className='text-muted-foreground'>
            Histórico de períodos salariales con desglose de haberes y descarga de recibos en PDF.
            Próximamente.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
