import PageContainer from '@/components/layout/page-container';

export default function SignInViewPage() {
  return (
    <PageContainer pageTitle='Iniciar Sesión' pageDescription='Acceda al panel de administración'>
      <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
        <p className='text-muted-foreground'>
          Formulario de inicio de sesión. Próximamente con Supabase Auth.
        </p>
      </div>
    </PageContainer>
  );
}
