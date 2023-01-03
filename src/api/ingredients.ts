import type { SimpleReference } from '../types/api';
import { byName } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllIngredients() {
	const db = await getDatabase();
	const teaTypesCollection = await db.collection('ingredients');
	const allIngredients = await teaTypesCollection
		.find<SimpleReference>({})
		.toArray();
	allIngredients.sort(byName.asc);
	return allIngredients;
}