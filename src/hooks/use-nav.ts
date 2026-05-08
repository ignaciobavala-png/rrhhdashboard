'use client';

import { useMemo } from 'react';
import type { NavGroup } from '@/types';

export function useFilteredNavGroups(groups: NavGroup[]) {
  return useMemo(() => groups.filter((g) => g.items.length > 0), [groups]);
}
