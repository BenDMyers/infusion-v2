import type { ObjectId, WithId } from 'mongodb';
import type { Brand, Steep, Tea } from '../types/api';
import { sluggify } from '../utils/slug';
import { byName } from '../utils/sort';
import { getBrandDetailsFromSlug } from './brands';
import { getDatabase } from './client';

export async function getAllTeas() {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const allTeas = await (teasCollection.find<WithId<Tea>>({})).toArray();
	allTeas.sort(byName.asc);
	return allTeas;
}

export async function getTeaById(teaId: ObjectId) {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const tea = await teasCollection.findOne<WithId<Tea>>({ _id: teaId });
	return tea;
}

export type AugmentedTeaDocument = WithId<Tea> & {
	brandData: WithId<Brand>,
	steeps: WithId<Steep>[]
};

export async function getTeaDetails(teaId: ObjectId) {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const matches = await teasCollection.aggregate<AugmentedTeaDocument>([
		{
			$match: {
				_id: teaId
			}
		},
		{
			$lookup: {
				from: 'vendors',
				localField: 'vendor',
				foreignField: '_id',
				as: 'brandData'
			}
		},
		{
			$lookup: {
				from: 'steeps',
				localField: '_id',
				foreignField: 'tea',
				as: 'steeps'
			}
		}
	]).toArray();
	const [match] = matches;
	return match;
}

export async function getTeaDetailsBySlugs(brandSlug: string, teaSlug: string) {
	const brand = await getBrandDetailsFromSlug(brandSlug);
	if (!brand) return;

	const brandTeas = brand.teas as AugmentedTeaDocument[];
	return brandTeas.find(tea => (sluggify(tea.name) === teaSlug));
}

export async function deleteTeaById(teaId: ObjectId) {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const deletionRecord = await teasCollection.deleteOne({_id: teaId});
	return deletionRecord;
}