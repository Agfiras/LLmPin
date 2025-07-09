import { MongoClient, Db, Collection } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
	if (db) {
		return db;
	}

	try {
		const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/LLmPin';
		const dbName = env.MONGODB_DB_NAME || 'LLmPin';
		
		console.log('Attempting to connect to MongoDB at:', mongoUri);
		
		client = new MongoClient(mongoUri, {
			connectTimeoutMS: 10000,
			serverSelectionTimeoutMS: 5000,
			family: 4, // Force IPv4
		});
		
		await client.connect();
		
		// Ping to verify connection
		await client.db("admin").command({ ping: 1 });
		
		db = client.db(dbName);
		console.log('✅ Connected to MongoDB successfully');
		return db;
	} catch (error) {
		console.error('❌ Failed to connect to MongoDB:', error);
		throw error;
	}
}

export async function getCollection(name: string): Promise<Collection> {
	const database = await connectToDatabase();
	return database.collection(name);
}

export async function closeConnection(): Promise<void> {
	if (client) {
		await client.close();
		console.log('MongoDB connection closed');
	}
}
