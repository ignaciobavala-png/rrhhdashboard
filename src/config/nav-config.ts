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
        title: 'People',
        url: '/dashboard/people',
        icon: 'talent',
        isActive: false,
        shortcut: ['t', 't'],
        items: [
          { title: 'Reuniones', url: '/dashboard/people/reuniones', shortcut: ['r', 'r'] },
          { title: 'Manuales', url: '/dashboard/people/manuales', shortcut: ['m', 'm'] }
        ]
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
