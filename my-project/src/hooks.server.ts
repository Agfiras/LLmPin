import { type Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { User } from '$lib/types';

export const handle: Handle = async ({ event, resolve }) => {
	// Extract token from Authorization header
	const authHeader = event.request.headers.get('Authorization');
	
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.substring(7);
		
		try {
			// Verify and decode the JWT token
			const decoded = jwt.verify(token, JWT_SECRET) as any;
			
			// Create user object from token payload
			const user: User = {
				id: decoded.userId,
				username: decoded.username,
				email: decoded.email
			};
			
			// Expose user data to all routes via locals
			event.locals.user = user;
			event.locals.token = token;
			
		} catch (error) {
			// Invalid token - don't set user, let routes handle unauthorized access
			console.log('Invalid token:', error);
		}
	}
	
	// Continue to the route
	return resolve(event);
};
