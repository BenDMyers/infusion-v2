import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../../../api/client';
import { deleteSteepById, getSteepById } from '../../../api/steeps';
import { getTeaById } from '../../../api/teas';
import type { ApiRouteBody } from '../../../types/api-routes';

export const del: APIRoute = async ({params}) => {
	const {steepId = ''} = params;
	console.log({steepId});
	const id = new ObjectId(steepId);
	const steep = await getSteepById(id);

	if (!steep) {
		return new Response(
			JSON.stringify({msg: 'Steep was not found'} as ApiRouteBody),
			{
				status: 500,
				headers: {'Content-Type': 'application/json'}
			}
		);
	}

	const tea = await getTeaById(steep.tea);
	if (tea) {
		const isFavoriteSteep = tea.favoriteSteep === id;
		if (isFavoriteSteep) {
			try {
				const db = await getDatabase();
				const teasCollection = await db.collection('teas');
				teasCollection.updateOne(
					{_id: tea._id},
					{$unset: {
						favoriteSteep: ''
					}}
				)
			} catch (err) {
				console.error(err);
			}
		}
	}

	try {
		await deleteSteepById(id);
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
};