export interface User {
	id: string;
	username: string;
	email: string;
}

export interface Prompt {
	id: string;
	title: string;
	prompt: string;
	category: string;
	tags: string[];
	author: string;
	authorId: string;
	createdAt: Date;
	likes: number;
	likedBy: string[];
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
}

export interface ThemeState {
	isDark: boolean;
}
