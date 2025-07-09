<script lang="ts">
	import { onMount } from 'svelte';
	import { prompts, currentUser, searchQuery, authToken, api } from '$lib/stores';
	import type { Prompt } from '$lib/types';
	import { Heart, Copy, Tag, Calendar } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	
	let selectedCategory = 'all';
	let displayPrompts: Prompt[] = [];
	let loading = true;
	let error = '';
	
	const categories = ['all', 'creative', 'coding', 'marketing', 'education', 'business', 'food'];
	
	// Subscribe to prompts from store
	$: displayPrompts = $prompts;
	
	// Load prompts on mount and when filters change
	onMount(() => {
		loadPrompts();
	});
	
	// Reload when search or category changes
	$: if (selectedCategory !== undefined || $searchQuery !== undefined) {
		loadPrompts();
	}
	
	async function loadPrompts() {
		loading = true;
		error = '';
		
		const result = await prompts.loadPrompts(
			selectedCategory === 'all' ? undefined : selectedCategory,
			$searchQuery || undefined
		);
		
		if (!result.success) {
			error = result.error || 'Failed to load prompts';
		}
		
		loading = false;
	}
	
	async function toggleLike(promptId: string) {
		if (!$currentUser || !$authToken) {
			alert('Please log in to like prompts');
			return;
		}
		
		// console.log('Current user:', $currentUser);
		// console.log('Auth token:', $authToken);
		// console.log('Prompt ID:', promptId);
		
		const result = await prompts.like(promptId, $authToken);
		if (!result.success) {
			console.error('Like error:', result.error);
			alert(result.error || 'Failed to toggle like');
		} else {
			console.log('Like successful:', result);
		}
	}
	
	function copyPrompt(promptText: string) {
		navigator.clipboard.writeText(promptText).then(() => {
			alert('Prompt copied to clipboard!');
		}).catch(() => {
			alert('Failed to copy prompt');
		});
	}
	
	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>PromptPin - Discover Amazing AI Prompts</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Hero Section -->
	<div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Discover & Share Amazing AI Prompts
        </h1>
		<p class="text-xl text-gray-600 dark:text-white-300 max-w-2xl mx-auto">
			Find the perfect prompts for your AI conversations. Save favorites, explore categories, and share your creations with the community.
		</p>
	</div>

	<!-- Search and Filters -->
	<div class="mb-8">
		<div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
			<!-- Search -->
			<div class="w-full sm:w-auto flex-1 max-w-md">
				<input
					bind:value={$searchQuery}
					type="text"
					placeholder="Search prompts, tags, or content..."
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
				/>
			</div>
			
			<!-- Category Filter -->
			<div class="flex flex-wrap gap-2">
				{#each categories as category}
					<button
						class="px-4 py-2 rounded-full text-sm font-medium transition-colors {
							selectedCategory === category
								? 'bg-red-500 text-white'
								: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
						}"
						on:click={() => selectedCategory = category}
					>
						{category}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Prompts Grid -->
	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
		</div>
	{:else if error}
		<div class="text-center py-12">
			<p class="text-red-500 dark:text-red-400 text-lg">{error}</p>
			<button 
				on:click={loadPrompts}
				class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
			>
				Try Again
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each displayPrompts as prompt (prompt.id)}
			<div
				role="button"
				tabindex="0"
				class="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer group"
				on:click={() => goto(`/prompt/${prompt.id}`)}
				on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') goto(`/prompt/${prompt.id}`); }}
			>
				<!-- Header -->
				<div class="flex justify-between items-start mb-4">
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">{prompt.title}</h3>
						<div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
							<span class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors duration-300">
								{prompt.category}
							</span>
						</div>
					</div>
				</div>

				<!-- Content Preview -->
				<p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-4">
					{prompt.prompt.length > 150 
						? prompt.prompt.substring(0, 150) + '...' 
						: prompt.prompt}
				</p>

				<!-- Tags -->
				<div class="flex flex-wrap gap-1 mb-4">
					{#each prompt.tags as tag}
						<span class="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-300">
							<Tag class="w-3 h-3 mr-1" />
							{tag}
						</span>
					{/each}
				</div>

				<!-- Footer -->
				<div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors duration-300">
					<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
						<Calendar class="w-4 h-4 group-hover:text-red-500 transition-colors duration-300" />
						<span>{formatDate(prompt.createdAt)}</span>
					</div>
					
					<div class="flex items-center space-x-2">
						<button
							on:click={(e) => {
								e.stopPropagation();
								copyPrompt(prompt.prompt);
							}}
							class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 group-hover:text-red-500 transition-colors duration-300"
							title="Copy prompt"
						>
							<Copy class="w-4 h-4" />
						</button>
						
						<button
							on:click={(e) => {
								e.stopPropagation();
								toggleLike(prompt.id);
							}}
							class="flex items-center space-x-1 p-2 rounded-lg transition-all duration-300 {
								$currentUser && prompt.likedBy.includes($currentUser.id)
									? 'text-red-500 hover:text-red-600 hover:scale-110'
									: 'text-gray-400 dark:text-gray-500 hover:text-red-500 group-hover:text-red-500 hover:scale-110'
							}"
							title={$currentUser && prompt.likedBy.includes($currentUser.id) ? 'Unlike' : 'Like'}
						>
							<Heart class="w-4 h-4 {$currentUser && prompt.likedBy.includes($currentUser.id) ? 'fill-current' : ''}" />
							<span class="text-sm">{prompt.likes}</span>
						</button>
					</div>
				</div>

				<!-- Author -->
				<div class="flex items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
					<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
						{prompt.author.charAt(0)}
					</div>
					<span class="text-sm text-gray-600 dark:text-gray-300">by {prompt.author}</span>
				</div>
			</div>			{/each}
		</div>
	{/if}

	{#if !loading && !error && displayPrompts.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400 text-lg">No prompts found matching your criteria.</p>
			<p class="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or category filter.</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-4 {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
