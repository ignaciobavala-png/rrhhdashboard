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
};

export type SheetRow = {
  id: string;
  sync_id: string;
  sheet_id: string;
  row_index: number;
  data: Record<string, string>;
};

// Raw CSV parsed before persisting
export type ParsedSheet = {
  headers: string[];
  rows: Record<string, string>[];
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
  syncId: string;
  rowCount: number;
  headers: string[];
  error?: string;
};
