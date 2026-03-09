import { MoreVertical, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TenantApi from "../../api/Tenant";
import List from "../../components/List/List";
import { IColumn } from "../../components/List/List.types";
import type { ITenant } from "../../types/tenant.types";

const { listTenants } = TenantApi();

const TenantsPage = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [tenants, setTenants] = useState<ITenant[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

	const fetchTenants = useCallback(
		async (pageNumber: number, size: number, search: string) => {
			setLoading(true);
			try {
				const response = await listTenants({
					page: pageNumber,
					pageSize: size,
					search: search.trim() || undefined,
				});
				if (response.success && response.data) {
					setTotalCount(response.data.totalCount);
					setTenants(response.data.items);
				}
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchTenants(page, pageSize, debouncedSearch);
	}, [page, pageSize, debouncedSearch]);

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPage(1);
	};

	const columns: IColumn<ITenant>[] = [
		{
			title: "Nome",
			name: "name",
			type: "text",
			align: "start",
		},
		{
			title: "Email",
			name: "email",
			type: "text",
			align: "start",
		},
		{
			title: "Plano",
			name: "planType",
			maxSize: 120,
			align: "center",
			type: "text",
		},
		{
			title: "Usuários",
			name: "userCount",
			maxSize: 100,
			align: "center",
			onRender: (item: ITenant) => (
				<span>
					{item.activeUserCount}/{item.userCount}
				</span>
			),
		},
		{
			title: "Status",
			name: "isActive",
			maxSize: 90,
			align: "center",
			onRender: (item: ITenant) => (
				<div
					className={`flex items-center justify-center w-6 h-6 rounded-full mx-auto ${
						item.isActive ? "bg-[#22c55e]" : "bg-gray-300"
					}`}
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
						<path d="M5 13l4 4L19 7" />
					</svg>
				</div>
			),
		},
		{
			title: "Ações",
			name: "id",
			maxSize: 80,
			align: "center",
			onRender: (item: ITenant) => (
				<div className="relative">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setOpenMenuId(openMenuId === item.id ? null : item.id);
						}}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
					>
						<MoreVertical className="h-4 w-4" />
					</button>
					{openMenuId === item.id && (
						<>
							<div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
							<div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20">
								<button
									onClick={() => {
										setOpenMenuId(null);
										navigate(`/tenants/${item.id}`);
									}}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
								>
									Ver detalhes
								</button>
							</div>
						</>
					)}
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<div className="bg-[#15803d] text-white">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between gap-6">
						<h1 className="text-xl font-semibold whitespace-nowrap">Tenants</h1>

						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
							<input
								type="text"
								placeholder="Buscar por nome ou email"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-6">
				<List
					columns={columns}
					items={tenants}
					isTitle={true}
					loading={loading}
					emptyMessage="Nenhum tenant encontrado"
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
	);
};

export default TenantsPage;
