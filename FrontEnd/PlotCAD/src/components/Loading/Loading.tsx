import { ILoadingProps } from "./Loading.types";

const Loading: React.FC<ILoadingProps> = (props: ILoadingProps) => {
	const loadingStyle = {
		width: `${props.size && props.size * 10}px`,
		height: `${props.size && props.size * 10}px`,
	};
	return (
		<div className="w-screen h-screen flex items-center justify-center">
			<div
				className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-light"
				style={loadingStyle}
			/>
		</div>
	);
};

export default Loading;
