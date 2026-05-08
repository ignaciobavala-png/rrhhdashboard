import PageContainer from '@/components/layout/page-container';

export default function SignUpViewPage() {
  return (
    <PageContainer pageTitle='Registrarse' pageDescription='Crear una cuenta nueva'>
      <div className='bg-card text-card-foreground rounded-xl border p-6 shadow-sm'>
        <p className='text-muted-foreground'>
          Formulario de registro. Próximamente con Supabase Auth.
        </p>
      </div>
    </PageContainer>
  );
}
