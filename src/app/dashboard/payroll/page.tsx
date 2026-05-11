import PageContainer from '@/components/layout/page-container';
import { PayrollPage } from '@/features/payroll/components/payroll-page';

export const metadata = {
  title: 'Dashboard: Salarios'
};

export default function PayrollPageRoute() {
  return (
    <PageContainer
      pageTitle='Salarios'
      pageDescription='Histórico de sueldos mensuales por empleado'
    >
      <PayrollPage />
    </PageContainer>
  );
}
