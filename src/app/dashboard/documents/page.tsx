import PageContainer from '@/components/layout/page-container';
import DocumentosListingPage from '@/features/documents/components/documentos-listing';

export const metadata = {
  title: 'Dashboard: Expediente Digital'
};

export default function DocumentsPage() {
  return (
    <PageContainer
      pageTitle='Expediente Digital'
      pageDescription='Gestión de documentos y archivos de empleados'
    >
      <DocumentosListingPage />
    </PageContainer>
  );
}
