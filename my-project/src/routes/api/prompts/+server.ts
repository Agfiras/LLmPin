import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/db.js';
import { requireAuth } from '$lib/auth.js';
import { ObjectId } from 'mongodb';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ url }: RequestEvent) => {
	try {
		const db = await connectToDatabase();
		const prompts = db.collection('Prompts');

		const category = url.searchParams.get('category');
		const search = url.searchParams.get('search');

		let query: any = {};

		if (category && category !== 'all') {
			query.category = { $regex: new RegExp(category, 'i') };
		}

		if (search) {
			query.$or = [
				{ title: { $regex: new RegExp(search, 'i') } },
				{ prompt: { $regex: new RegExp(search, 'i') } },
				{ tags: { $in: [new RegExp(search, 'i')] } },
				{ author: { $regex: new RegExp(search, 'i') } }
			];
		}

		const promptResults = await prompts
			.find(query)
			.sort({ createdAt: -1 })
			.toArray();

		const formattedPrompts = promptResults.map(prompt => ({
			id: prompt._id.toString(),
			title: prompt.title,
			prompt: prompt.prompt,
			category: prompt.category,
			tags: prompt.tags || [],
			author: prompt.author,
			authorId: prompt.authorId,
			createdAt: prompt.createdAt,
			likes: prompt.likes || 0,
			likedBy: prompt.likedBy || []
		}));

		return json({ prompts: formattedPrompts });

	} catch (error) {
		console.error('Get prompts error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		// Use the middleware to get authenticated user
		const user = requireAuth(event);

		const { title, prompt, category, tags } = await event.request.json();

		if (!title || !prompt || !category) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const db = await connectToDatabase();
		const prompts = db.collection('Prompts');

		const newPrompt = {
			title,
			prompt,
			category,
			tags: tags || [],
			author: user.username,
			authorId: user.id,
			createdAt: new Date(),
			likes: 0,
			likedBy: []
		};

		const result = await prompts.insertOne(newPrompt);

		return json({
			prompt: {
				id: result.insertedId.toString(),
				...newPrompt
			}
		}, { status: 201 });

	} catch (error) {
		console.error('Create prompt error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
