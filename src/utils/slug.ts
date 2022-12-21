import removeAccents from 'remove-accents';

const SPACES = / /g;
const NONALPHANUMERIC = /[^A-Za-z0-9-]/g;
const MULTIPLE_HYPHENS = /--+/g;

export function sluggify(name: string) {
	if (!name) {
		return '';
	}

	const slug = removeAccents(name)
		.trim()
		.toLowerCase()
		.replace(SPACES, '-')
		.replace(NONALPHANUMERIC, '')
		.replace(MULTIPLE_HYPHENS, '-');

	return slug;
}