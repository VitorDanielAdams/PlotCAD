import { Loader2 } from "lucide-react";
import { useState } from "react";
import UserManagementApi from "../../../api/UserManagement";
import Modal from "../../../components/Modal";
import type { IUserResponse } from "../../../types/users.types";

interface IChangePasswordModalProps {
	user: IUserResponse | null;
	onClose: () => void;
	onSaved: () => void;
}

const { changePassword } = UserManagementApi();

const inputClass =
	"w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

const ChangePasswordModal = ({ user, onClose, onSaved }: IChangePasswordModalProps) => {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	const handleSubmit = async () => {
		setFormError(null);
		if (!newPassword.trim()) {
			setFormError("A nova senha é obrigatória.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setFormError("As senhas não coincidem.");
			return;
		}
		if (newPassword.length < 6) {
			setFormError("A senha deve ter pelo menos 6 caracteres.");
			return;
		}

		setFormLoading(true);
		try {
			const response = await changePassword(user!.id, { newPassword });
			if (!response.success) {
				setFormError(response.message);
				return;
			}
			onSaved();
			onClose();
		} finally {
			setFormLoading(false);
		}
	};

	const handleClose = () => {
		setNewPassword("");
		setConfirmPassword("");
		setFormError(null);
		onClose();
	};

	return (
		<Modal
			isOpen={!!user}
			title="Alterar Senha"
			subtitle={user?.name}
			onClose={handleClose}
			footer={
				<>
					<button
						onClick={handleClose}
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
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Nova Senha
					</label>
					<input
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className={inputClass}
						placeholder="Nova senha"
						autoFocus
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Confirmar Senha
					</label>
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className={inputClass}
						placeholder="Confirme a nova senha"
					/>
				</div>
			</div>
		</Modal>
	);
};

export default ChangePasswordModal;
