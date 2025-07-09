import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/db.js';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { ObjectId } from 'mongodb';
import type { RequestEvent } from '@sveltejs/kit';

// Helper function to verify JWT token
function verifyToken(authHeader: string | null): any {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}
	
	const token = authHeader.substring(7);
	const jwtSecret = env.JWT_SECRET || 'fallback-secret';
	
	try {
		return jwt.verify(token, jwtSecret);
	} catch {
		return null;
	}
}

export const POST = async ({ request, params }: RequestEvent) => {
	try {
		const authHeader = request.headers.get('Authorization');
		console.log('Received auth header:', authHeader);
		
		const user = verifyToken(authHeader);
		console.log('Verified user:', user);

		if (!user) {
			console.log('Authorization failed - no user found');
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const promptId = params.id;
		if (!promptId) {
			return json({ error: 'Prompt ID required' }, { status: 400 });
		}

		const db = await connectToDatabase();
		const prompts = db.collection('Prompts');

		const prompt = await prompts.findOne({ _id: new ObjectId(promptId) });
		if (!prompt) {
			return json({ error: 'Prompt not found' }, { status: 404 });
		}

		const likedBy = prompt.likedBy || [];
		const isLiked = likedBy.includes(user.id);

		let updatedLikedBy: string[];
		let updatedLikes: number;

		if (isLiked) {
			// Unlike
			updatedLikedBy = likedBy.filter((id: string) => id !== user.id);
			updatedLikes = Math.max((prompt.likes || 0) - 1, 0);
		} else {
			// Like
			updatedLikedBy = [...likedBy, user.id];
			updatedLikes = (prompt.likes || 0) + 1;
		}

		await prompts.updateOne(
			{ _id: new ObjectId(promptId) },
			{
				$set: {
					likes: updatedLikes,
					likedBy: updatedLikedBy
				}
			}
		);

		return json({
			likes: updatedLikes,
			isLiked: !isLiked
		});

	} catch (error) {
		console.error('Like/Unlike error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
