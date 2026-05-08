import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Workspaces',
        url: '/dashboard/workspaces',
        icon: 'workspace',
        isActive: false,
        items: []
      },
      {
        title: 'Teams',
        url: '/dashboard/workspaces/team',
        icon: 'teams',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'RRHH',
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
    label: 'Administración',
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
        title: 'Billing',
        url: '/dashboard/billing',
        icon: 'billing',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Profile',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          },
          {
            title: 'Login',
            shortcut: ['l', 'l'],
            url: '/',
            icon: 'login'
          }
        ]
      }
    ]
  }
];
