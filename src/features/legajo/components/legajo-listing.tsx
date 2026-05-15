import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import { LegajoTable, LegajoTableSkeleton } from './legajo-table';
import { getEmpleados } from '../api/service';

export default function LegajoListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const sort = searchParamsCache.get('sort');

  const filters = { page, limit: pageLimit, ...(search && { search }), ...(sort && { sort }) };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['legajo', filters],
    queryFn: () => getEmpleados(filters)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LegajoTableSkeleton />}>
        <LegajoTable />
      </Suspense>
    </HydrationBoundary>
  );
}
