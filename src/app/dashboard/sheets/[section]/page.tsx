import PageContainer from '@/components/layout/page-container';
import { SheetSectionView } from '@/features/google-sheets/components/sheet-section-view';

type Props = {
  params: Promise<{ section: string }>;
};

export default async function SheetSectionPage({ params }: Props) {
  const { section } = await params;
  const displayName = section
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <PageContainer pageTitle={displayName} pageDescription='Datos importados desde Google Sheets'>
      <SheetSectionView sectionSlug={section} />
    </PageContainer>
  );
}
