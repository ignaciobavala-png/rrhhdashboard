import { redirect } from 'next/navigation';

export const metadata = { title: 'Dashboard: Flota' };

export default function Page() {
  redirect('/dashboard/sheets/flota');
}
