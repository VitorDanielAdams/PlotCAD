import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import EmployeeApi from "../../../api/Employee";
import Modal from "../../../components/Modal";
import type { ICreateEmployeeRequest, IEmployee } from "../../../types/employee.types";

interface IEmployeeFormModalProps {
	modal: { mode: "create" | "edit"; employee?: IEmployee } | null;
	onClose: () => void;
	onSaved: () => void;
}

const { createEmployee, updateEmployee } = EmployeeApi();

const inputClass =
	"w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

const EmployeeFormModal = ({ modal, onClose, onSaved }: IEmployeeFormModalProps) => {
	const [formData, setFormData] = useState<ICreateEmployeeRequest>({
		name: "",
		phone: "",
		email: "",
		position: "",
	});
	const [formError, setFormError] = useState<string | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		if (!modal) return;
		if (modal.mode === "edit" && modal.employee) {
			setFormData({
				name: modal.employee.name,
				phone: modal.employee.phone ?? "",
				email: modal.employee.email ?? "",
				position: modal.employee.position ?? "",
			});
		} else {
			setFormData({ name: "", phone: "", email: "", position: "" });
		}
		setFormError(null);
	}, [modal]);

	const handleSubmit = async () => {
		setFormError(null);
		if (!formData.name.trim()) {
			setFormError("Nome é obrigatório.");
			return;
		}

		setFormLoading(true);
		try {
			if (modal?.mode === "create") {
				const response = await createEmployee(formData);
				if (!response.success) {
					setFormError(response.message);
					return;
				}
			} else if (modal?.mode === "edit" && modal.employee) {
				const response = await updateEmployee(modal.employee.id, {
					name: formData.name,
					phone: formData.phone,
					email: formData.email,
					position: formData.position,
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
			title={modal?.mode === "create" ? "Novo Funcionário" : "Editar Funcionário"}
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
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Telefone <span className="text-gray-400 font-normal">(opcional)</span>
					</label>
					<input
						type="text"
						value={formData.phone ?? ""}
						onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
						className={inputClass}
						placeholder="(00) 00000-0000"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email <span className="text-gray-400 font-normal">(opcional)</span>
					</label>
					<input
						type="email"
						value={formData.email ?? ""}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						className={inputClass}
						placeholder="email@exemplo.com"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Cargo <span className="text-gray-400 font-normal">(opcional)</span>
					</label>
					<input
						type="text"
						value={formData.position ?? ""}
						onChange={(e) => setFormData({ ...formData, position: e.target.value })}
						className={inputClass}
						placeholder="Ex: Técnico, Engenheiro..."
					/>
				</div>
			</div>
		</Modal>
	);
};

export default EmployeeFormModal;
