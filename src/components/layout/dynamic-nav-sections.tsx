'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { getActiveSections } from '@/features/google-sheets/api/queries';
import { sheetSectionKeys } from '@/features/google-sheets/api/queries';

type SectionKey = 'Vacaciones' | 'Legajo' | 'Sueldos' | 'Asistencia' | 'Flota' | 'People' | string;

const SECTION_ICON: Record<SectionKey, keyof typeof Icons> = {
  Vacaciones: 'calendar',
  Legajo: 'legajo',
  Sueldos: 'payroll',
  Asistencia: 'attendance',
  Flota: 'mobile',
  People: 'talent'
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export function DynamicNavSections() {
  const pathname = usePathname();

  const { data: sections } = useQuery({
    queryKey: sheetSectionKeys.list(),
    queryFn: getActiveSections,
    staleTime: 5 * 60 * 1000
  });

  if (!sections || sections.length === 0) return null;

  const unique = new Map<string, { name: string; url: string; icon: keyof typeof Icons }>();
  for (const s of sections) {
    if (!unique.has(s.section_name)) {
      const slug = slugify(s.section_name);
      unique.set(s.section_name, {
        name: s.section_name,
        url: `/dashboard/sheets/${slug}`,
        icon: SECTION_ICON[s.section_name] ?? 'sheets'
      });
    }
  }

  return (
    <SidebarGroup className='py-0'>
      <SidebarGroupLabel>Secciones importadas</SidebarGroupLabel>
      <SidebarMenu>
        {[...unique.values()].map((section) => {
          const Icon = Icons[section.icon];
          const isActive = pathname.startsWith(section.url);
          return (
            <SidebarMenuItem key={section.url}>
              <SidebarMenuButton asChild tooltip={section.name} isActive={isActive}>
                <Link href={section.url}>
                  <Icon />
                  <span>{section.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
