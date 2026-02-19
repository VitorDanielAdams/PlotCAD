import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Filter, MoreVertical } from "lucide-react"
import type { ILandRegistration } from "./LandRegistration.types"
import { IColumn } from "../../components/List/List.types"
import List from "../../components/List"
import { listLands } from "../../api/Land"
import { useNavigate } from "react-router-dom"

const LandRegistration = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [registrations, setRegistrations] = useState<ILandRegistration[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const fetchLands = useCallback(async (pageNumber: number, size: number, name: string) => {
    setLoading(true)
    try {
      const response = await listLands({
        pageNumber,
        pageSize: size,
        filter: name.trim() ? { name: name.trim() } : undefined,
      })
      if (response?.data) {
        const data = response.data as { totalCount: number; items: ILandRegistration[] }
        setTotalCount(data.totalCount)
        setRegistrations(data.items)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLands(page, pageSize, debouncedSearch)
  }, [page, pageSize, debouncedSearch])

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const columns: IColumn<ILandRegistration>[] = [
    {
      title: "Nome",
      name: "name",
      type: "text",
      align: "start",
      bold: false,
    },
    {
      title: "Matrícula",
      name: "registrationNumber",
      maxSize: 140,
      align: "center",
      type: "text",
    },
    {
      title: "Localização",
      name: "location",
      type: "text",
      align: "start",
    },
    {
      title: "Área (m²)",
      name: "totalArea",
      maxSize: 120,
      align: "center",
      type: "text",
    },
    {
      title: "Status",
      name: "isActive",
      maxSize: 100,
      align: "center",
      onRender: (item: ILandRegistration) => (
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full ${item.isActive ? "bg-[#22c55e]" : "bg-gray-300"}`}
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      ),
    },
    {
      title: "Ações",
      name: "id",
      maxSize: 80,
      align: "center",
      onRender: (item: ILandRegistration) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenuId(openMenuId === item.id ? null : item.id)
            }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {openMenuId === item.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <button
                  onClick={() => {
                    console.log("Visualizar", item.id)
                    setOpenMenuId(null)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Visualizar
                </button>
                <button
                  onClick={() => {
                    console.log("Editar", item.id)
                    setOpenMenuId(null)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    console.log("Excluir", item.id)
                    setOpenMenuId(null)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#15803d] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <h1 className="text-xl font-semibold whitespace-nowrap">Matrículas</h1>

            <div className="relative flex-1 max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Buscar por nome"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button className="p-2 text-white hover:bg-white/20 rounded-md transition-colors">
                <Filter className="h-5 w-5" />
              </button>
            </div>

            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#15803d] hover:bg-white/90 font-medium text-sm rounded-md transition-colors whitespace-nowrap"
              onClick={() => navigate("/v1/nova-matricula")}
            >
              NOVO
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <List
          columns={columns}
          items={registrations}
          isTitle={true}
          loading={loading}
          emptyMessage="Nenhuma matrícula encontrada"
          pointer={false}
          pagination={{
            totalCount,
            currentPage: page,
            pageSize,
            pageSizeOptions: [10, 20, 50],
            onPageChange: setPage,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
    </div>
  )
}

export default LandRegistration
