import type { ReactNode } from "react"

export type columnType = "date" | "text" | "currency"
type align = "start" | "center" | "end"
export interface IColumn<T> {
  title?: string
  name: string
  maxSize?: number
  minSize?: number
  type?: columnType
  bold?: boolean
  align?: align
  classname?: string
  onRender?: (item: T) => ReactNode | string | number
}

export interface IPagination {
  totalCount: number
  currentPage: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export interface IListProps {
  columns: IColumn<any>[]
  items: any[]
  loading?: boolean
  isTitle: boolean
  pointer?: boolean
  isScreenSmall?: boolean
  emptyMessage: string
  pagination?: IPagination
  onClick?: (index: string | number) => void
}
