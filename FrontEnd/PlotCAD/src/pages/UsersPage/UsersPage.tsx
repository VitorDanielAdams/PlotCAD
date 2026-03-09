import { MoreVertical, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import UserManagementApi from "../../api/UserManagement";
import List from "../../components/List";
import { IColumn } from "../../components/List/List.types";
import useAuth from "../../contexts/hooks/useAuth";
import type { IPlanInfoResponse, IUserResponse } from "../../types/users.types";
import ChangePasswordModal from "./components/ChangePasswordModal";
import UserFormModal from "./components/UserFormModal";

const { getPlanInfo, listUsers, toggleActive, deleteUser } = UserManagementApi();

const UsersPage = () => {
	const { user: currentUser } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [users, setUsers] = useState<IUserResponse[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [planInfo, setPlanInfo] = useState<IPlanInfoResponse | null>(null);

	const [modal, setModal] = useState<{
		mode: "create" | "edit";
		user?: IUserResponse;
		prefill?: { name: string; role: string };
	} | null>(null);

	const [changePasswordUser, setChangePasswordUser] = useState<IUserResponse | null>(
		null,
	);

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
		async (pageNumber: number, size: number, name: string) => {
			setLoading(true);
			try {
				const response = await listUsers({
					pageNumber,
					pageSize: size,
					filter: name.trim() ? { name: name.trim() } : undefined,
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

	const fetchPlanInfo = useCallback(async () => {
		const response = await getPlanInfo();
		if (response.success && response.data) {
			setPlanInfo(response.data);
		}
	}, []);

	useEffect(() => {
		fetchPlanInfo();
	}, []);

	useEffect(() => {
		fetchUsers(page, pageSize, debouncedSearch);
	}, [page, pageSize, debouncedSearch]);

	const handleSaved = () => {
		fetchUsers(page, pageSize, debouncedSearch);
		fetchPlanInfo();
	};

	const handleToggleActive = async (user: IUserResponse) => {
		setOpenMenuId(null);
		await toggleActive(user.id);
		fetchUsers(page, pageSize, debouncedSearch);
	};

	const handleDelete = async (user: IUserResponse) => {
		setOpenMenuId(null);
		await deleteUser(user.id);
		fetchUsers(page, pageSize, debouncedSearch);
		fetchPlanInfo();
	};

	const handleDuplicate = (user: IUserResponse) => {
		setOpenMenuId(null);
		setModal({
			mode: "create",
			prefill: { name: `${user.name} (Cópia)`, role: user.role },
		});
	};

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPage(1);
	};

	const isManager = currentUser?.role === "Manager";

	const columns: IColumn<IUserResponse>[] = [
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
			title: "Perfil",
			name: "role",
			maxSize: 120,
			align: "center",
			type: "text",
		},
		{
			title: "Status",
			name: "isActive",
			maxSize: 90,
			align: "center",
			onRender: (item: IUserResponse) => (
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
			onRender: (item: IUserResponse) => {
				const isSelf = item.id === currentUser?.id;
				return (
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
											setModal({ mode: "edit", user: item });
										}}
										className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
									>
										Editar
									</button>
									{isManager && (
										<button
											onClick={() => {
												setOpenMenuId(null);
												setChangePasswordUser(item);
											}}
											className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
										>
											Alterar Senha
										</button>
									)}
									{!isSelf && (
										<button
											onClick={() => handleToggleActive(item)}
											className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
										>
											{item.isActive ? "Desativar" : "Ativar"}
										</button>
									)}
									<button
										onClick={() => handleDuplicate(item)}
										className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
									>
										Duplicar
									</button>
									{!isSelf && (
										<button
											onClick={() => handleDelete(item)}
											className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
										>
											Excluir
										</button>
									)}
								</div>
							</>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<div className="bg-[#15803d] text-white">
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
					<div className="flex items-center justify-between gap-3 md:gap-6 flex-wrap">
						<h1 className="text-xl font-semibold whitespace-nowrap">Usuários</h1>

						<div className="relative flex-1 max-w-full sm:max-w-md w-full sm:w-auto order-3 sm:order-none">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
							<input
								type="text"
								placeholder="Buscar por nome"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
							/>
						</div>

						<button
							className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#15803d] hover:bg-white/90 font-medium text-sm rounded-md transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => setModal({ mode: "create" })}
							disabled={planInfo !== null && !planInfo.canAddUsers}
						>
							NOVO
						</button>
					</div>
				</div>
			</div>

			{planInfo && (
				<div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
					<div
						className={`text-sm px-4 py-2 rounded-md border ${
							planInfo.canAddUsers
								? "bg-green-50 border-green-200 text-green-800"
								: "bg-yellow-50 border-yellow-200 text-yellow-800"
						}`}
					>
						{planInfo.currentUsers} / {planInfo.maxUsers} usuários utilizados
						{!planInfo.canAddUsers && " — limite do plano atingido"}
					</div>
				</div>
			)}

			<div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
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

			<UserFormModal modal={modal} onClose={() => setModal(null)} onSaved={handleSaved} />

			<ChangePasswordModal
				user={changePasswordUser}
				onClose={() => setChangePasswordUser(null)}
				onSaved={handleSaved}
			/>
		</div>
	);
};

export default UsersPage;
