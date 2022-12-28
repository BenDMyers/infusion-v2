import type { APIRoute } from 'astro';
import { getBrandBySlug } from '../../../api/brands';
import { getDatabase } from '../../../api/client';
import type { ApiRouteBody } from '../../../types/api-routes';
import { sluggify } from '../../../utils/slug';

const CONTAINS_ALPHANUMERIC_CHARACTER = /[a-zA-Z0-9]/;

export const get: APIRoute = ({ params, request, redirect }) => {
	console.log({params, request});
	return redirect('/brands/');
};

export const post: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const candidateBrandName = formData.get('name')?.toString() || '';

	if (!CONTAINS_ALPHANUMERIC_CHARACTER.test(candidateBrandName)) {
		const body: ApiRouteBody = {
			errors: {name: 'Name is invalid'}
		};

		return new Response(
			JSON.stringify(body),
			{
				status: 400,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	const candidateBrandSlug = sluggify(candidateBrandName);
	const slugAlreadyExists = !!(await getBrandBySlug(candidateBrandSlug));
	
	if (slugAlreadyExists) {
		const body: ApiRouteBody = {
			errors: {name: 'Name is already in use'}
		};

		return new Response(
			JSON.stringify(body),
			{
				status: 409,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	try {
		const db = await getDatabase();
		const brandsCollection = await db.collection('vendors');
		const createdBrand = await brandsCollection.insertOne(Object.fromEntries(formData));

		if (createdBrand) {
			return redirect(`/brands/${candidateBrandSlug}/`);
		} else {
			throw new Error('Unable to create brand');
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