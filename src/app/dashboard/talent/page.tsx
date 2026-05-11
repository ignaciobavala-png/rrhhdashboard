import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import TalentListingPage from '@/features/talent/components/talent-listing';

export const metadata = {
  title: 'Dashboard: Gestión de Talento'
};

export default function TalentPage() {
  return (
    <PageContainer
      pageTitle='Gestión de Talento'
      pageDescription='Evaluaciones, objetivos y seguimiento de talento'
      pageHeaderAction={
        <Link href='/dashboard/talent/new' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.add className='mr-2 h-4 w-4' /> Nuevo Empleado
        </Link>
      }
    >
      <TalentListingPage />
    </PageContainer>
  );
}
