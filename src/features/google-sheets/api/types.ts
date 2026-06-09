export type GoogleSheet = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  created_at: string;
};

export type GoogleSheetInsert = {
  name: string;
  url: string;
  description?: string | null;
};

export type SheetSync = {
  id: string;
  sheet_id: string;
  synced_at: string;
  row_count: number;
  headers: string[];
  error: string | null;
  tab_name: string;
  tab_gid: number;
  suggested_section: string | null;
};

export type SheetRow = {
  id: string;
  sync_id: string;
  sheet_id: string;
  row_index: number;
  data: Record<string, string>;
};

export type ParsedSheet = {
  headers: string[];
  rows: Record<string, string>[];
};

export type SheetTab = {
  gid: number;
  name: string;
};

export type ColumnType =
  | 'number'
  | 'date'
  | 'boolean'
  | 'email'
  | 'url'
  | 'percentage'
  | 'currency'
  | 'text';

export type SyncResult = {
  tabs: Array<{
    tabName: string;
    tabGid: number;
    syncId: string;
    rowCount: number;
    headers: string[];
    suggestedSection: string | null;
    error?: string;
  }>;
};
