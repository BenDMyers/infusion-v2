import { ObjectId, WithId } from 'mongodb';
import type { Brand, Steep, Tea } from '../types/api';
import { byDate } from '../utils/sort';
import { getBrandById } from './brands';
import { getDatabase } from './client';
import { getTeaById } from './teas';

export async function getAllSteeps() {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const allSteeps = await (steepsCollection.find<WithId<Steep>>({})).toArray();
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

export async function getSteepsForTea(teaId: ObjectId) {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const steeps = await (steepsCollection.find<WithId<Steep>>({
		tea: teaId
	})).toArray();
	steeps.sort(byDate.desc);
	return steeps;
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

export async function showLatestSteeps(limit: number) {
	const db = await getDatabase();
	const steepsCollection = await db.collection('steeps');
	const steeps = await steepsCollection.find<WithId<Steep>>({}, {
		limit,
		sort: {
			userDate: -1,
			date: -1,
			_id: 1
		}
	}).toArray();

	const teas: {[key: string]: WithId<Tea>} = {};
	const uniqueTeaIds = [
		...new Set(steeps.map(steep => steep.tea.toString()))
	];
	const teaObjects = await Promise.all(
		uniqueTeaIds.map(id => getTeaById(new ObjectId(id))) 
	);
	for (const tea of teaObjects) {
		if (tea) {
			teas[tea._id.toString()] = tea;
		}
	}

	return {steeps, teas};
}