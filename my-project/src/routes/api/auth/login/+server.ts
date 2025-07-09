import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ error: 'Missing email or password' }, { status: 400 });
		}

		const db = await connectToDatabase();
		const users = db.collection('Users');

		// Find user
		const user = await users.findOne({ email });
		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Check password
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Generate JWT token
		const jwtSecret = env.JWT_SECRET || 'fallback-secret';
		const token = jwt.sign(
			{ 
				id: user._id.toString(), 
				username: user.username, 
				email: user.email 
			},
			jwtSecret,
			{ expiresIn: '7d' }
		);

		return json({
			user: {
				id: user._id.toString(),
				username: user.username,
				email: user.email
			},
			token
		});

	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
