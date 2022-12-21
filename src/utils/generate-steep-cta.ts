import type { WithId } from 'mongodb';
import type { Steep, Tea } from '../types/api';
import {isToday, isWithinInterval} from 'date-fns';
import { chooseWeighted } from './choose';

type WeightedOption = {
	message: string;
	weight: number;
};

export function generateSteepCta(tea: WithId<Tea>, steeps: WithId<Steep>[]) {
	const today = new Date();
	const year = today.getFullYear();

	const isValentinesDay = isToday(new Date(year, 1, 14));
	const isChristmastime = isWithinInterval(today, {
		start: new Date(year, 11, 18),
		end: new Date(year, 11, 26)
	});

	const isEarlGrey = tea.name.includes('Earl Grey') || tea.name.includes('EG');

	const options: WeightedOption[] = [
		// Evergreen messages
		{message: `Steep it. Steep it good!`, weight: 1},
		{message: `Oh, this one's a steeper.`, weight: 1},
		{message: `You can log this one, but the price will be... steep. 😎`, weight: 1},
		{message: `Steep or steep not. There is no try.`, weight: 1},
		{message: `You are the 1,000,000th visitor! Log a steep of ${tea.name} now!`, weight: 1},
		{message: `Ooh, look at you, all fancy with your ${tea.name}! Wanna log it?`, weight: 1},
		{message: `Ah, the ${tea.name}. Good choice!`, weight: 1},
		{message: `Ah, a fine ${tea.name}. I admire your taste!`, weight: 1},
		{message: `Did the ${tea.name} hit the spot?`, weight: 1},
		{message: `For posterity's sake: what did you think about the ${tea.name}?`, weight: 1},
		{message: `Steep it for the Vine!`, weight: 1},
		{message: `I am a Steeposaurus! 🦕`, weight: 1},
		{message: `Steep it... if you dare.`, weight: 1},
		{message: `Do you have a moment to talk about our Lord and Savior ${tea.name}?`, weight: 1},
		{message: `[Insert ${tea.name} joke here]`, weight: 1},
		{message: `While the cat's away, the mice will... drink ${tea.name}, I guess.`, weight: 1},
		{message: `Ah, who could resist the ${tea.name}?`, weight: 1},
		{message: `I steeped the ${tea.name} and all I got was this lousy T-shirt!`, weight: 1},
		{message: `You just lost the game.`, weight: 1},

		// Not steeped yet
		{message: `Have you tried ${tea.name}? What did you think?`, weight: steeps.length ? 0 : 1},
		{message: `It's pretty empty around here. Log a steep!`, weight: steeps.length ? 0 : 1},
		{message: `Ooh, you're adventurous today! Log a steep of ${tea.name} now!`, weight: steeps.length ? 0 : 1},
		{message: `Ah, the ${tea.name} at long last! Log it now!`, weight: steeps.length ? 0 : 1},
		{message: `The suspense is killing me! What did you think about ${tea.name}?`, weight: steeps.length ? 0 : 1},
		{message: `The prophecy is fulfilled.`, weight: steeps.length ? 0 : 1},
		{message: `Help! I'm trapped inside a web app full of tea puns and I can't get out unless you say nice things about ${tea.name}!`, weight: steeps.length ? 0 : 1},
		{message: `900 years of teas and spice and I've never steeped any tea that wasn't important.`, weight: steeps.length ? 0 : 1},
		{message: `So, dish the juicy goss! How's that ${tea.name}?`, weight: steeps.length ? 0 : 1},
		{message: `No steeps of ${tea.name} yet, huh? We'd better make up for lost time!`, weight: steeps.length ? 0 : 1},

		// Steeped before
		{message: `Treat yourself to some more ${tea.name} today!`, weight: steeps.length ? 1 : 0},
		{message: `Did you put a new spin on ${tea.name}?`, weight: steeps.length ? 1 : 0},
		{message: `Ooh, you had the ${tea.name} again? Tell me more!`, weight: steeps.length ? 1 : 0},

		// Earl Grey
		{message: `Tea, ${tea.name}, hot.`, weight: isEarlGrey ? 10 : 0},

		// Seasonal
		{message: `🎵 And a partridge in a pu-erh tea... 🎵`, weight: (isChristmastime && tea.teaType?.includes('Pu-Erh')) ? 15 : 0},
		{message: `❄️ I've been dreaming of a white (tea) Christmas... ❄️`, weight: (isChristmastime && tea.teaType?.includes('White')) ? 5 : 0},
		{message: `🎄 O Christmas tea, o Christmas tea... 🎄`, weight: isChristmastime ? 2 : 0},
		{message: `🎄 Deck the halls with boughs of ${tea.name} 🎄`, weight: isChristmastime ? 2 : 0},
		{message: `🎄 Enjoy the festivi-teas! 🎄`, weight: isChristmastime ? 2 : 0},
		{message: `❄️ Teas the season! ❄️`, weight: isChristmastime ? 2 : 0},

		{message: `💘 Will you tea mine? 💘`, weight: isValentinesDay ? 10 : 0},
	];

	const randomCta = chooseWeighted(options) as WeightedOption;
	return randomCta.message;
}