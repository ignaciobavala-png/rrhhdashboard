import PageContainer from '@/components/layout/page-container';
import ManualesListingPage from '@/features/manuales/components/manuales-listing';

export const metadata = { title: 'Dashboard: Manuales' };

export default function Page() {
  return (
    <PageContainer pageTitle='Manuales' pageDescription='Manuales y documentación interna'>
      <ManualesListingPage />
    </PageContainer>
  );
}
