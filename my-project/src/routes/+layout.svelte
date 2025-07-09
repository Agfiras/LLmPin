<script lang="ts">
	import '../app.css';
	import { auth, currentUser, searchQuery, theme, isDark } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Search, Plus, User, LogOut, Sun, Moon } from 'lucide-svelte';
	
	function handleLogout() {
		auth.logout();
		goto('/');
	}
	
	function toggleTheme() {
		theme.toggle();
	}
</script>

<nav class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href="/" class="flex items-center">
					<span class="text-2xl font-bold text-red-600 dark:text-red-400">PromptPin</span>
				</a>
			</div>
			
			<!-- Navigation -->
			<div class="flex items-center space-x-4">
				<!-- Dark Mode Toggle -->
				<button
					on:click={toggleTheme}
					class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
					title={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if $isDark}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>
				
				{#if $currentUser}
					<a
						href="/create"
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						<Plus class="h-4 w-4 mr-2" />
						Create
					</a>
					
					<div class="relative group">
						<button class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:text-gray-900 dark:focus:text-gray-100">
							<User class="h-5 w-5 mr-1" />
							{$currentUser.username}
						</button>
						
						<div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
							<button
								on:click={handleLogout}
								class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
							>
								<LogOut class="h-4 w-4 mr-2" />
								Sign out
							</button>
						</div>
					</div>
				{:else}
					<a
						href="/login"
						class="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium"
					>
						Log in
					</a>
					<a
						href="/signup"
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Sign up
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

<main class="bg-gray-50 dark:bg-gray-900 min-h-screen grain-overlay">
	<slot />
</main>
