import type { ObjectId } from 'mongodb';

export type Brand = {
	name: string,
	twitter?: string,
	url?: string;
	teas?: ObjectId[]
};

export type CaffeineLevel = 'High' | 'Medium' | 'Low' | 'Decaf' | 'None';

export type FriendlyBoolean = 'Yes' | 'No';

export type HotOrIced = 'Hot' | 'Iced';

export type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

export type Rating = '1' | '2' | '3' | '4' | '5';

export type Steep = {
	date: Date,
	addins?: string[],
	amountOfLooseLeafTeaInTeaspoons?: number,
	amountOfWaterInOunces?: number,
	degreesFahrenheit?: number,
	format: SteepFormat,
	hotOrIced: HotOrIced,
	numTeabags?: number,
	preparationNotes?: string,
	purchaseLocation?: string,
	rating?: WithEmptyStringOption<Rating>,
	reinfusions?: number,
	review?: string,
	steepTime?: number,
	tea: ObjectId,
	userDate?: string,
	/** @deprecated */
	usedCreamer: WithEmptyStringOption<FriendlyBoolean>,
	/** @deprecated */
	usedHoney: WithEmptyStringOption<FriendlyBoolean>,
	/** @deprecated */
	usedSugar: WithEmptyStringOption<FriendlyBoolean>
};

export type SteepFormat = 'Loose leaf' | 'Teabag';

export type Tea = {
	name: string,
	availability?: string,
	caffeineLevel: CaffeineLevel,
	discontinued: boolean,
	favorited: boolean,
	favoriteSteep?: ObjectId,
	image?: string
	ingredients: string[],
	memo: string,
	monthsAvailable?: Month[],
	preferredStyles?: string,
	price?: string,
	recommendedAmount?: string,
	recommendedHotOrIced: WithEmptyStringOption<HotOrIced>,
	recommendedSteepTime?: string,
	recommendedSteepTemperature?: number,
	steeps?: ObjectId[],
	teaType: string[],
	toTry?: string,
	url?: string,
	vendor: ObjectId,
	wishlist: boolean
};

export type WithEmptyStringOption<E> = '' | E;