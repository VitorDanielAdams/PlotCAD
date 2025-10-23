export interface IResponse<T> {
	success: string;
	message: string;
	data: T | unknown;
	errors: [string];
}
