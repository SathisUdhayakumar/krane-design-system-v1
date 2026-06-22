"use client"

import * as React from "react"
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Per-column filter configuration — TanStack Table's own typed `meta` extension
// point (DATATABLE_ADVANCED_FOUNDATION.md §5), narrowed to three variants that
// match every named Krane column shape, not Material React Table's full seven.
type DataTableFilterVariant = "text" | "select" | "dateRange"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: DataTableFilterVariant
    filterOptions?: { label: string; value: string }[]
    filterLabel?: string
  }
}

function dateRangeFilterFn(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: { from?: string; to?: string }
) {
  if (!filterValue?.from && !filterValue?.to) return true
  const raw = row.getValue(columnId)
  const date = raw instanceof Date ? raw : new Date(raw as string)
  if (filterValue.from && date < new Date(filterValue.from)) return false
  if (filterValue.to && date > new Date(filterValue.to)) return false
  return true
}

export interface DataTableBulkAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive"
  onAction: (rows: TData[]) => void | Promise<void>
}

// The serialization contract for future Saved Views support
// (DATATABLE_ADVANCED_FOUNDATION.md §6) — DataTable owns no concept of a
// "saved view" (no name, no list, no persistence). It only ever reports this
// snapshot and accepts one back as `initialState`; naming/storing/switching
// between snapshots is a separate, future, product-level concern.
export interface DataTableState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  globalFilter: string
  density: "compact" | "comfortable"
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  getRowId?: (row: TData) => string
  className?: string

  density?: "compact" | "comfortable"

  enableRowSelection?: boolean
  bulkActions?: DataTableBulkAction<TData>[]

  /** Per-row actions menu. Reuses DataTableBulkAction's exact shape — onAction
   *  is called with a single-element array, the same signature bulk actions
   *  already use, rather than a second, parallel action type. */
  rowActions?: (row: TData) => DataTableBulkAction<TData>[] | undefined
  positionActionsColumn?: "first" | "last"

  enableGlobalFilter?: boolean
  globalFilterPlaceholder?: string
  /** Controlled global filter value — pass this + onGlobalFilterChange to filter server-side. */
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void

  isLoading?: boolean
  loadingRowCount?: number
  /** Override for both empty-state cases. For the no-data vs. filtered-to-zero
   *  distinction (DATATABLE_ADVANCED_FOUNDATION.md §7), prefer noResultsState. */
  emptyState?: React.ReactNode
  /** Shown specifically when filters/search matched zero rows of real data —
   *  distinct from emptyState, which also covers the true "no data at all" case. */
  noResultsState?: React.ReactNode

  /** When true, DataTable stops sorting client-side and only reports sort changes via onSortingChange. */
  manualSorting?: boolean
  /** When true, DataTable stops filtering client-side — pair with a controlled `globalFilter`. */
  manualFiltering?: boolean
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void

  /** Infinite-scroll-ready: render a "Load more" affordance when there's more data than is loaded.
   *  Independent of `enablePagination` below — a table uses one or the other, not both. */
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void

  /** Numbered-pages pagination (DATATABLE_ADVANCED_FOUNDATION.md §1) — a second,
   *  independent presentation over the same kind of underlying page state, not a
   *  replacement for Load More. Opt-in; existing tables are unaffected. */
  enablePagination?: boolean
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  /** Server-side: supply one of these when manualPagination is true. */
  pageCount?: number
  rowCount?: number
  manualPagination?: boolean
  pageSizeOptions?: number[]

  /** Saved-views serialization contract (§6) — read-only snapshot + re-apply hook. */
  initialState?: Partial<DataTableState>
  onTableStateChange?: (state: DataTableState) => void
}

const SELECT_COLUMN_ID = "__select__"
const ROW_ACTIONS_COLUMN_ID = "__row_actions__"

