import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getBrandById, getBrandBySlug } from '../../../api/brands';
import { getDatabase } from '../../../api/client';
import type { Brand } from '../../../types/api';
import type { ApiRouteBody } from '../../../types/api-routes';
import { sluggify } from '../../../utils/slug';

export const get: APIRoute = async ({ params, request, redirect }) => {
	console.log({params, request});
	if (params.brandId) {
		const id = new ObjectId(params.brandId);
		const brand = await getBrandById(id);
		if (brand) {
			const slug = sluggify(brand.name);
			return redirect(`/brands/${slug}/`);
		}
	}
	return redirect('/brands/');
};

export const post: APIRoute = async ({params, request, redirect}) => {
	const brandId = new ObjectId(params.brandId);
	const brandCurrentState = await getBrandById(brandId);

	if (!brandCurrentState) {
		const body: ApiRouteBody = {
			msg: `Server error - no brand found with ID ${params.brandId}`
		};
		return new Response(
			JSON.stringify(body),
			{
				status: 404,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	const formData = await request.formData();
	
	// Check that new name doesn't conflict with other brands
	const candidateBrandName = formData.get('name')?.toString() || '';
	if (candidateBrandName !== brandCurrentState.name) {
		const newSlug = sluggify(candidateBrandName);
		const brandWithSlug = await getBrandBySlug(newSlug);
		if (brandWithSlug && (brandWithSlug._id.toString() !== brandCurrentState._id.toString())) {
			const body: ApiRouteBody = {
				errors: {
					name: 'Name is already in use'
				}
			};
			return new Response(
				JSON.stringify(body),
				{
					status: 409,
					headers: {'Content-Type': 'application/json'}
				}
			);
		}
	}

	try {
		const db = await getDatabase();
		const brandsCollection = await db.collection('vendors');
		const brandPartial: Brand = {
			name: formData.get('name')?.toString() || '',
			twitter: formData.get('twitter')?.toString(),
			url: formData.get('url')?.toString(),
		};

		const updates = await brandsCollection.updateOne(
			{_id: brandId},
			{$set: brandPartial}
		);

		if (updates) {
			const slug = sluggify(formData.get('name')?.toString() || '');
			return redirect(`/brands/${slug}/`);
		} else {
			throw new Error('Unable to update brand');
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