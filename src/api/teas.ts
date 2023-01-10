import type { ObjectId, WithId } from 'mongodb';
import { sortCaseInsensitively } from 'src/utils/aggregation-stages';
import type { Brand, Steep, Tea } from '../types/api';
import { sluggify } from '../utils/slug';
import { byName } from '../utils/sort';
import { getBrandDetailsFromSlug } from './brands';
import { getDatabase } from './client';
import { deleteAllSteepsForTea } from './steeps';

export async function getAllTeas() {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const allTeas = await (teasCollection.find<WithId<Tea>>({})).toArray();
	allTeas.sort(byName.asc);
	return allTeas;
}

export async function getAllTeasDetails() {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const aggregation = await teasCollection.aggregate<AugmentedTeaDocument>([
		{
			$lookup: {
				from: 'vendors',
				let: {
					brand_id: '$vendor'
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$_id', '$$brand_id']
							}
						}
					},
				],
				as: 'brandData'
			}
		},
		...sortCaseInsensitively
	]).toArray();
	return aggregation;
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
	// Cascading deletion
	await deleteAllSteepsForTea(teaId);

	// Delete tea itself
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const deletionRecord = await teasCollection.deleteOne({_id: teaId});
	return deletionRecord;
}