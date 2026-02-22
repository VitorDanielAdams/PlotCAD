import { Filter, Loader2, MoreVertical, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLandById, listLands } from "../../api/Land";
import KmlExportModal from "../../components/KmlExportModal";
import List from "../../components/List";
import { IColumn } from "../../components/List/List.types";
import type {
	CardinalDirection,
	IKmlSegment,
	ILandDetail,
	ILandListItem,
} from "../../types/land.types";

const LandRegistration = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [registrations, setRegistrations] = useState<ILandListItem[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);

	const [kmlModal, setKmlModal] = useState<{
		segments: IKmlSegment[];
		name: string;
		isClosed: boolean;
	} | null>(null);
	const [kmlLoadingId, setKmlLoadingId] = useState<number | null>(null);

	const navigate = useNavigate();
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

	const fetchLands = useCallback(
		async (pageNumber: number, size: number, name: string) => {
			setLoading(true);
			try {
				const response = await listLands({
					pageNumber,
					pageSize: size,
					filter: name.trim() ? { name: name.trim() } : undefined,
				});
				if (response?.data) {
					const data = response.data as { totalCount: number; items: ILandListItem[] };
					setTotalCount(data.totalCount);
					setRegistrations(data.items);
				}
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchLands(page, pageSize, debouncedSearch);
	}, [page, pageSize, debouncedSearch]);

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPage(1);
	};

	const handleExportKml = async (item: ILandListItem) => {
		setOpenMenuId(null);
		setKmlLoadingId(item.id);
		try {
			const response = await getLandById(item.id);
			const land = response?.data as ILandDetail;
			if (!land) return;
			const segments: IKmlSegment[] = land.segments.map((s) => ({
				from: s.fromDirection as CardinalDirection,
				to: s.toDirection as CardinalDirection,
				degrees: s.degrees,
				minutes: s.minutes,
				seconds: s.seconds,
				distance: s.distance,
			}));
			setKmlModal({ segments, name: land.name, isClosed: land.isClosed });
		} finally {
			setKmlLoadingId(null);
		}
	};

	const columns: IColumn<ILandListItem>[] = [
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
			onRender: (item: ILandListItem) => (
				<div
					className={`flex items-center justify-center w-6 h-6 rounded-full ${
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
			onRender: (item: ILandListItem) => (
				<div className="relative">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setOpenMenuId(openMenuId === item.id ? null : item.id);
						}}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
					>
						{kmlLoadingId === item.id ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<MoreVertical className="h-4 w-4" />
						)}
					</button>
					{openMenuId === item.id && (
						<>
							<div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
							<div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
								<button
									onClick={() => {
										console.log("Visualizar", item.id);
										setOpenMenuId(null);
									}}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
								>
									Visualizar
								</button>
								<button
									onClick={() => {
										console.log("Editar", item.id);
										setOpenMenuId(null);
									}}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
								>
									Editar
								</button>
								<button
									onClick={() => handleExportKml(item)}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
								>
									Exportar KML
								</button>
								<button
									onClick={() => {
										console.log("Excluir", item.id);
										setOpenMenuId(null);
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
	];

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
			<KmlExportModal
				isOpen={kmlModal !== null}
				onClose={() => setKmlModal(null)}
				segments={kmlModal?.segments ?? []}
				landName={kmlModal?.name ?? ""}
				isClosed={kmlModal?.isClosed ?? false}
			/>
		</div>
	);
};

export default LandRegistration;
