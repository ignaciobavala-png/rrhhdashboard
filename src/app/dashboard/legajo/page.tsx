import { redirect } from 'next/navigation';

export const metadata = { title: 'Dashboard: Legajo' };

export default function Page() {
  redirect('/dashboard/sheets/legajo');
}
