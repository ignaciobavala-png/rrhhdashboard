import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { Suspense } from 'react';
import { ManualesTable, ManualesTableSkeleton } from './manuales-table';
import { ManualUploader } from './manual-uploader';
import { getManuales } from '../api/service';

export default function ManualesListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['manuales'],
    queryFn: getManuales
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='flex flex-1 flex-col gap-4'>
        <ManualUploader />
        <Suspense fallback={<ManualesTableSkeleton />}>
          <ManualesTable />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
