import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
	try {
		const { email, password, username } = await request.json();

		if (!email || !password || !username) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const db = await connectToDatabase();
		const users = db.collection('Users');

		// Check if user already exists
		const existingUser = await users.findOne({ email });
		if (existingUser) {
			return json({ error: 'User already exists' }, { status: 400 });
		}

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user
		const result = await users.insertOne({
			username,
			email,
			password: hashedPassword,
			createdAt: new Date()
		});

		// Generate JWT token
		const jwtSecret = env.JWT_SECRET || 'fallback-secret';
		const token = jwt.sign(
			{ 
				id: result.insertedId.toString(), 
				username, 
				email 
			},
			jwtSecret,
			{ expiresIn: '7d' }
		);

		return json({
			user: {
				id: result.insertedId.toString(),
				username,
				email
			},
			token
		}, { status: 201 });

	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
