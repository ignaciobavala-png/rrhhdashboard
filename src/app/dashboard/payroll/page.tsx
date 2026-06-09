import { redirect } from 'next/navigation';

export const metadata = { title: 'Dashboard: Sueldos' };

export default function Page() {
  redirect('/dashboard/sheets/sueldos');
}