function DataTable<TData>({
  columns,
  data,
  getRowId,
  className,
  density = "comfortable",
  enableRowSelection = false,
  bulkActions = [],
  rowActions,
  positionActionsColumn = "last",
  enableGlobalFilter = true,
  globalFilterPlaceholder = "Search…",
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  isLoading = false,
  loadingRowCount = 5,
  emptyState,
  noResultsState,
  manualSorting = false,
  manualFiltering = false,
  sorting: controlledSorting,
  onSortingChange,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  enablePagination = false,
  pagination: controlledPagination,
  onPaginationChange,
  pageCount,
  rowCount,
  manualPagination = false,
  pageSizeOptions = [10, 25, 50],
  initialState,
  onTableStateChange,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    initialState?.sorting ?? []
  )
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialState?.columnVisibility ?? {}
  )
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState(
    initialState?.globalFilter ?? ""
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState?.columnFilters ?? []
  )
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  })

  const sorting = controlledSorting ?? internalSorting
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
  const pagination = controlledPagination ?? internalPagination

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      setInternalSorting(next)
      onSortingChange?.(next)
    },
    [sorting, onSortingChange]
  )

  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setInternalGlobalFilter(value)
      onGlobalFilterChange?.(value)
    },
    [onGlobalFilterChange]
  )

  const handlePaginationChange = React.useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      setInternalPagination(next)
      onPaginationChange?.(next)
    },
    [pagination, onPaginationChange]
  )

  const columnPinning = React.useMemo(() => {
    const left: string[] = []
    const right: string[] = []
    if (enableRowSelection) left.push(SELECT_COLUMN_ID)
    if (rowActions) {
      if (positionActionsColumn === "first") left.push(ROW_ACTIONS_COLUMN_ID)
      else right.push(ROW_ACTIONS_COLUMN_ID)
    }
    return { left, right }
  }, [enableRowSelection, rowActions, positionActionsColumn])

  const tableColumns = React.useMemo<ColumnDef<TData>[]>(() => {
    let cols = columns.map((col) =>
      col.meta?.filterVariant === "dateRange" ? { ...col, filterFn: dateRangeFilterFn } : col
    )

    if (enableRowSelection) {
      const selectColumn: ColumnDef<TData> = {
        id: SELECT_COLUMN_ID,
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            aria-label={`Select row ${row.id}`}
          />
        ),
      }
      cols = [selectColumn, ...cols]
    }

    if (rowActions) {
      const actionsColumn: ColumnDef<TData> = {
        id: ROW_ACTIONS_COLUMN_ID,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const actions = rowActions(row.original)
          if (!actions || actions.length === 0) return null
          return <DataTableRowActionsMenu row={row.original} actions={actions} />
        },
      }
      cols = positionActionsColumn === "first" ? [actionsColumn, ...cols] : [...cols, actionsColumn]
    }

    return cols
  }, [columns, enableRowSelection, rowActions, positionActionsColumn])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      globalFilter,
      columnFilters,
      columnPinning,
      pagination,
    },
    getRowId,
    enableRowSelection,
    manualSorting,
    manualFiltering,
    manualPagination,
    pageCount: manualPagination
      ? pageCount ?? (rowCount ? Math.ceil(rowCount / pagination.pageSize) : -1)
      : undefined,
    rowCount: manualPagination ? rowCount : undefined,
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  })

  React.useEffect(() => {
    onTableStateChange?.({ sorting, columnFilters, columnVisibility, globalFilter, density })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting, columnFilters, columnVisibility, globalFilter, density])

  const rows = table.getRowModel().rows
  const visibleLeafColumnCount = table.getVisibleLeafColumns().length
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
  const isFilteredEmpty =
    !isLoading && rows.length === 0 && data.length > 0 && Boolean(globalFilter || columnFilters.length > 0)
  const isTrulyEmpty = !isLoading && rows.length === 0 && data.length === 0

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {enableRowSelection && selectedRows.length > 0 ? (
        <DataTableBulkActions
          selectedRows={selectedRows}
          actions={bulkActions}
          onClearSelection={() => table.resetRowSelection()}
        />
      ) : (
        <DataTableToolbar
          table={table}
          enableGlobalFilter={enableGlobalFilter}
          globalFilter={globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          searchPlaceholder={globalFilterPlaceholder}
        />
      )}

      <DataTableFilters table={table} />

      <Table density={density}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortDir = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={
                      canSort
                        ? sortDir === "asc"
                          ? "ascending"
                          : sortDir === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    style={getPinnedStyle(header.column)}
                    className={getPinnedClassName(header.column, "bg-muted")}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className="-mx-2 flex items-center gap-1 rounded-sm px-2 py-1 select-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortDir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : sortDir === "desc" ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                        )}
                      </button>
                    ) : header.isPlaceholder ? null : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: loadingRowCount }, (_, i) => (
              <TableRow key={`loading-${i}`}>
                {Array.from({ length: visibleLeafColumnCount }, (_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isTrulyEmpty ? (
            <TableRow>
              <TableCell colSpan={visibleLeafColumnCount} className="p-0">
                {emptyState ?? <DataTableEmptyState />}
              </TableCell>
            </TableRow>
          ) : isFilteredEmpty ? (
            <TableRow>
              <TableCell colSpan={visibleLeafColumnCount} className="p-0">
                {noResultsState ?? emptyState ?? (
                  <DataTableEmptyState
                    title="No results match your filters"
                    description="Try a different search term or clear your filters."
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleGlobalFilterChange("")
                          table.resetColumnFilters()
                        }}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                )}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleLeafColumnCount} className="p-0">
                {emptyState ?? <DataTableEmptyState />}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} data-selected={row.getIsSelected() ? "true" : "false"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={getPinnedStyle(cell.column)}
                    className={getPinnedClassName(cell.column, "bg-background")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <Loader2 className="animate-spin" />}
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      {enablePagination && (
        <DataTablePagination table={table} rowCount={rowCount} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}

// Pinned columns need an opaque background — sticky cells sit above scrolled
// content, so a transparent/semi-transparent background would let it bleed
// through. A flat color is used regardless of hover/selected row state, a
// deliberate, accepted simplification (DATATABLE_ADVANCED_FOUNDATION.md §9) —
// the row's own non-pinned cells already carry that signal clearly.
function getPinnedStyle<TData>(column: Column<TData, unknown>): React.CSSProperties {
  const pinned = column.getIsPinned()
  if (!pinned) return {}
  return {
    position: "sticky",
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: 1,
  }
}

function getPinnedClassName<TData>(
  column: Column<TData, unknown>,
  bgClassName: string
): string | undefined {
  const pinned = column.getIsPinned()
  if (!pinned) return undefined
  const isEdge =
    pinned === "left" ? column.getIsLastColumn("left") : column.getIsFirstColumn("right")
  return cn(
    bgClassName,
    isEdge && pinned === "left" && "shadow-[2px_0_4px_-2px_rgb(0_0_0_/_0.1)]",
    isEdge && pinned === "right" && "shadow-[-2px_0_4px_-2px_rgb(0_0_0_/_0.1)]"
  )
}

function DataTableToolbar<TData>({
  table,
  enableGlobalFilter,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder,
}: {
  table: TanstackTable<TData>
  enableGlobalFilter: boolean
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  searchPlaceholder: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {enableGlobalFilter ? (
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring"
          />
        </div>
      ) : (
        <div />
      )}
      <DataTableColumnVisibility table={table} />
    </div>
  )
}

function DataTableColumnVisibility<TData>({ table }: { table: TanstackTable<TData> }) {
  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide())

  if (hideableColumns.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal /> Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            onSelect={(event) => event.preventDefault()}
          >
            {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DataTableFilters<TData>({ table }: { table: TanstackTable<TData> }) {
  const filterableColumns = table
    .getAllColumns()
    .filter((column) => Boolean(column.columnDef.meta?.filterVariant) && column.getCanFilter())

  if (filterableColumns.length === 0) return null

  const hasActiveFilters = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterableColumns.map((column) => {
        const meta = column.columnDef.meta!
        const label =
          meta.filterLabel ??
          (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)

        if (meta.filterVariant === "select") {
          const value = (column.getFilterValue() as string) ?? "__all__"
          return (
            <Select
              key={column.id}
              value={value}
              onValueChange={(next) => column.setFilterValue(next === "__all__" ? undefined : next)}
            >
              <SelectTrigger size="sm" className="w-[160px]">
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {label}</SelectItem>
                {meta.filterOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }

        if (meta.filterVariant === "dateRange") {
          const value = (column.getFilterValue() as { from?: string; to?: string }) ?? {}
          return (
            <div key={column.id} className="flex items-center gap-1.5">
              <Input
                type="date"
                size="sm"
                value={value.from ?? ""}
                onChange={(event) =>
                  column.setFilterValue({ ...value, from: event.target.value || undefined })
                }
                className="w-[150px]"
                aria-label={`${label} from`}
              />
              <span className="text-sm text-muted-foreground" aria-hidden="true">
                –
              </span>
              <Input
                type="date"
                size="sm"
                value={value.to ?? ""}
                onChange={(event) =>
                  column.setFilterValue({ ...value, to: event.target.value || undefined })
                }
                className="w-[150px]"
                aria-label={`${label} to`}
              />
            </div>
          )
        }

        return (
          <Input
            key={column.id}
            size="sm"
            placeholder={label}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value || undefined)}
            className="w-[160px]"
            aria-label={label}
          />
        )
      })}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

function DataTableRowActionsMenu<TData>({
  row,
  actions,
}: {
  row: TData
  actions: DataTableBulkAction<TData>[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Row actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            variant={action.variant === "destructive" ? "destructive" : "default"}
            onSelect={() => action.onAction([row])}
          >
            {action.icon && <action.icon className="size-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DataTablePagination<TData>({
  table,
  rowCount,
  pageSizeOptions,
}: {
  table: TanstackTable<TData>
  rowCount?: number
  pageSizeOptions: number[]
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(table.getPageCount(), 1)
  const totalRows = rowCount ?? table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
          <SelectTrigger size="sm" className="w-[68px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Page {pageIndex + 1} of {pageCount} · {totalRows} total
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

function DataTableBulkActions<TData>({
  selectedRows,
  actions,
  onClearSelection,
}: {
  selectedRows: TData[]
  actions: DataTableBulkAction<TData>[]
  onClearSelection: () => void
}) {
  const [pendingLabel, setPendingLabel] = React.useState<string | null>(null)

  async function handleAction(action: DataTableBulkAction<TData>) {
    setPendingLabel(action.label)
    try {
      await action.onAction(selectedRows)
    } finally {
      setPendingLabel(null)
    }
  }

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-accent px-3 py-2"
    >
      <p className="text-sm font-medium" role="status">
        {selectedRows.length} selected
      </p>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            variant={action.variant === "destructive" ? "destructive" : "outline"}
            onClick={() => handleAction(action)}
            disabled={pendingLabel !== null}
          >
            {pendingLabel === action.label ? (
              <Loader2 className="animate-spin" />
            ) : (
              action.icon && <action.icon className="size-4" />
            )}
            {action.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={onClearSelection} disabled={pendingLabel !== null}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function DataTableEmptyState({
  title = "No results",
  description,
  action,
  className,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-10 text-center",
        className
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}

export {
  DataTable,
  DataTableToolbar,
  DataTableColumnVisibility,
  DataTableFilters,
  DataTableBulkActions,
  DataTableEmptyState,
  DataTablePagination,
}
export type { DataTableFilterVariant }
