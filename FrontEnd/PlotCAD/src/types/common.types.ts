export interface IResponse<T> {
	success: boolean;
	message: string;
	data: T | null;
	errors: string[];
	httpStatus?: number;
}
