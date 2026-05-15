import PageContainer from '@/components/layout/page-container';
import LegajoViewPage from '@/features/legajo/components/legajo-view-page';

export const metadata = { title: 'Dashboard: Detalle de Empleado' };

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  return (
    <PageContainer
      pageTitle='Detalle del Empleado'
      pageDescription='Información completa del empleado'
    >
      <LegajoViewPage empleadoId={id} />
    </PageContainer>
  );
}
