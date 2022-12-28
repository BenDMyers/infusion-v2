import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';
import i18n from 'astro-i18next';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: netlify(),
	integrations: [
		i18n(),
	]
});