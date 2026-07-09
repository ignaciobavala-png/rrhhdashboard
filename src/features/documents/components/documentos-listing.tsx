import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { Suspense } from 'react';
import { DocumentosTable, DocumentosTableSkeleton } from './documentos-table';
import { DocumentoUploader } from './documento-uploader';
import { getDocumentos } from '../api/service';

export default function DocumentosListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ['documentos', 'todos'],
    queryFn: () => getDocumentos()
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='flex flex-1 flex-col gap-4'>
        <DocumentoUploader />
        <Suspense fallback={<DocumentosTableSkeleton />}>
          <DocumentosTable />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
