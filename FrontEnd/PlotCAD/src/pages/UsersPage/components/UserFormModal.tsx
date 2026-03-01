import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import UserManagementApi from "../../../api/UserManagement";
import Modal from "../../../components/Modal";
import type { ICreateUserRequest, IUserResponse } from "../../../types/users.types";

interface IUserFormModalProps {
	modal: { mode: "create" | "edit"; user?: IUserResponse } | null;
	onClose: () => void;
	onSaved: () => void;
}

const ROLES = ["Admin", "Manager", "Employee"];

const { createUser, updateUser } = UserManagementApi();

const inputClass =
	"w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

const UserFormModal = ({ modal, onClose, onSaved }: IUserFormModalProps) => {
	const [formData, setFormData] = useState<ICreateUserRequest>({
		name: "",
		email: "",
		password: "",
		role: "Employee",
	});
	const [formError, setFormError] = useState<string | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		if (!modal) return;
		if (modal.mode === "edit" && modal.user) {
			setFormData({
				name: modal.user.name,
				email: modal.user.email,
				password: "",
				role: modal.user.role,
			});
		} else {
			setFormData({ name: "", email: "", password: "", role: "Employee" });
		}
		setFormError(null);
	}, [modal]);

	const handleSubmit = async () => {
		setFormError(null);
		if (!formData.name.trim() || !formData.email.trim()) {
			setFormError("Nome e email são obrigatórios.");
			return;
		}
		if (modal?.mode === "create" && !formData.password.trim()) {
			setFormError("Senha é obrigatória.");
			return;
		}

		setFormLoading(true);
		try {
			if (modal?.mode === "create") {
				const response = await createUser(formData);
				if (!response.success) {
					setFormError(response.message);
					return;
				}
			} else if (modal?.mode === "edit" && modal.user) {
				const response = await updateUser(modal.user.id, {
					name: formData.name,
					email: formData.email,
					role: formData.role,
				});
				if (!response.success) {
					setFormError(response.message);
					return;
				}
			}
			onSaved();
			onClose();
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Modal
			isOpen={!!modal}
			title={modal?.mode === "create" ? "Novo Usuário" : "Editar Usuário"}
			onClose={onClose}
			footer={
				<>
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
					>
						Cancelar
					</button>
					<button
						onClick={handleSubmit}
						disabled={formLoading}
						className="flex items-center gap-2 px-4 py-2 text-sm bg-[#15803d] text-white rounded-md hover:bg-[#166534] transition-colors disabled:opacity-50"
					>
						{formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
						{modal?.mode === "create" ? "Criar" : "Salvar"}
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
					<label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						className={inputClass}
						placeholder="Nome completo"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
					<input
						type="email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						className={inputClass}
						placeholder="email@exemplo.com"
					/>
				</div>

				{modal?.mode === "create" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
						<input
							type="password"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							className={inputClass}
							placeholder="Senha de acesso"
						/>
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
					<select
						value={formData.role}
						onChange={(e) => setFormData({ ...formData, role: e.target.value })}
						className={inputClass}
					>
						{ROLES.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
				</div>
			</div>
		</Modal>
	);
};

export default UserFormModal;
