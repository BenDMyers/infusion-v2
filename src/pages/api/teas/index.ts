import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getDatabase } from 'src/api/client';
import type { AugmentedTeaDocument } from 'src/api/teas';
import type { ApiRouteBody } from 'src/types/api-routes';
import { reshapeFormData } from 'src/utils/reshape-form-data';

const booleanMap = {
	'Yes': true,
	'No': {$ne: true},
	'': undefined
};

const discontinuedMap = {
	Available: {$ne: true},
	'Going away': {$ne: true},
	Discontinued: true,
	'Not in season this month': {$ne: true}
};

export const post: APIRoute = async function({request}) {
	const formData = await request.formData();
	const norm = reshapeFormData(formData);
	console.log({norm});

	const $match = {
		vendor: norm.vendor ?
			new ObjectId(norm.vendor) :
			undefined,
		teaType: norm.teaType || undefined,
		caffeineLevel: norm.caffeineLevel || undefined,
		ingredients: norm.ingredients || undefined,
		recommendedSteepTemperature: norm.recommendedSteepTemperature ?
			Number(norm.recommendedSteepTemperature) :
			undefined,
		favorited: norm.favorited ?
			booleanMap[norm.favorited as 'Yes' | 'No'] :
			undefined,
		wishlist: norm.wishlist ?
			booleanMap[norm.wishlist as 'Yes' | 'No'] :
			undefined,
		discontinued: norm.availability ?
			discontinuedMap[norm.availability as keyof typeof discontinuedMap] :
			undefined
	};

	for (let property in $match) {
		const value = $match[property as keyof typeof $match];
		if ((value === undefined) || (Array.isArray(value) && value.length === 0)) {
			delete $match[property as keyof typeof $match];
		} else if (Array.isArray(value)) {
			$match[property as keyof typeof $match] = {
				$all: value
			};
		}
	}

	try {
		const db = await getDatabase();
		const teasCollection = await db.collection('teas');

		const pipeline: object[] = [
			{ $match }
		];

		if (norm.steepedBefore || norm.highestRating) {
			const addSteeps = {
				$lookup: {
					from: 'steeps',
					localField: '_id',
					foreignField: 'tea',
					as: 'steeps'
				}
			};
			pipeline.push(addSteeps);
		}

		if (norm.availability) {
			const today = new Date();
			const currentMonth = today.toLocaleDateString('en-us', {month: 'long'});
			const nextMonth = new Date(today.getFullYear(), today.getMonth()+1, 1)
				.toLocaleDateString('en-us', {month: 'long'});
			console.log({currentMonth, nextMonth})

			const addMonthSpecificAvailabilities = {
				$addFields: {
					availableThisMonth: {
						$or: [
							{$lte: ['$monthsAvailable', null]},
							{$eq: [{$size: '$monthsAvailable'}, 0]},
							{$in: [currentMonth, '$monthsAvailable']}
						]
					},
					availableNextMonth: {
						$or: [
							{$lte: ['$monthsAvailable', null]},
							{$eq: [{$size: '$monthsAvailable'}, 0]},
							{$in: [nextMonth, '$monthsAvailable']}
						]
					},
				}
			};

			pipeline.push(addMonthSpecificAvailabilities);

			if (norm.availability === 'Available') {
				pipeline.push({
					$match: {availableThisMonth: true}
				});
			} else if (norm.availability === 'Going away') {
				pipeline.push({
					$match: {
						availableThisMonth: true,
						availableNextMonth: false
					}
				});
			} else if (norm.availability === 'Unavailable') {
				pipeline.push({
					$match: {
						$or: [
							{discontinued: true},
							{availableThisMonth: false}
						]
					}
				});
			} else if (norm.availability === 'Not in season this month') {
				pipeline.push({
					$match: {availableThisMonth: false}
				});
			}
		}

		if (norm.steepedBefore /* if it's "Yes" or "No" */) {
			const countSteeps = {
				$addFields: {
					steepCount: {
						$size: '$steeps'
					}
				}
			};
			const matchCount = {
				$match: {
					steepCount: norm.steepedBefore === 'Yes' ? {$gt: 0} : {$eq: 0}
				}
			};
			pipeline.push(countSteeps, matchCount);
		}

		if (norm.highestRating) {
			const targetRatingNumeric = Number(norm.highestRating);
			
			const numericRatingsStage = {
				$addFields: {
					steepRatings: {
						$map: {
							input: '$steeps.rating',
							as: 'ratingNumeric',
							in: {
								$convert: {
									input: '$$ratingNumeric',
									to: 'int',
									onError: 0,
									onNull: 0
								}
							}
						}
					}
				}
			};

			const maxRatingStage = {
				$addFields: {
					maxRating: {
						$max: '$steepRatings'
					}
				}
			};
			
			const maxRatingMatch = {
				$match: {
					maxRating: {$gte: targetRatingNumeric}
				}
			};

			pipeline.push(
				numericRatingsStage,
				maxRatingStage,
				maxRatingMatch
			);
		}

		let aggregation = await teasCollection
			.aggregate<AugmentedTeaDocument>(pipeline)
			.toArray();

		const ids = aggregation.map(tea => tea._id.toString());
		const brands = [...new Set(aggregation.map(tea => tea.vendor.toString()))];
		// console.dir({$match, aggregation, ids, brands});
	
		const body: ApiRouteBody = {data: {brands, teas: ids}};
		return new Response(
			JSON.stringify(body),
			{
				status: 200,
				headers: {'Content-Type': 'application/json'}
			}
		)
	} catch (err) {
		console.error(err);
		const body: ApiRouteBody = {msg: 'Unable to filter'};
		return new Response(
			JSON.stringify(body),
			{
				status: 500,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}
};