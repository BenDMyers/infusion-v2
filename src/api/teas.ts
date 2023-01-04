import type { ObjectId, WithId } from 'mongodb';
import type { Tea } from '../types/api';
import { sluggify } from '../utils/slug';
import { byName } from '../utils/sort';
import { getBrandBySlug } from './brands';
import { getDatabase } from './client';

export async function getAllTeas() {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const allTeas = await (teasCollection.find<WithId<Tea>>({})).toArray();
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

export async function getTeaBySlugs(brandSlug: string, teaSlug: string) {
	const brand = await getBrandBySlug(brandSlug);
	if (!brand) {
		return;
	}

	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const teasForBrand = await (
		teasCollection.find<WithId<Tea>>({ vendor: brand._id })
	).toArray();
	const tea = teasForBrand.find(tea => (sluggify(tea.name) === teaSlug));
	return tea;
}

export async function getTeasForBrand(brandId: ObjectId) {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const teas = await (teasCollection.find<WithId<Tea>>({
		vendor: brandId
	})).toArray();
	teas.sort(byName.asc);
	return teas;
}

export async function getTeaById(teaId: ObjectId) {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const tea = await teasCollection.findOne<WithId<Tea>>({ _id: teaId });
	return tea;
}