import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getBrandById } from '../../../api/brands';
import { getDatabase } from '../../../api/client';
import { getTeaById } from '../../../api/teas';
import type { ApiRouteBody } from '../../../types/api-routes';
import { reshapeFormData } from '../../../utils/reshape-form-data';
import { sluggify } from '../../../utils/slug';

export const post: APIRoute = async ({request, redirect}) => {
	const formData = await request.formData();

	if (!formData.get('tea')) {
		const body: ApiRouteBody = {
			errors: {tea: 'Tea is required'}
		};

		return new Response(
			JSON.stringify(body),
			{
				status: 400,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	
	const normalizedFormData = reshapeFormData(formData);
	
	const teaId = new ObjectId(normalizedFormData.tea);
	const tea = await getTeaById(teaId);
	if (!tea) {
		const body: ApiRouteBody = {
			errors: {tea: 'Tea does not exist'}
		};

		return new Response(
			JSON.stringify(body),
			{
				status: 400,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	try {
		const db = await getDatabase();
		const steepsCollection = db.collection('steeps');
		const createdSteep = await steepsCollection.insertOne({
			...normalizedFormData,
			tea: teaId,
			date: new Date(),
			usedCreamer: '',
			usedHoney: '',
			usedSweetener: ''
		});

		if (createdSteep) {
			const brand = await getBrandById(tea.vendor);
			const brandSlug = sluggify(brand?.name || '');
			const teaSlug = sluggify(tea.name);
			const newRoute = `/teas/${brandSlug}/${teaSlug}/#steep-${createdSteep.insertedId.toString()}`;
			return redirect(newRoute);
		} else {
			throw new Error('Unable to create steep');
		}
	} catch (err) {
		console.error(err);
		return new Response(
			JSON.stringify({msg: err} as ApiRouteBody),
			{
				status: 500,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}
};