export type Manual = {
  id: number;
  empresa_id: number;
  tarea: string;
  link_manual: string | null;
  area: string;
  created_at: string;
  updated_at: string;
};

export type ManualesResponse = {
  items: Manual[];
  total_items: number;
};

export type ManualesFilters = {
  page?: number;
  limit?: number;
  search?: string;
};
