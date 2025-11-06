import { useState } from "react"
import { Search, Filter, MoreVertical } from "lucide-react"
import type { ILandRegistration } from "./LandRegistration.types"
import { IColumn } from "../../components/List/List.types"
import List from "../../components/List"

const LandRegistration = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [registrations] = useState<ILandRegistration[]>([
    { id: "2", name: "Lote Centro", status: "active" },
    { id: "3", name: "Área Rural Norte", status: "active" },
  ])

  const filteredRegistrations = registrations.filter((reg) =>
    reg.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const columns: IColumn<ILandRegistration>[] = [
    {
      title: "Name",
      name: "name",
      type: "text",
      align: "start",
      bold: false,
    },
    {
      title: "Status",
      name: "status",
      maxSize: 120,
      align: "center",
      onRender: (item: ILandRegistration) => (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#22c55e]">
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
      title: "Actions",
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
      <div className="bg-[#22c55e] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <h1 className="text-xl font-semibold whitespace-nowrap">Matrículas</h1>

            <div className="relative flex-1 max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button className="p-2 text-white hover:bg-white/20 rounded-md transition-colors">
                <Filter className="h-5 w-5" />
              </button>
            </div>

            <button className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#22c55e] hover:bg-white/90 font-medium text-sm rounded-md transition-colors whitespace-nowrap">
              NOVO
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <List
          columns={columns}
          items={filteredRegistrations}
          isTitle={true}
          loading={loading}
          emptyMessage="Nenhuma matrícula encontrada"
          pointer={false}
        />
      </div>
    </div>
  )
}

export default LandRegistration