import type { SimpleReference } from '../types/api';
import { byName } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllTeaTypes() {
	const db = await getDatabase();
	const teaTypesCollection = await db.collection('teatypes');
	const allTeaTypes = await teaTypesCollection
		.find<SimpleReference>({})
		.toArray();
	allTeaTypes.sort(byName.asc);
	return allTeaTypes;
}