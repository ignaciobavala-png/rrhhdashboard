import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import { FlotaTable, FlotaTableSkeleton } from './flota-table';

export default function FlotaListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  const filters = { page, limit: pageLimit, ...(search && { search }) };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['flota', filters],
    queryFn: async () => {
      const { fakeFlota } = await import('@/constants/mock-api-flota');
      return fakeFlota.getCelulares(filters);
    }
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<FlotaTableSkeleton />}>
        <FlotaTable />
      </Suspense>
    </HydrationBoundary>
  );
}
