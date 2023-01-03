import type { Option } from '../types/ui';

const PRESERVE_LABEL: {[key: string]: boolean} = {
	teaType: true,
	ingredients: true
};

function isOption(value: FormDataEntryValue) {
	try {
		const parsed = JSON.parse(value as string);
		return (parsed as Object).hasOwnProperty('label');
	} catch (err) {
		return false;
	}
}

function toOptionValue(value: FormDataEntryValue) {
	const parsed = JSON.parse(value as string) as Option;
	return parsed.value;
}

function isOptionList(value: FormDataEntryValue) {
	try {
		const parsed = JSON.parse(value as string);
		if (!Array.isArray(parsed)) {
			return false;
		}
		return (parsed as Option[])[0].hasOwnProperty('label');
	} catch (err) {
		return false;
	}
}

function toOptionListValues(value: FormDataEntryValue) {
	const parsed = JSON.parse(value as string) as Option[];
	return parsed.map(option => option.value);
}

function toOptionListLabels(value: FormDataEntryValue) {
	const parsed = JSON.parse(value as string) as Option[];
	return parsed.map(option => option.label);
}

export function reshapeFormData(formData: FormData) {
	const data = Object.fromEntries(formData);
	const normalized = {} as {[key: string]: any};

	for (const key in data) {
		const value = data[key];

		/*if (ObjectId.isValid(value as string)) {
			console.log({value, matched: 'object id'})
			normalized[key] = new ObjectId(value as string);
		}*/

		if (PRESERVE_LABEL[key]) {
			normalized[key] = toOptionListLabels(value);
		} else if (value === '[]') {
			// console.log({value, matched: 'empty array'})
			normalized[key] = [];
		} else if (isOption(value)) {
			// console.log({value, matched: 'is option'})
			normalized[key] = toOptionValue(value);
		} else if (isOptionList(value)) {
			// console.log({value, matched: 'is option list'})
			normalized[key] = toOptionListValues(value);
		} else if ((value as string).startsWith('[')) {
			normalized[key] = JSON.parse(value as string);
		} else {
			// console.log({value, matched: 'default'})
			normalized[key] = value;
		}
	}

	return normalized;
}