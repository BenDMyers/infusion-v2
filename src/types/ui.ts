export type Detail = {
	name: string,
	value: any | any[]
}

export type DetailList = Detail[];

export type Availability = 'available' | 'unavailable' | 'leaving';

export type Option = {
	label: string,
	subtitle?: string,
	value: string,
};