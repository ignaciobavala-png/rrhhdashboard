import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Panel Principal',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Recursos Humanos',
    items: [
      {
        title: 'Talento',
        url: '/dashboard/talent',
        icon: 'talent',
        isActive: false,
        shortcut: ['t', 't'],
        items: []
      },
      {
        title: 'Expedientes',
        url: '/dashboard/documents',
        icon: 'documents',
        isActive: false,
        shortcut: ['e', 'e'],
        items: []
      },
      {
        title: 'Operaciones',
        url: '/dashboard/operations',
        icon: 'operations',
        isActive: false,
        shortcut: ['o', 'o'],
        items: []
      },
      {
        title: 'Salarios',
        url: '/dashboard/payroll',
        icon: 'payroll',
        isActive: false,
        shortcut: ['s', 's'],
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
