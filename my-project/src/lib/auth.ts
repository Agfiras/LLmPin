import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '$lib/types';

/**
 * Helper function to require authentication in API routes
 * Returns the authenticated user or throws an unauthorized response
 */
export function requireAuth(event: RequestEvent): User {
	const user = event.locals.user;
	
	if (!user) {
		throw json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
	}
	
	return user;
}

/**
 * Helper function to get the authenticated user (optional)
 * Returns the user if authenticated, or null if not
 */
export function getAuthUser(event: RequestEvent): User | null {
	return event.locals.user || null;
}

/**
 * Helper function to get the auth token
 */
export function getAuthToken(event: RequestEvent): string | null {
	return event.locals.token || null;
}
