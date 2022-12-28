import {t} from 'i18next';

export function interpolate(i18nKey: string, substitutions: {[key: string]: string}) {
	let translation = t(i18nKey);
	for (const placeholder in substitutions) {
		translation = translation.replaceAll(
			`{{${placeholder}}}`,
			substitutions[placeholder]
		);
	}
	return translation;
}