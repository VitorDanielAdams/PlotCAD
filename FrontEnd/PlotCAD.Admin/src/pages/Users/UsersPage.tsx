import { MoreVertical, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import UserApi from "../../api/User";
import List from "../../components/List/List";
import { IColumn } from "../../components/List/List.types";
import type { IUser } from "../../types/user.types";

const { listUsers, toggleActive, updateRole } = UserApi();

const ROLES: Array<"Admin" | "Manager" | "Employee"> = ["Admin", "Manager", "Employee"];

const UsersPage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [users, setUsers] = useState<IUser[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const [roleModal, setRoleModal] = useState<{ user: IUser } | null>(null);
	const [selectedRole, setSelectedRole] = useState<"Admin" | "Manager" | "Employee">("Employee");

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

	const fetchUsers = useCallback(
		async (pageNumber: number, size: number, search: string) => {
			setLoading(true);
			try {
				const response = await listUsers({
					page: pageNumber,
					pageSize: size,
					search: search.trim() || undefined,
				});
				if (response.success && response.data) {
					setTotalCount(response.data.totalCount);
					setUsers(response.data.items);
				}
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchUsers(page, pageSize, debouncedSearch);
	}, [page, pageSize, debouncedSearch]);

	const handleToggleActive = async (user: IUser) => {
		setOpenMenuId(null);
		await toggleActive(user.id);
		fetchUsers(page, pageSize, debouncedSearch);
	};

	const handleOpenRoleModal = (user: IUser) => {
		setOpenMenuId(null);
		setSelectedRole((ROLES.includes(user.role as "Admin" | "Manager" | "Employee") ? user.role : "Employee") as "Admin" | "Manager" | "Employee");
		setRoleModal({ user });
	};

	const handleUpdateRole = async () => {
		if (!roleModal) return;
		await updateRole(roleModal.user.id, { role: selectedRole });
		setRoleModal(null);
		fetchUsers(page, pageSize, debouncedSearch);
	};

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPage(1);
	};

	const columns: IColumn<IUser>[] = [
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
			title: "Tenant",
			name: "tenantName",
			type: "text",
			align: "start",
		},
		{
			title: "Role",
			name: "role",
			maxSize: 100,
			align: "center",
			onRender: (item: IUser) => (
				<span
					className={`px-2 py-0.5 rounded text-xs font-medium ${
						item.role === "Admin"
							? "bg-purple-100 text-purple-700"
							: item.role === "Manager"
								? "bg-blue-100 text-blue-700"
								: "bg-gray-100 text-gray-700"
					}`}
				>
					{item.role}
				</span>
			),
		},
		{
			title: "Status",
			name: "isActive",
			maxSize: 90,
			align: "center",
			onRender: (item: IUser) => (
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
			onRender: (item: IUser) => (
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
									onClick={() => handleToggleActive(item)}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
								>
									{item.isActive ? "Desativar" : "Ativar"}
								</button>
								<button
									onClick={() => handleOpenRoleModal(item)}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
								>
									Alterar Role
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
						<h1 className="text-xl font-semibold whitespace-nowrap">Usuários</h1>

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
					items={users}
					isTitle={true}
					loading={loading}
					emptyMessage="Nenhum usuário encontrado"
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

			{roleModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50" onClick={() => setRoleModal(null)} />
					<div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-4">
							Alterar Role - {roleModal.user.name}
						</h3>
						<select
							value={selectedRole}
							onChange={(e) => setSelectedRole(e.target.value as "Admin" | "Manager" | "Employee")}
							className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						>
							{ROLES.map((role) => (
								<option key={role} value={role}>
									{role}
								</option>
							))}
						</select>
						<div className="flex justify-end gap-2 mt-4">
							<button
								onClick={() => setRoleModal(null)}
								className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
							>
								Cancelar
							</button>
							<button
								onClick={handleUpdateRole}
								className="px-4 py-2 text-sm bg-[#15803d] text-white rounded-md hover:bg-[#166534] transition-colors"
							>
								Salvar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UsersPage;
