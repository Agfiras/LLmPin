import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, Prompt, AuthState, ThemeState } from './types';

// API Helper functions
const api = {
	async fetchPrompts(category?: string, search?: string) {
		try {
			const params = new URLSearchParams();
			if (category && category !== 'all') params.append('category', category);
			if (search) params.append('search', search);
			
			const response = await fetch(`/api/prompts?${params}`);
			const data = await response.json();
			
			if (response.ok) {
				return { success: true, prompts: data.prompts };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error' };
		}
	},

	async createPrompt(prompt: { title: string; prompt: string; category: string; tags: string[] }, token: string) {
		try {
			const response = await fetch('/api/prompts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(prompt)
			});
			
			const data = await response.json();
			
			if (response.ok) {
				return { success: true, prompt: data.prompt };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error' };
		}
	},

	async toggleLike(promptId: string, token: string) {
		try {
			const response = await fetch(`/api/prompts/${promptId}/like`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			
			const data = await response.json();
			
			if (response.ok) {
				return { success: true, data };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error' };
		}
	},

	async login(email: string, password: string) {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				return { success: true, user: data.user, token: data.token };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error' };
		}
	},

	async signup(username: string, email: string, password: string) {
		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, email, password })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				return { success: true, user: data.user, token: data.token };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: 'Network error' };
		}
	}
};

// Auth store
function createAuthStore() {
	const defaultState: AuthState = {
		user: null,
		token: null,
		isAuthenticated: false
	};

	const { subscribe, set, update } = writable<AuthState>(defaultState);

	// Load from localStorage on initialization
	if (browser) {
		const stored = localStorage.getItem('auth');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				set(parsed);
			} catch (e) {
				console.error('Failed to parse stored auth:', e);
			}
		}
	}

	return {
		subscribe,
		login: async (email: string, password: string) => {
			const result = await api.login(email, password);
			if (result.success) {
				const newState = { user: result.user, token: result.token, isAuthenticated: true };
				set(newState);
				if (browser) {
					localStorage.setItem('auth', JSON.stringify(newState));
				}
				return { success: true };
			} else {
				return { success: false, error: result.error };
			}
		},
		logout: () => {
			set(defaultState);
			if (browser) {
				localStorage.removeItem('auth');
			}
		},
		signup: async (username: string, email: string, password: string) => {
			const result = await api.signup(username, email, password);
			if (result.success) {
				const newState = { user: result.user, token: result.token, isAuthenticated: true };
				set(newState);
				if (browser) {
					localStorage.setItem('auth', JSON.stringify(newState));
				}
				return { success: true };
			} else {
				return { success: false, error: result.error };
			}
		}
	};
}

// Prompts store
function createPromptsStore() {
	const { subscribe, set, update } = writable<Prompt[]>([]);

	return {
		subscribe,
		loadPrompts: async (category?: string, search?: string) => {
			const result = await api.fetchPrompts(category, search);
			if (result.success) {
				set(result.prompts);
				return { success: true };
			} else {
				return { success: false, error: result.error };
			}
		},
		add: async (prompt: { title: string; prompt: string; category: string; tags: string[] }, token: string) => {
			const result = await api.createPrompt(prompt, token);
			if (result.success) {
				update(prompts => [result.prompt, ...prompts]);
				return { success: true };
			} else {
				return { success: false, error: result.error };
			}
		},
		like: async (promptId: string, token: string) => {
			const result = await api.toggleLike(promptId, token);
			if (result.success) {
				update(prompts => 
					prompts.map(prompt => {
						if (prompt.id === promptId) {
							return {
								...prompt,
								likes: result.data.likes,
								likedBy: result.data.isLiked 
									? [...prompt.likedBy, 'current-user'] 
									: prompt.likedBy.filter(id => id !== 'current-user')
							};
						}
						return prompt;
					})
				);
				return { success: true };
			} else {
				return { success: false, error: result.error };
			}
		}
	};
}

// Create stores
export const auth = createAuthStore();
export const prompts = createPromptsStore();

// Derived stores
export const currentUser = derived(auth, $auth => $auth.user);
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);
export const authToken = derived(auth, $auth => $auth.token);

// Theme store for dark mode
function createThemeStore() {
	const defaultTheme: ThemeState = { isDark: false };
	const { subscribe, set, update } = writable<ThemeState>(defaultTheme);

	// Load theme from localStorage on initialization
	if (browser) {
		const stored = localStorage.getItem('theme');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				set(parsed);
				// Apply theme to document
				if (parsed.isDark) {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			} catch (e) {
				console.error('Failed to parse stored theme:', e);
			}
		} else {
			// Check system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const systemTheme = { isDark: prefersDark };
			set(systemTheme);
			if (prefersDark) {
				document.documentElement.classList.add('dark');
			}
			localStorage.setItem('theme', JSON.stringify(systemTheme));
		}
	}

	return {
		subscribe,
		toggle: () => {
			update(theme => {
				const newTheme = { ...theme, isDark: !theme.isDark };
				if (browser) {
					// Apply theme to document
					if (newTheme.isDark) {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
					// Save to localStorage
					localStorage.setItem('theme', JSON.stringify(newTheme));
				}
				return newTheme;
			});
		},
		setDark: (isDark: boolean) => {
			const newTheme = { isDark };
			set(newTheme);
			if (browser) {
				if (isDark) {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
				localStorage.setItem('theme', JSON.stringify(newTheme));
			}
		}
	};
}

export const theme = createThemeStore();
export const isDark = derived(theme, $theme => $theme.isDark);

// Search store
export const searchQuery = writable('');

// Export API for use in components
export { api };
