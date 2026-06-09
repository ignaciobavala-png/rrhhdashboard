import PageContainer from '@/components/layout/page-container';
import LaptopsListingPage from '@/features/flota-laptops/components/laptops-listing';

export const metadata = { title: 'Dashboard: Flota de Laptops' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Flota de Laptops'
      pageDescription='Gestión de laptops asignadas al personal'
    >
      <LaptopsListingPage />
    </PageContainer>
  );
}
