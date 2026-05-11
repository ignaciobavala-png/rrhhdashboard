import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import { LegajoTable, LegajoTableSkeleton } from './legajo-table';

export default function LegajoListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const sort = searchParamsCache.get('sort');

  const filters = { page, limit: pageLimit, ...(search && { search }), ...(sort && { sort }) };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['legajo', filters],
    queryFn: async () => {
      const { fakeLegajo } = await import('@/constants/mock-api-legajo');
      return fakeLegajo.getEmpleados(filters);
    }
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LegajoTableSkeleton />}>
        <LegajoTable />
      </Suspense>
    </HydrationBoundary>
  );
}
