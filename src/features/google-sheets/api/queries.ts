import { supabase } from '@/lib/supabase';

export const sheetSectionKeys = {
  all: ['sheet-sections'] as const,
  list: () => [...sheetSectionKeys.all, 'list'] as const
};

export type ActiveSection = {
  section_name: string;
  tab_name: string;
  sheet_id: string;
  sync_id: string;
};

export async function getActiveSections(): Promise<ActiveSection[]> {
  const { data } = await supabase
    .from('sheet_sections')
    .select('section_name, tab_name, sheet_id, sync_id')
    .order('section_name');
  return (data ?? []) as ActiveSection[];
}
