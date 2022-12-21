import type { Db } from 'mongodb';

declare global {
	var _mongoConnection: Db;
}