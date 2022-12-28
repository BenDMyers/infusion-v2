export type ApiRouteBody = {
	/** Upstream data */
	data?: object,
	/** Map of form field names to associated error messages */
	errors?: {[key: string]: string},
	/** Route to redirect to */
	goto?: string,
	/** General message */
	msg?: string,
};