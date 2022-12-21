import { getDatabase } from "./client";

export async function getAllTeas() {
	const db = await getDatabase();
	const teasCollection = await db.collection('teas');
	const allTeas = await (teasCollection.find({})).toArray();
	return allTeas;
}