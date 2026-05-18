import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { Suspense } from 'react';
import { LaptopsTable, LaptopsTableSkeleton } from './laptops-table';
import { getLaptops } from '../api/service';

export default function LaptopsListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['flota-laptops'],
    queryFn: () => getLaptops()
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LaptopsTableSkeleton />}>
        <LaptopsTable />
      </Suspense>
    </HydrationBoundary>
  );
}
