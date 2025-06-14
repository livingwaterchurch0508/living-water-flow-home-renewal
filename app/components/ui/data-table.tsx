import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  ColumnSizingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Input } from './input';
import { cn } from '@/app/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: React.ReactNode;
  className?: string;
  onRowSelectionChange?: (selectedRowIds: string[]) => void;
}

export function DataTable<TData, TValue>({ columns, data, toolbar, className, onRowSelectionChange }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnSizing,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      // Simple global filter: checks if any cell includes the filter value
      return Object.values(row.original as Record<string, unknown>).some((v) =>
        String(v).toLowerCase().includes(String(filterValue).toLowerCase())
      );
    },
    enableRowSelection: true,
  });

  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(Object.keys(rowSelection));
    }
  }, [rowSelection, onRowSelectionChange]);

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        {toolbar}
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="rounded-md border w-full max-w-full overflow-x-auto h-[calc(100vh-450px)]">
        <table className="min-w-fit divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-900">
            {table.getHeaderGroups().map((headerGroup) => {
              const lastIdx = headerGroup.headers.length - 1;
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, idx) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={idx === lastIdx ? { width: 'auto' } : { width: header.getSize() }}
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider select-none cursor-pointer sticky top-0 z-10 bg-gray-50 dark:bg-zinc-900 whitespace-nowrap overflow-hidden text-ellipsis group"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ▲'}
                      {header.column.getIsSorted() === 'desc' && ' ▼'}
                      {header.column.getCanResize && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none z-20"
                          style={{ userSelect: 'none' }}
                        >
                          <div className="w-1 h-full bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              );
            })}
          </thead>
          <tbody className="bg-white dark:bg-zinc-950 divide-y divide-gray-100 dark:divide-zinc-900">
            {table.getRowModel().rows.map((row) => {
              const lastIdx = row.getVisibleCells().length - 1;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20' : '',
                    'hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer'
                  )}
                  onClick={e => {
                    if (e.ctrlKey || e.metaKey) {
                      row.toggleSelected();
                    } else {
                      table.setRowSelection({ [row.id]: true });
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      style={idx === lastIdx ? { width: 'auto' } : { width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                      className="px-4 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} rows
        </div>
      </div>
    </div>
  );
} 