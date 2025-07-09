import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/db.js';
import { requireAuth } from '$lib/auth.js';
import { ObjectId } from 'mongodb';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		// Use the middleware to get authenticated user
		const user = requireAuth(event);
		console.log('Verified user:', user);

		const promptId = event.params.id;
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
