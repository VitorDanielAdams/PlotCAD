import moment from "moment"
import { MdError } from "react-icons/md"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { IColumn, IListProps, columnType } from "./List.types"
import Loading from "../Loading"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]

function buildPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | "...")[] = [1]
  const left = currentPage - 1
  const right = currentPage + 1

  if (left > 2) pages.push("...")
  for (let p = Math.max(2, left); p <= Math.min(totalPages - 1, right); p++) {
    pages.push(p)
  }
  if (right < totalPages - 1) pages.push("...")
  pages.push(totalPages)
  return pages
}

function List(props: IListProps) {
  const { columns, items, pointer = false, loading, pagination, onClick } = props

  const handleOnClick = (value: boolean | undefined, index: number) => {
    if (value === true && onClick) {
      onClick(index)
    } else if (value === undefined && onClick) {
      onClick(index)
    }
  }

  const convertColumnType = (type: columnType, item: any) => {
    if (type === "text") return <p className="truncate">{item}</p>
    if (type === "currency")
      return <p className="truncate">{item.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}</p>
    if (type === "date") return moment(item).format("DD/MM/YYYY")
    return item
  }

  const renderColumn = (item: any, column: IColumn<any>) => {
    if (column.onRender) {
      if (typeof column.onRender(item) === "string") {
        return <p className="truncate">{column.onRender(item)}</p>
      }
      return column.onRender(item)
    }
    if (column.type) {
      return convertColumnType(column.type, item[column.name])
    }
    return item[column.name]
  }

  const gridCols = columns
    .map((col) => {
      if (col.maxSize) {
        return `${col.maxSize}px`
      }
      return "1fr"
    })
    .join(" ")

  const totalPages = pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : 0
  const pageNumbers = pagination ? buildPageNumbers(pagination.currentPage, totalPages) : []
  const pageSizeOptions = pagination?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS

  const firstItem = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0
  const lastItem = pagination ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="grid gap-4 px-6 py-3" style={{ gridTemplateColumns: gridCols }}>
          {columns.map((column, index) => (
            <div
              key={index}
              className="text-sm font-medium text-gray-700 flex items-center"
              style={{
                justifyContent:
                  column.align === "center" ? "center" : column.align === "end" ? "flex-end" : "flex-start",
              }}
            >
              {column.title}
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {items.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <MdError size={40} />
            <span>{props.emptyMessage || "Nenhum item encontrado"}</span>
          </div>
        )}

        {loading && (
          <div className="px-6 py-12 flex justify-center items-center">
            <Loading size={5} />
          </div>
        )}

        {!loading &&
          items.length > 0 &&
          items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className={`grid gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${pointer ? "cursor-pointer" : ""}`}
              style={{ gridTemplateColumns: gridCols }}
              onClick={() => handleOnClick(pointer, item.id ? item.id : itemIndex)}
            >
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="text-sm text-gray-900 flex items-center"
                  style={{
                    fontWeight: column.bold ? "bold" : "normal",
                    justifyContent:
                      column.align === "center" ? "center" : column.align === "end" ? "flex-end" : "flex-start",
                  }}
                >
                  {renderColumn(item, column)}
                </div>
              ))}
            </div>
          ))}
      </div>

      {pagination && pagination.totalCount > 0 && !loading && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              {firstItem}–{lastItem} de {pagination.totalCount}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">por página:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1 text-sm text-gray-400 select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.onPageChange(p as number)}
                  className={`min-w-[32px] px-2 py-1 rounded text-sm font-medium transition-colors ${
                    p === pagination.currentPage
                      ? "bg-green-700 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
              className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
