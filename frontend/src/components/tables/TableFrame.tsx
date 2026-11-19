import type { ReactNode } from 'react';
import { Group, Pagination, Select, Table, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { number } from '../../utils/format';
import styles from './Tables.module.css';

export function TableFrame({ label, minWidth, children }: { label: string; minWidth: number; children: ReactNode }) {
  return <div className={styles.scroll} tabIndex={0} role="region" aria-label={label}>
    <Table aria-label={label} className={styles.table} miw={minWidth} verticalSpacing={10} horizontalSpacing={14}>
      {children}
    </Table>
  </div>;
}

export function TableFooter({ total, offset, page, pageSize, pages, setPage, resize, pageSizes }: {
  total: number; offset: number; page: number; pageSize: number; pages: number;
  setPage: (page: number) => void; resize: (size: number) => void; pageSizes: number[];
}) {
  return <div className={styles.footer}>
    <Text size="xs" c="dimmed" aria-live="polite">
      {total > 0 ? 'Showing ' + number(offset + 1) + '–' + number(Math.min(offset + pageSize, total)) + ' of ' + number(total) : '0 results'}
    </Text>
    <Group gap={10} wrap="wrap">
      {total > 0 && <Select size="xs" value={String(pageSize)} data={pageSizes.map((size) => ({ value: String(size), label: size + ' / page' }))}
        allowDeselect={false} onChange={(value) => { if (value) resize(Number(value)); }} aria-label="Rows per page"
        w={94} rightSection={<IconChevronDown size={13} />} />}
      {pages > 1 && <Pagination total={pages} value={page} onChange={setPage} size="xs" siblings={0} boundaries={1}
        getControlProps={(control) => ({ 'aria-label': control + ' page' })}
        getItemProps={(item) => ({ 'aria-label': 'Page ' + item, 'aria-current': item === page ? 'page' : undefined })}
        aria-label="Table pagination" />}
    </Group>
  </div>;
}
