export interface PaginateMeta {
  total: number;
  page: number;
  size: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginateResult<T> {
  items: T[];
  meta: PaginateMeta;
}
