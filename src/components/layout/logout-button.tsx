'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  return (
    <Button variant='ghost' size='icon' className='h-8 w-8' onClick={handleLogout}>
      <Icons.logout className='h-4 w-4' />
      <span className='sr-only'>Cerrar sesión</span>
    </Button>
  );
}
