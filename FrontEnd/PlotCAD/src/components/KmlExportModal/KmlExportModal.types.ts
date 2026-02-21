import type { IKmlSegment } from "../../types/land.types"

export interface IKmlExportModalProps {
  isOpen: boolean
  onClose: () => void
  segments: IKmlSegment[]
  landName: string
  isClosed?: boolean
}
