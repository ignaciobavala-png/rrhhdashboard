import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { GoogleSheetsListing } from '@/features/google-sheets/components/google-sheets-listing';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Dashboard: Google Sheets' };

function ListingSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className='h-14 w-full rounded-lg' />
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <PageContainer
      pageTitle='Google Sheets'
      pageDescription='Conectá sheets públicos para ver sus datos desde el dashboard'
    >
      <Suspense fallback={<ListingSkeleton />}>
        <GoogleSheetsListing />
      </Suspense>
    </PageContainer>
  );
}
