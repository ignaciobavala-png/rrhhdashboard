import PageContainer from '@/components/layout/page-container';
import { ChangePinForm } from '@/features/settings/components/change-pin-form';

export const metadata = {
  title: 'Dashboard: Configuración'
};

export default function SettingsPage() {
  return (
    <PageContainer
      pageTitle='Configuración'
      pageDescription='Ajustes de acceso y seguridad del dashboard'
    >
      <div className='grid gap-4 md:max-w-md'>
        <ChangePinForm />
      </div>
    </PageContainer>
  );
}
