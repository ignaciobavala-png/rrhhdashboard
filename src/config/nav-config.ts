import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Panel Principal',
    items: [
      {
        title: 'Resumen',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Gestión de Personas',
    items: [
      {
        title: 'Legajo',
        url: '/dashboard/legajo',
        icon: 'legajo',
        isActive: false,
        shortcut: ['l', 'l'],
        items: []
      },
      {
        title: 'Calendario',
        url: '/dashboard/calendario',
        icon: 'calendar',
        isActive: false,
        shortcut: ['c', 'c'],
        items: []
      },
      {
        title: 'Talento',
        url: '/dashboard/talent',
        icon: 'talent',
        isActive: false,
        shortcut: ['t', 't'],
        items: []
      },
      {
        title: 'Sueldos',
        url: '/dashboard/payroll',
        icon: 'payroll',
        isActive: false,
        shortcut: ['s', 's'],
        items: []
      }
    ]
  },
  {
    label: 'Administración',
    items: [
      {
        title: 'Reuniones',
        url: '/dashboard/reuniones',
        icon: 'meetings',
        isActive: false,
        shortcut: ['r', 'r'],
        items: []
      },
      {
        title: 'Manuales',
        url: '/dashboard/manuales',
        icon: 'manuals',
        isActive: false,
        shortcut: ['m', 'm'],
        items: []
      },
      {
        title: 'Flota Celulares',
        url: '/dashboard/flota',
        icon: 'mobile',
        isActive: false,
        shortcut: ['f', 'f'],
        items: []
      },
      {
        title: 'Expedientes',
        url: '/dashboard/documents',
        icon: 'documents',
        isActive: false,
        shortcut: ['e', 'e'],
        items: []
      }
    ]
  },
  {
    label: 'Configuración',
    items: [
      {
        title: 'Admin Center',
        url: '/dashboard/admin',
        icon: 'admin',
        isActive: false,
        shortcut: ['a', 'a'],
        items: []
      },
      {
        title: 'Perfil',
        url: '/dashboard/profile',
        icon: 'profile',
        isActive: false,
        shortcut: ['p', 'p'],
        items: []
      },
      {
        title: 'Notificaciones',
        url: '/dashboard/notifications',
        icon: 'notification',
        isActive: false,
        shortcut: ['n', 'n'],
        items: []
      }
    ]
  }
];
