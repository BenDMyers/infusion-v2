import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getBrandById } from '../../../api/brands';
import { getDatabase } from '../../../api/client';
import { getTeaDetailsBySlugs } from '../../../api/teas';
import type { ApiRouteBody } from '../../../types/api-routes';
import { reshapeFormData } from '../../../utils/reshape-form-data';
import { sluggify } from '../../../utils/slug';

const CONTAINS_ALPHANUMERIC_CHARACTER = /[a-zA-Z0-9]/;

export const get: APIRoute = ({ params, request, redirect }) => {
	console.log({params, request});
	return redirect('/teas/');
};

export const post: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const candidateTeaName = formData.get('name')?.toString() || '';

	if (!CONTAINS_ALPHANUMERIC_CHARACTER.test(candidateTeaName)) {
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

	if (!formData.get('vendor')) {
		const body: ApiRouteBody = {
			errors: {name: 'Brand is required'}
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

	const brandId = new ObjectId(normalizedFormData.vendor);
	const brand = await getBrandById(brandId);
	if (!brand) {
		const body: ApiRouteBody = {
			errors: {vendor: 'Brand is required'}
		};

		return new Response(
			JSON.stringify(body),
			{
				status: 400,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}
	const candidateBrandSlug = sluggify(brand.name);
	const candidateTeaSlug = sluggify(candidateTeaName);
	const slugAlreadyExists = !!(await getTeaDetailsBySlugs(candidateBrandSlug, candidateTeaSlug));
	
	if (slugAlreadyExists) {
		const body: ApiRouteBody = {
			errors: {name: `${brand.name} already has a tea with this name`}
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
		const teasCollection = await db.collection('teas');
		const createdTea = await teasCollection.insertOne({
			...normalizedFormData,
			vendor: brandId
		});

		if (createdTea) {
			return redirect(`/teas/${candidateBrandSlug}/${candidateTeaSlug}/`);
		} else {
			throw new Error('Unable to create tea');
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