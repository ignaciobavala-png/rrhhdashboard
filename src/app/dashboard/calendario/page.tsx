import PageContainer from '@/components/layout/page-container';
import CalendarioPage from '@/features/calendario/components/calendario-page';

export const metadata = { title: 'Dashboard: Calendario' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Calendario'
      pageDescription='Licencias, sueldos, días de estudio y ausencias'
    >
      <CalendarioPage />
    </PageContainer>
  );
}
