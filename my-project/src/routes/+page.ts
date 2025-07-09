export const load = async ({ fetch, url }: { fetch: any, url: any }) => {
	try {
		// Get query parameters
		const category = url.searchParams.get('category') || 'all';
		const search = url.searchParams.get('search') || '';
		
		// Build query string
		const params = new URLSearchParams();
		if (category && category !== 'all') params.append('category', category);
		if (search) params.append('search', search);
		
		// Fetch prompts using the load function's fetch
		const response = await fetch(`/api/prompts?${params}`);
		
		if (response.ok) {
			const data = await response.json();
			return {
				prompts: data.prompts.map((prompt: any) => ({
					...prompt,
					createdAt: new Date(prompt.createdAt)
				})),
				initialCategory: category,
				initialSearch: search
			};
		} else {
			return {
				prompts: [],
				error: 'Failed to load prompts',
				initialCategory: category,
				initialSearch: search
			};
		}
	} catch (error) {
		console.error('Load prompts error:', error);
		return {
			prompts: [],
			error: 'Failed to load prompts',
			initialCategory: 'all',
			initialSearch: ''
		};
	}
};
