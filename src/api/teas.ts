import type { WithId } from 'mongodb';
import type { Tea } from '../types/api';
import { byName } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllTeas() {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const allTeas = await (teasCollection.find({})).toArray() as WithId<Tea>[];
	allTeas.sort(byName.asc);
	return allTeas;
}

export async function getTeasGroupedByBrands() {
	const teas = await getAllTeas();
	const groupedTeas = {} as {[key: string]: WithId<Tea>[]};
	for (const tea of teas) {
		const vendorId = tea.vendor.toString();
		if (!groupedTeas[vendorId]) {
			groupedTeas[vendorId] = [] as WithId<Tea>[];
		}
		groupedTeas[vendorId].push(tea);
	}
	return groupedTeas;
}