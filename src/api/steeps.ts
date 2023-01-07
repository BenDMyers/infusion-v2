import type { ObjectId, WithId } from 'mongodb';
import type { Steep } from '../types/api';
import { sortByUserDate } from '../utils/aggregation-stages';
import { byDate } from '../utils/sort';
import { getDatabase } from './client';

export async function getAllSteeps() {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const allSteeps = await (steepsCollection.find<WithId<Steep>>({})).toArray();
	allSteeps.sort(byDate.desc);
	return allSteeps;
}

export async function getSteepById(steepId: ObjectId) {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const steep = await steepsCollection.findOne<WithId<Steep>>({ _id: steepId });
	return steep;
}

export async function deleteSteepById(steepId: ObjectId) {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const deletionRecord = await steepsCollection.deleteOne({_id: steepId});
	return deletionRecord;
}

export async function deleteAllSteepsForTea(teaId: ObjectId) {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const deletionRecord = await steepsCollection.deleteMany({tea: teaId});
	return deletionRecord;
}

export async function showLatestSteeps(limit: number) {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');

	const steeps = await steepsCollection.aggregate([
		sortByUserDate,
		{$limit: limit},
		{
			$lookup: {
				from: 'teas',
				let: {tea_id: '$tea'},
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$_id', '$$tea_id']
							}
						}
					},
				],
				as: 'teaData'
			}
		}
	]).toArray();
	return steeps;
}