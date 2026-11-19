import { useState } from 'react';

export function usePagination(count: number, initialSize: number, filterKey: string) {
  const [selection, setSelection] = useState({ page: 1, filterKey });
  const [pageSize, setPageSize] = useState(initialSize);
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const page = selection.filterKey === filterKey ? Math.min(selection.page, pages) : 1;
  const setPage = (page: number) => setSelection({ page, filterKey });
  const resize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };
  return { page, setPage, pages, pageSize, resize, offset: (page - 1) * pageSize };
}
