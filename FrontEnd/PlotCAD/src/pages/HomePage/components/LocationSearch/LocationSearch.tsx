import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";

interface NominatimResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
	boundingbox: [string, string, string, string];
	type: string;
}

export default function LocationSearch() {
	const map = useMap();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<NominatimResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const search = useCallback(async (q: string) => {
		if (q.trim().length < 3) {
			setResults([]);
			return;
		}

		setLoading(true);
		try {
			const params = new URLSearchParams({
				q,
				format: "json",
				limit: "5",
				countrycodes: "br",
				addressdetails: "0",
			});
			const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
				headers: { "Accept-Language": "pt-BR" },
			});
			const data: NominatimResult[] = await res.json();
			setResults(data);
			setOpen(data.length > 0);
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleInputChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => search(value), 400);
	};

	const handleSelect = (result: NominatimResult) => {
		const lat = parseFloat(result.lat);
		const lng = parseFloat(result.lon);
		map.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
		setQuery(result.display_name.split(",")[0]);
		setOpen(false);
		setResults([]);
	};

	const handleClear = () => {
		setQuery("");
		setResults([]);
		setOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	return (
		<div ref={containerRef} className="w-48 sm:w-72">
			<div className="relative">
				<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
				<input
					type="text"
					value={query}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={() => results.length > 0 && setOpen(true)}
					placeholder="Buscar localização..."
					className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400"
				/>
				{loading && (
					<Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
				)}
				{!loading && query && (
					<button
						onClick={handleClear}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				)}
			</div>

			{open && results.length > 0 && (
				<div className="mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
					{results.map((r) => (
						<button
							key={r.place_id}
							onClick={() => handleSelect(r)}
							className="flex flex-col w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
						>
							<span className="text-xs text-gray-900 font-medium truncate w-full">
								{r.display_name.split(",")[0]}
							</span>
							<span className="text-[10px] text-gray-400 truncate w-full">
								{r.display_name.split(",").slice(1).join(",").trim()}
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
