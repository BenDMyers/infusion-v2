export function field(name: string) {
	return {
		name,
		id: name,
		autocomplete: 'off',
		'aria-describedby': `${name}-error`,
		'data-lpignore': 'true'
	};
}