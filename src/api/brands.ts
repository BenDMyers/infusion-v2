import type { ObjectId, WithId } from 'mongodb';
import type { Brand } from '../types/api';
import { sortCaseInsensitively } from '../utils/aggregation-stages';
import { sluggify } from '../utils/slug';
import { byName } from '../utils/sort';
import { getDatabase } from './client';
import type { AugmentedTeaDocument } from './teas';

export async function getAllBrands() {
	const db = await getDatabase();
	const brandsCollection = await db.collection('vendors');
	const allBrands = await (brandsCollection.find<WithId<Brand>>({})).toArray();
	allBrands.sort(byName.asc);
	return allBrands;
}

export async function getBrandBySlug(brandSlug: string) {
	const brands = await getAllBrands();
	return brands.find((brand) => (sluggify(brand.name) === brandSlug));
}

export async function getBrandById(brandId: ObjectId) {
	const db = await getDatabase();
	const brandsCollection = await db.collection('vendors');
	const brand = await brandsCollection.findOne<WithId<Brand>>({ _id: brandId });
	return brand;
}

type AugmentedBrandDocument = WithId<Brand> & {
	teas: AugmentedTeaDocument[]
};

export async function getAllBrandsDetails() {
	const db = await getDatabase();
	const brandsCollection = await db.collection('vendors');
	const matches = await brandsCollection.aggregate<AugmentedBrandDocument>([
		{
			$lookup: {
				from: 'teas',
				let: {
					brand_id: '$_id'
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$vendor', '$$brand_id']
							}
						}
					},
					...sortCaseInsensitively,
					{
						$lookup: {
							from: 'steeps',
							localField: '_id',
							foreignField: 'tea',
							as: 'steeps'
						}
					}
				],
				as: 'teas'
			}
		},
		...sortCaseInsensitively
	]).toArray();
	return matches;
}

export async function getBrandDetails(brandId: ObjectId) {
	const db = await getDatabase();
	const brandsCollection = await db.collection('vendors');
	const matches = await brandsCollection.aggregate<AugmentedBrandDocument>([
		{
			$match: {
				_id: brandId
			}
		},
		{
			$lookup: {
				from: 'teas',
				let: {
					brand_id: '$_id'
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$vendor', '$$brand_id']
							}
						}
					},
					...sortCaseInsensitively,
					{
						$lookup: {
							from: 'steeps',
							localField: '_id',
							foreignField: 'tea',
							as: 'steeps'
						}
					}
				],
				as: 'teas'
			}
		}
	]).toArray();
	const [match] = matches;
	return match;
}

export async function getBrandDetailsFromSlug(brandSlug: string) {
	const db = await getDatabase();
	const brandsCollection = await db.collection('vendors');
	const namesAggregation = await brandsCollection
		.aggregate<{_id: ObjectId, name: string}>([
			{$project: {name: 1}}
		])
		.toArray();
	const nameMatch = namesAggregation.find(doc => (sluggify(doc.name) === brandSlug));
	if (nameMatch) {
		return getBrandDetails(nameMatch._id);
	}
}