'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function TalentListingPage() {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Icons.attendance className='h-4 w-4' /> Evaluaciones
          </CardTitle>
          <CardDescription>Últimas evaluaciones de desempeño</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm italic'>
            Sin información disponible aún. Las evaluaciones se cargarán cuando estén registradas en
            el sistema.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Icons.trendingUp className='h-4 w-4' /> Objetivos
          </CardTitle>
          <CardDescription>Seguimiento de objetivos activos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm italic'>
            Sin información disponible aún. Los objetivos se cargarán cuando estén registrados en el
            sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
