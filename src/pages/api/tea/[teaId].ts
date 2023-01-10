import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getBrandDetails } from '../../../api/brands';
import { getDatabase } from '../../../api/client';
import { deleteTeaById, getTeaDetails, getTeaDetailsBySlugs } from '../../../api/teas';
import type { ApiRouteBody } from '../../../types/api-routes';
import { reshapeFormData } from '../../../utils/reshape-form-data';
import { sluggify } from '../../../utils/slug';

export const get: APIRoute = async ({ params, request, redirect }) => {
	if (params.teaId) {
		const id = new ObjectId(params.teaId);
		const tea = await getTeaDetails(id);
		if (tea) {
			const brandSlug = sluggify(tea.brandData.name);
			const teaSlug = sluggify(tea.name);
			return redirect(`/teas/${brandSlug}/${teaSlug}`);
		}
	}
	return redirect('/teas/');
};

export const post: APIRoute = async ({params, request, redirect}) => {
	const teaId = new ObjectId(params.teaId);
	const teaCurrentState = await getTeaDetails(teaId);

	if (!teaCurrentState) {
		const body: ApiRouteBody = {
			msg: `Server error - no tea found with ID ${params.teaId}`
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
	const {_id, _method,  ...normalized} = reshapeFormData(formData);
	
	// Check that new brand/tea name doesn't conflict with other teas
	const candidateTeaName = formData.get('name')?.toString() || '';
	const candidateBrandId = normalized.vendor;
	const changedName = candidateTeaName !== teaCurrentState.name;
	const changedBrand = candidateBrandId !== teaCurrentState.vendor.toString();
	let newBrandSlug = '';
	let newTeaSlug = '';

	if (changedBrand || changedName) {
		const newBrandObjectId = new ObjectId(candidateBrandId);
		const newBrand = await getBrandDetails(newBrandObjectId);
		newBrandSlug = sluggify(newBrand.name);
		newTeaSlug = sluggify(candidateTeaName);
		const teaWithSlug = await getTeaDetailsBySlugs(newBrandSlug, newTeaSlug);
		if (teaWithSlug && (teaWithSlug._id.toString() !== teaCurrentState._id.toString())) {
			const body: ApiRouteBody = {
				errors: {
					name: `${newBrand.name} already has a tea with this name`
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
		const teasCollection = await db.collection('teas');
		const updates = await teasCollection.updateOne(
			{_id: teaId},
			{
				$set: {
					discontinued: false,
					wishlist: false,
					...normalized,
					vendor: new ObjectId(normalized.vendor)
				}
			}
		);

		if (updates) {
			return redirect(`/teas/${newBrandSlug}/${newTeaSlug}/`);
		} else {
			throw new Error('Unable to update tea');
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

export const del: APIRoute = async ({params}) => {
	const {teaId = ''} = params;
	const id = new ObjectId(teaId);
	const tea = await getTeaDetails(id);

	if (!tea) {
		return new Response(
			JSON.stringify({msg: 'tea was not found'} as ApiRouteBody),
			{
				status: 500,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	try {
		await deleteTeaById(id);
		const body: ApiRouteBody = {msg: 'Deleted successfully'};
		return new Response(
			JSON.stringify(body),
			{
				status: 201,
				headers: {'Content-Type': 'application/json'}
			}
		)
	} catch (err) {
		return new Response(
			JSON.stringify({msg: err} as ApiRouteBody),
			{
				status: 500,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}
}