import type { SimpleReference } from '../types/api';
import { byName } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllAddins() {
	const db = await getDatabase();
	const addinsCollection = await db.collection('addins');
	const allAddins = await addinsCollection
		.find<SimpleReference>({})
		.toArray();
	allAddins.sort(byName.asc);
	return allAddins;
}