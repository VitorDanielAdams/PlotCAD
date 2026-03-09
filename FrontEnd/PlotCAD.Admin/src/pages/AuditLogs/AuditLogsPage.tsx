import { Search } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import AuditApi from "../../api/Audit";
import List from "../../components/List/List";
import { IColumn } from "../../components/List/List.types";
import type { IAuditLog } from "../../types/backoffice.types";

const { list } = AuditApi();

const AuditLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const fetchLogs = useCallback(
    async (pageNumber: number, size: number, action: string) => {
      setLoading(true);
      try {
        const response = await list({
          page: pageNumber,
          pageSize: size,
          action: action.trim() || undefined,
        });
        if (response.success && response.data) {
          setTotalCount(response.data.totalCount);
          setLogs(response.data.items);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchLogs(page, pageSize, debouncedSearch);
  }, [page, pageSize, debouncedSearch]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const columns: IColumn<IAuditLog>[] = [
    {
      title: "Data",
      name: "createdAt",
      maxSize: 160,
      align: "start",
      onRender: (item: IAuditLog) => (
        <span className="text-xs text-gray-500">
          {moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "Manager",
      name: "managerName",
      maxSize: 160,
      align: "start",
      onRender: (item: IAuditLog) => (
        <span className="text-sm">{item.managerName ?? "Sistema"}</span>
      ),
    },
    {
      title: "Ação",
      name: "action",
      maxSize: 200,
      align: "start",
      onRender: (item: IAuditLog) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {item.action}
        </span>
      ),
    },
    {
      title: "Entidade",
      name: "entityType",
      maxSize: 120,
      align: "center",
      type: "text",
    },
    {
      title: "ID",
      name: "entityId",
      maxSize: 200,
      align: "start",
      onRender: (item: IAuditLog) => (
        <span className="text-xs text-gray-500 font-mono truncate">
          {item.entityId}
        </span>
      ),
    },
    {
      title: "IP",
      name: "ipAddress",
      maxSize: 140,
      align: "center",
      onRender: (item: IAuditLog) => (
        <span className="text-xs text-gray-400">{item.ipAddress ?? "-"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#15803d] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-3 md:gap-6 flex-wrap">
            <h1 className="text-xl font-semibold whitespace-nowrap">
              Audit Log
            </h1>

            <div className="relative flex-1 max-w-full sm:max-w-md w-full sm:w-auto order-3 sm:order-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
              <input
                type="text"
                placeholder="Filtrar por ação"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <List
          columns={columns}
          items={logs}
          isTitle={true}
          loading={loading}
          emptyMessage="Nenhum registro encontrado"
          pointer={false}
          pagination={{
            totalCount,
            currentPage: page,
            pageSize,
            pageSizeOptions: [20, 50, 100],
            onPageChange: setPage,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;
