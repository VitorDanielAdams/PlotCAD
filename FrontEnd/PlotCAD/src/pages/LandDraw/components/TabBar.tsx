type ActiveTab = "segments" | "registration"

interface Props {
  activeTab: ActiveTab
  onChange: (tab: ActiveTab) => void
}

const TabBar = ({ activeTab, onChange }: Props) => (
  <div className="flex border-b border-gray-200 bg-white">
    <button
      onClick={() => onChange("segments")}
      className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
        activeTab === "segments"
          ? "text-green-700 border-b-2 border-green-600"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      Segmentos
    </button>
    <button
      onClick={() => onChange("registration")}
      className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
        activeTab === "registration"
          ? "text-green-700 border-b-2 border-green-600"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      Matrícula
    </button>
  </div>
)

export default TabBar
