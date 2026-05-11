import PageContainer from '@/components/layout/page-container';
import ManualesListingPage from '@/features/manuales/components/manuales-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = { title: 'Dashboard: Manuales' };

type PageProps = { searchParams: Promise<SearchParams> };

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer pageTitle='Manuales' pageDescription='Manuales y documentación interna'>
      <ManualesListingPage />
    </PageContainer>
  );
}
