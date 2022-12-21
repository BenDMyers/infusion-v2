import type { WithId } from 'mongodb';
import type { Brand } from '../types/api';
import { byName } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllBrands() {
	const db = await getDatabase();
	const brandsCollection = await db.collection('vendors');
	const allBrands = await (brandsCollection.find({})).toArray() as WithId<Brand>[];
	allBrands.sort(byName.asc);
	return allBrands;
}