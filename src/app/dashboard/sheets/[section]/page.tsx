import PageContainer from '@/components/layout/page-container';
import { SheetSectionView } from '@/features/google-sheets/components/sheet-section-view';

type Props = {
  params: Promise<{ section: string }>;
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  legajo: 'Ficha de empleados — fuente: Google Sheets',
  sueldos: 'Histórico salarial — fuente: Google Sheets',
  flota: 'Equipos y líneas móviles — fuente: Google Sheets',
  vacaciones: 'Saldos y días tomados — fuente: Google Sheets',
  people: 'Información de personas — fuente: Google Sheets'
};

export default async function SheetSectionPage({ params }: Props) {
  const { section } = await params;
  const displayName = section
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const description = SECTION_DESCRIPTIONS[section] ?? 'Datos sincronizados desde Google Sheets';

  return (
    <PageContainer pageTitle={displayName} pageDescription={description}>
      <SheetSectionView sectionSlug={section} />
    </PageContainer>
  );
}
