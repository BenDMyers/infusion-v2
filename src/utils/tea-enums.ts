import type { CaffeineLevel, HotOrIced, SteepFormat, WithEmptyStringOption } from '../types/api';

export const caffeineContentValues: CaffeineLevel[] = ['High', 'Medium', 'Low', 'Decaf', 'None'];

export const hotOrIced: WithEmptyStringOption<HotOrIced>[] = ['', 'Hot', 'Iced'];

export const format: SteepFormat[] = ['Loose leaf', 'Teabag'];

export const yesNoValues = ['', 'Yes', 'No'];

export const availabilityValues = [
	'',
	'Available',
	'Going away',
	'Unavailable',
	'Discontinued',
	'Not in season this month'
];