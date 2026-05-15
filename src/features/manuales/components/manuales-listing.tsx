import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import { ManualesTable, ManualesTableSkeleton } from './manuales-table';
import { getManuales } from '../api/service';

export default function ManualesListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  const filters = { page, limit: pageLimit, ...(search && { search }) };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['manuales', filters],
    queryFn: () => getManuales(filters)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ManualesTableSkeleton />}>
        <ManualesTable />
      </Suspense>
    </HydrationBoundary>
  );
}
