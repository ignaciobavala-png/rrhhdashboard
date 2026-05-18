import PageContainer from '@/components/layout/page-container';
import ReunionesListingPage from '@/features/reuniones/components/reuniones-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = { title: 'Dashboard: Reuniones' };

type PageProps = { searchParams: Promise<SearchParams> };

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer pageTitle='Reuniones' pageDescription='Resúmenes y minutas de reuniones'>
      <ReunionesListingPage />
    </PageContainer>
  );
}
