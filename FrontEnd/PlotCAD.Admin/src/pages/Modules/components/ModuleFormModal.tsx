import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../../components/Modal/Modal";
import type { ICreateModuleRequest, IModule } from "../../../types/backoffice.types";

interface IModuleFormModalProps {
	modal: { mode: "create" | "edit"; module?: IModule } | null;
	onClose: () => void;
	onSaved: () => void;
	onCreate: (data: ICreateModuleRequest) => Promise<{ success: boolean; message: string }>;
	onUpdate: (id: number, data: { name: string; description?: string }) => Promise<{ success: boolean; message: string }>;
}

const inputClass =
	"w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

const ModuleFormModal = ({ modal, onClose, onSaved, onCreate, onUpdate }: IModuleFormModalProps) => {
	const [formData, setFormData] = useState<ICreateModuleRequest>({
		code: "",
		name: "",
		description: "",
	});
	const [formError, setFormError] = useState<string | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		if (!modal) return;
		if (modal.mode === "edit" && modal.module) {
			setFormData({
				code: modal.module.code,
				name: modal.module.name,
				description: modal.module.description ?? "",
			});
		} else {
			setFormData({ code: "", name: "", description: "" });
		}
		setFormError(null);
	}, [modal]);

	const handleSubmit = async () => {
		setFormError(null);
		if (!formData.code.trim()) {
			setFormError("Código é obrigatório.");
			return;
		}
		if (!formData.name.trim()) {
			setFormError("Nome é obrigatório.");
			return;
		}

		setFormLoading(true);
		try {
			let result;
			if (modal?.mode === "create") {
				result = await onCreate(formData);
			} else if (modal?.mode === "edit" && modal.module) {
				result = await onUpdate(modal.module.id, {
					name: formData.name,
					description: formData.description,
				});
			}
			if (result && !result.success) {
				setFormError(result.message);
				return;
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
			title={modal?.mode === "create" ? "Novo Módulo" : "Editar Módulo"}
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
					<label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
					<input
						type="text"
						value={formData.code}
						onChange={(e) => setFormData({ ...formData, code: e.target.value })}
						className={inputClass}
						placeholder="ex: land_draw"
						disabled={modal?.mode === "edit"}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						className={inputClass}
						placeholder="Nome do módulo"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Descrição <span className="text-gray-400 font-normal">(opcional)</span>
					</label>
					<textarea
						value={formData.description ?? ""}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						className={inputClass}
						placeholder="Descrição do módulo"
						rows={3}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default ModuleFormModal;
