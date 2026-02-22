import type { IRegistration } from "../../LandDraw.types";

interface Props {
	registration: IRegistration;
	updateRegistration: (field: keyof IRegistration, value: string) => void;
}

const inputClass =
	"w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent placeholder:text-gray-300";

const RegistrationTab = ({ registration, updateRegistration }: Props) => (
	<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
		<div>
			<label className="block text-xs font-medium text-gray-500 mb-1">
				Nome da matrícula
			</label>
			<input
				type="text"
				value={registration.name}
				onChange={(e) => updateRegistration("name", e.target.value)}
				placeholder="ex: Fazenda São João"
				className={inputClass}
			/>
		</div>
		<div>
			<label className="block text-xs font-medium text-gray-500 mb-1">
				Número de registro
			</label>
			<input
				type="text"
				value={registration.registrationNumber}
				onChange={(e) => updateRegistration("registrationNumber", e.target.value)}
				placeholder="ex: 00.000.000-0"
				className={`${inputClass} font-mono`}
			/>
		</div>
		<div>
			<label className="block text-xs font-medium text-gray-500 mb-1">Localização</label>
			<input
				type="text"
				value={registration.location}
				onChange={(e) => updateRegistration("location", e.target.value)}
				placeholder="ex: Município, Estado"
				className={inputClass}
			/>
		</div>
		<div>
			<label className="block text-xs font-medium text-gray-500 mb-1">
				Cliente / Serviço
			</label>
			<input
				type="text"
				value={registration.client}
				onChange={(e) => updateRegistration("client", e.target.value)}
				placeholder="ex: João da Silva"
				className={inputClass}
			/>
		</div>
		<div>
			<label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
			<textarea
				value={registration.notes}
				onChange={(e) => updateRegistration("notes", e.target.value)}
				placeholder="Informações adicionais..."
				rows={4}
				className={`${inputClass} resize-none`}
			/>
		</div>
	</div>
);

export default RegistrationTab;
