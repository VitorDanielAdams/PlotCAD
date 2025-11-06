import type React from "react"
import moment from "moment"
import { MdError } from "react-icons/md"
import type { IColumn, IListProps, columnType } from "./List.types"
import Loading from "../Loading"

function List(props: IListProps) {
  const { columns, items, pointer = false, loading, onChangePage, onClick } = props

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    if (target.scrollHeight - target.scrollTop <= target.clientHeight) {
      onChangePage && onChangePage()
    }
  }

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" onScroll={handleScroll}>
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
    </div>
  )
}

export default List