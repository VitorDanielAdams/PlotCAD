import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModuleApi from "../../api/Module";
import TenantApi from "../../api/Tenant";
import Modal from "../../components/Modal/Modal";
import { ITenantModule } from "../../types/backoffice.types";
import type {
	IUpdateTenantSubscriptionRequest,
	ITenant,
	PlanType,
	TSubscriptionStatus,
} from "../../types/tenant.types";

const { getTenant, updateSubscription } = TenantApi();
const { getTenantModules, setTenantModule } = ModuleApi();

const STATUS_LABELS: Record<TSubscriptionStatus, string> = {
	Trial: "Trial",
	Active: "Ativo",
	Expired: "Expirado",
	Suspended: "Suspenso",
};

const STATUS_COLORS: Record<TSubscriptionStatus, string> = {
	Trial: "bg-yellow-100 text-yellow-700",
	Active: "bg-green-100 text-green-700",
	Expired: "bg-red-100 text-red-700",
	Suspended: "bg-gray-100 text-gray-600",
};

const PLAN_LABELS: Record<PlanType, string> = {
	Individual: "Individual",
	Company: "Empresa",
};

const inputClass =
	"w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

const TenantDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [tenant, setTenant] = useState<ITenant | null>(null);
	const [modules, setModules] = useState<ITenantModule[]>([]);
	const [loading, setLoading] = useState(true);
	const [toggling, setToggling] = useState<number | null>(null);
	const [subscriptionModal, setSubscriptionModal] = useState(false);
	const [formData, setFormData] = useState<IUpdateTenantSubscriptionRequest>({});
	const [formLoading, setFormLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const fetchTenant = async () => {
		if (!id) return;
		const response = await getTenant(id);
		if (response.success && response.data) {
			setTenant(response.data);
		}
	};

	const fetchModules = async () => {
		if (!id) return;
		const response = await getTenantModules(id);
		if (response.success && response.data) {
			setModules(response.data);
		}
	};

	useEffect(() => {
		const init = async () => {
			await Promise.all([fetchTenant(), fetchModules()]);
			setLoading(false);
		};
		init();
	}, [id]);

	const handleToggleModule = async (moduleId: number, currentEnabled: boolean) => {
		if (!id) return;
		setToggling(moduleId);
		await setTenantModule(id, { moduleId, isEnabled: !currentEnabled });
		await fetchModules();
		setToggling(null);
	};

	const openSubscriptionModal = () => {
		if (!tenant) return;
		setFormData({
			subscriptionStatus: tenant.subscriptionStatus,
			planType: tenant.planType,
			maxUsers: tenant.maxUsers,
			subscriptionExpiresAt: tenant.subscriptionExpiresAt ?? undefined,
		});
		setFormError(null);
		setSubscriptionModal(true);
	};

	const handleSubscriptionSave = async () => {
		if (!id) return;
		setFormError(null);
		setFormLoading(true);
		try {
			const response = await updateSubscription(id, formData);
			if (!response.success) {
				setFormError(response.message);
				return;
			}
			await fetchTenant();
			setSubscriptionModal(false);
		} finally {
			setFormLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-64px)]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-light" />
			</div>
		);
	}

	if (!tenant) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-64px)]">
				<p className="text-gray-500">Tenant não encontrado</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="bg-[#15803d] text-white">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center gap-4">
						<button
							onClick={() => navigate("/tenants")}
							className="p-1 hover:bg-white/10 rounded transition-colors"
						>
							<ArrowLeft className="h-5 w-5" />
						</button>
						<h1 className="text-xl font-semibold">{tenant.name}</h1>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-sm font-semibold text-gray-900">Assinatura</h2>
						<button
							onClick={openSubscriptionModal}
							className="px-3 py-1.5 text-sm bg-[#15803d] text-white rounded-md hover:bg-[#166534] transition-colors"
						>
							Editar
						</button>
					</div>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-gray-500">Plano</span>
							<p className="text-gray-900 mt-0.5">{PLAN_LABELS[tenant.planType]}</p>
						</div>
						<div>
							<span className="text-gray-500">Status</span>
							<div className="mt-0.5">
								<span
									className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[tenant.subscriptionStatus]}`}
								>
									{STATUS_LABELS[tenant.subscriptionStatus]}
								</span>
							</div>
						</div>
						<div>
							<span className="text-gray-500">Máx. Usuários</span>
							<p className="text-gray-900 mt-0.5">{tenant.maxUsers}</p>
						</div>
						<div>
							<span className="text-gray-500">Usuários Cadastrados</span>
							<p className="text-gray-900 mt-0.5">{tenant.userCount}</p>
						</div>
						{tenant.subscriptionExpiresAt && (
							<div>
								<span className="text-gray-500">Expira em</span>
								<p className="text-gray-900 mt-0.5">
									{new Date(tenant.subscriptionExpiresAt).toLocaleDateString("pt-BR")}
								</p>
							</div>
						)}
						<div>
							<span className="text-gray-500">Criado em</span>
							<p className="text-gray-900 mt-0.5">
								{new Date(tenant.createdAt).toLocaleDateString("pt-BR")}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h2 className="text-sm font-semibold text-gray-900 mb-4">Módulos</h2>
					{modules.length === 0 ? (
						<p className="text-sm text-gray-500">Nenhum módulo configurado</p>
					) : (
						<div className="space-y-3">
							{modules.map((mod) => (
								<div
									key={mod.moduleId}
									className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
								>
									<div>
										<p className="text-sm font-medium text-gray-900">{mod.moduleName}</p>
										<p className="text-xs text-gray-400">{mod.moduleCode}</p>
									</div>
									<button
										onClick={() => handleToggleModule(mod.moduleId, mod.isEnabled)}
										disabled={toggling === mod.moduleId}
										className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
											mod.isEnabled ? "bg-[#22c55e]" : "bg-gray-300"
										}`}
									>
										<span
											className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
												mod.isEnabled ? "translate-x-6" : "translate-x-1"
											}`}
										/>
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<Modal
				isOpen={subscriptionModal}
				title="Editar Assinatura"
				subtitle={tenant.name}
				onClose={() => setSubscriptionModal(false)}
				footer={
					<>
						<button
							onClick={() => setSubscriptionModal(false)}
							className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
						>
							Cancelar
						</button>
						<button
							onClick={handleSubscriptionSave}
							disabled={formLoading}
							className="flex items-center gap-2 px-4 py-2 text-sm bg-[#15803d] text-white rounded-md hover:bg-[#166534] transition-colors disabled:opacity-50"
						>
							{formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar
						</button>
					</>
				}
			>
				<div className="space-y-4">
					{formError && (
						<p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
							{formError}
						</p>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
						<select
							value={formData.subscriptionStatus ?? ""}
							onChange={(e) =>
								setFormData({
									...formData,
									subscriptionStatus: e.target.value as TSubscriptionStatus,
								})
							}
							className={inputClass}
						>
							<option value="Trial">Trial</option>
							<option value="Active">Ativo</option>
							<option value="Expired">Expirado</option>
							<option value="Suspended">Suspenso</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
						<select
							value={formData.planType ?? ""}
							onChange={(e) =>
								setFormData({ ...formData, planType: e.target.value as PlanType })
							}
							className={inputClass}
						>
							<option value="Individual">Individual</option>
							<option value="Company">Empresa</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Máx. Usuários</label>
						<input
							type="number"
							min={1}
							value={formData.maxUsers ?? ""}
							onChange={(e) =>
								setFormData({ ...formData, maxUsers: Number(e.target.value) })
							}
							className={inputClass}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Expiração{" "}
							<span className="text-gray-400 font-normal">(opcional)</span>
						</label>
						<input
							type="date"
							value={
								formData.subscriptionExpiresAt
									? formData.subscriptionExpiresAt.split("T")[0]
									: ""
							}
							onChange={(e) =>
								setFormData({
									...formData,
									subscriptionExpiresAt: e.target.value
										? new Date(e.target.value).toISOString()
										: undefined,
								})
							}
							className={inputClass}
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default TenantDetailPage;
