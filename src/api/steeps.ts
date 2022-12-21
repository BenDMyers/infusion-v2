import type { WithId } from 'mongodb';
import type { Steep } from '../types/api';
import { byDate } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllSteeps() {
	const db = await getDatabase();
	const teasCollection = await db.collection('steeps');
	const allSteeps = await (teasCollection.find({})).toArray() as WithId<Steep>[];
	allSteeps.sort(byDate.desc);
	return allSteeps;
}

export async function getSteepsGroupedByTeas() {
	const steeps = await getAllSteeps();
	const groupedSteeps = {} as {[key: string]: WithId<Steep>[]};
	for (const steep of steeps) {
		const teaId = steep.tea.toString();
		if (!groupedSteeps[teaId]) {
			groupedSteeps[teaId] = [] as WithId<Steep>[];
		}
		groupedSteeps[teaId].push(steep);
	}
	return groupedSteeps;
}