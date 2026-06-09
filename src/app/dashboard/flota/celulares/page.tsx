import PageContainer from '@/components/layout/page-container';
import FlotaListingPage from '@/features/flota/components/flota-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { sectionHelp } from '@/config/section-help';
import type { SearchParams } from 'nuqs/server';

export const metadata = { title: 'Dashboard: Flota de Celulares' };

type PageProps = { searchParams: Promise<SearchParams> };

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Flota de Celulares'
      pageDescription='Gestión de equipos móviles asignados al personal'
      infoContent={sectionHelp.flota}
    >
      <FlotaListingPage />
    </PageContainer>
  );
}
