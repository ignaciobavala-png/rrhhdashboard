import PageContainer from '@/components/layout/page-container';

export default function ProfileViewPage() {
  return (
    <PageContainer pageTitle='Perfil' pageDescription='Información de tu cuenta'>
      <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
        <p className='text-muted-foreground'>
          Configuración de perfil de usuario. Próximamente con Supabase Auth.
        </p>
      </div>
    </PageContainer>
  );
}
