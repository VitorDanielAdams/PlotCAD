import { MoreVertical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ModuleApi from "../../api/Module";
import type { IModule } from "../../types/backoffice.types";
import ModuleFormModal from "./components/ModuleFormModal";

const { getAll, create, update, toggleActive } = ModuleApi();

const ModulesPage = () => {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<IModule[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    module?: IModule;
  } | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAll();
      if (response.success && response.data) {
        setModules(response.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, []);

  const handleToggleActive = async (mod: IModule) => {
    setOpenMenuId(null);
    setMenuPosition(null);
    await toggleActive(mod.id);
    fetchModules();
  };

  const handleCreate = async (data: {
    code: string;
    name: string;
    description?: string;
  }) => {
    const response = await create(data);
    return { success: response.success, message: response.message };
  };

  const handleUpdate = async (
    id: number,
    data: { name: string; description?: string },
  ) => {
    const response = await update(id, data);
    return { success: response.success, message: response.message };
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#15803d] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            <h1 className="text-xl font-semibold whitespace-nowrap">Módulos</h1>

            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#15803d] hover:bg-white/90 font-medium text-sm rounded-md transition-colors whitespace-nowrap"
              onClick={() => setModal({ mode: "create" })}
            >
              NOVO
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-light" />
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum módulo encontrado
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      mod.isActive ? "bg-[#22c55e]" : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {mod.name}
                    </p>
                    <p className="text-xs text-gray-400">{mod.code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {mod.description && (
                    <span className="text-xs text-gray-400 max-w-[300px] truncate hidden md:block">
                      {mod.description}
                    </span>
                  )}
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (openMenuId === mod.id) {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            top: rect.bottom + 4,
                            right: window.innerWidth - rect.right,
                          });
                          setOpenMenuId(mod.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === mod.id && menuPosition && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => {
                            setOpenMenuId(null);
                            setMenuPosition(null);
                          }}
                        />
                        <div
                          className="fixed w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                          style={{
                            top: menuPosition.top,
                            right: menuPosition.right,
                          }}
                        >
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setMenuPosition(null);
                              setModal({ mode: "edit", module: mod });
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(mod)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {mod.isActive ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModuleFormModal
        modal={modal}
        onClose={() => setModal(null)}
        onSaved={fetchModules}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ModulesPage;
