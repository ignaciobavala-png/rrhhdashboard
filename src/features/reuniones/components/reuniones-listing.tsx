import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import { ReunionesTable, ReunionesTableSkeleton } from './reuniones-table';
import { getReuniones } from '@/features/reuniones/api/service';

export default function ReunionesListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  const filters = { page, limit: pageLimit, ...(search && { search }) };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['reuniones', filters],
    queryFn: async () => getReuniones(filters)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ReunionesTableSkeleton />}>
        <ReunionesTable />
      </Suspense>
    </HydrationBoundary>
  );
}
