<script lang="ts">
	import '../app.css';
	import { auth, currentUser, searchQuery } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Search, Plus, User, LogOut } from 'lucide-svelte';
	
	function handleLogout() {
		auth.logout();
		goto('/');
	}
</script>

<nav class="bg-white shadow-sm border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href="/" class="flex items-center">
					<span class="text-2xl font-bold text-red-600">PromptPin</span>
				</a>
			</div>
			
			<!-- Search Bar -->
			<div class="flex-1 max-w-lg mx-8">
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search class="h-5 w-5 text-gray-400" />
					</div>
					<input
						bind:value={$searchQuery}
						type="text"
						class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
						placeholder="Search prompts..."
					/>
				</div>
			</div>
			
			<!-- Navigation -->
			<div class="flex items-center space-x-4">
				{#if $currentUser}
					<a
						href="/create"
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						<Plus class="h-4 w-4 mr-2" />
						Create
					</a>
					
					<div class="relative group">
						<button class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900">
							<User class="h-5 w-5 mr-1" />
							{$currentUser.username}
						</button>
						
						<div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
							<button
								on:click={handleLogout}
								class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
							>
								<LogOut class="h-4 w-4 mr-2" />
								Sign out
							</button>
						</div>
					</div>
				{:else}
					<a
						href="/login"
						class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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

<main>
	<slot />
</main>
