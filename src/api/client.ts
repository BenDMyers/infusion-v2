import { Db, MongoClient, MongoClientOptions } from 'mongodb';

if (!import.meta.env.DB_URL) {
	throw new Error('Invalid database URI');
}

if (!import.meta.env.DB_NAME) {
	throw new Error('Invalid database name');
}

const uri = import.meta.env.DB_URL as string;
const databaseName = import.meta.env.DB_NAME as string;
const options: MongoClientOptions = {};
let cachedMongo: Db;

async function connectToDatabase() {
	const mongo = await new MongoClient(uri, options).connect();
	return mongo.db(databaseName);
}

export async function getDatabase() {
	// In development mode, use a global variable so that the value is preserved across module reloads caused by HMR (Hot Module Replacement)
	if (import.meta.env.NODE_ENV === 'development') {
		if (!global._mongoConnection) {
			cachedMongo = await connectToDatabase();
			global._mongoConnection = cachedMongo;
		}

		return cachedMongo;
	}

	const mongo = await connectToDatabase();
	return mongo;
}

export async function Teas() {
	const db = await getDatabase();
	return db.collection('teas');
}