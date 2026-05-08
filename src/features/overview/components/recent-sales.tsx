import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

const employees = [
  {
    name: 'Martín Olivieri',
    puesto: 'Desarrollador Senior',
    avatar: 'https://api.slingacademy.com/public/sample-users/1.png',
    fallback: 'MO',
    evento: 'Licencia aprobada'
  },
  {
    name: 'Laura Juárez',
    puesto: 'Diseñadora UX',
    avatar: 'https://api.slingacademy.com/public/sample-users/2.png',
    fallback: 'LJ',
    evento: 'Vacaciones solicitadas'
  },
  {
    name: 'Ignacio Báez',
    puesto: 'Project Manager',
    avatar: 'https://api.slingacademy.com/public/sample-users/3.png',
    fallback: 'IB',
    evento: 'Ingreso registrado'
  },
  {
    name: 'Camila Witt',
    puesto: 'Contadora',
    avatar: 'https://api.slingacademy.com/public/sample-users/4.png',
    fallback: 'CW',
    evento: 'Recibo de sueldo emitido'
  },
  {
    name: 'Sofía Dávila',
    puesto: 'RRHH',
    avatar: 'https://api.slingacademy.com/public/sample-users/5.png',
    fallback: 'SD',
    evento: 'Nuevo empleado cargado'
  }
];

export function RecentSales() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>12 novedades en las últimas 24 hs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {employees.map((emp, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={emp.avatar} alt='Avatar' />
                <AvatarFallback>{emp.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{emp.name}</p>
                <p className='text-muted-foreground text-sm'>{emp.puesto}</p>
              </div>
              <div className='ml-auto text-sm font-medium'>{emp.evento}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
