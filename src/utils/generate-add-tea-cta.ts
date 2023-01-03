import type { WithId } from 'mongodb';
import type { Brand, Tea } from '../types/api';
import { choose } from './choose';

/**
 * CTA messages which can be used for brands that don't
 * have any teas added yet.
 */
const EMPTY_BRAND_MESSAGES = [
	`It's awfully empty here. Add a tea?`,
	`%s doesn't have any teas yet! Would you like to add one?`,
	`Whoops! %s doesn't have any teas yet. Add a tea!`,
	`Boy, %s could sure use some teas. Add a tea?`
];

/**
 * CTA messages which can be used for brands that already
 * have at least one tea added.
 */
const ADD_ANOTHER_MESSAGES = [
	`That's all for %s! Add another tea?`,
	`Hmm... seems like %s could use some more teas. Add one?`,
	`Go on, add another tea! I dare you!`,
	`Huh. I thought %s had more teas than that. Add another?`,
	`Have you tried anything else from %s? Add it now!`,
	`These teas are so lonely :(  Add another?`,
	`Whoops! That's the end of %s. Add another tea?`,
];

/**
 * CTA messages which can be used regardless of the brand's
 * tea count.
 */
const EVERGREEN_MESSAGES = [
	`🎵 Fantasy %s, where all your dreams come true. Got a tea for you! 🎵`,
	`Beep boop. Add a tea 🤖`
];

export function generateAddTeaCta(brand: WithId<Brand>, teas: WithId<Tea>[]) {
	const availableMessages = teas.length === 0 ?
		[...EVERGREEN_MESSAGES, ...EMPTY_BRAND_MESSAGES] :
		[...EVERGREEN_MESSAGES, ...ADD_ANOTHER_MESSAGES];

	const chosenMessage = choose(availableMessages)
		.replaceAll('%s', brand.name);
	return chosenMessage;
}