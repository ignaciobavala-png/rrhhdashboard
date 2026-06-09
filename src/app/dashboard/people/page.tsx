import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { sectionHelp } from '@/config/section-help';
import Link from 'next/link';
import PeopleListingPage from '@/features/people/components/people-listing';

export const metadata = {
  title: 'Dashboard: People'
};

export default function PeoplePage() {
  return (
    <PageContainer
      pageTitle='People'
      pageDescription='Evaluaciones, objetivos y seguimiento de talento'
      infoContent={sectionHelp.people}
      pageHeaderAction={
        <Link href='/dashboard/people/new' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.add className='mr-2 h-4 w-4' /> Nuevo Empleado
        </Link>
      }
    >
      <PeopleListingPage />
    </PageContainer>
  );
}
