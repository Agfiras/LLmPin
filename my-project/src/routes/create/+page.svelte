<script lang="ts">
	import { prompts, currentUser, authToken } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let title = '';
	let prompt = '';
	let category = 'creative';
	let tags = '';
	let loading = false;
	let error = '';
	
	const categories = [
		'creative',
		'coding', 
		'marketing',
		'education',
		'business',
		'food'
	];
	
	onMount(() => {
		// Redirect if not logged in
		if (!$currentUser) {
			goto('/login');
		}
	});
	
	async function handleSubmit() {
		if (!title.trim() || !prompt.trim()) {
			error = 'Please fill in all required fields';
			return;
		}
		
		if (!$currentUser || !$authToken) {
			error = 'You must be logged in to create prompts';
			return;
		}
		
		loading = true;
		error = '';
		
		const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
		
		const result = await prompts.add({
			title: title.trim(),
			prompt: prompt.trim(),
			category,
			tags: tagsArray
		}, $authToken);
		
		if (result.success) {
			goto('/');
		} else {
			error = result.error || 'Failed to create prompt';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Prompt - PromptPin</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Prompt</h1>
		<p class="text-gray-600 dark:text-gray-300">Share your amazing AI prompts with the community</p>
	</div>

	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Title -->
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Title *
				</label>
				<input
					id="title"
					bind:value={title}
					type="text"
					required
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					placeholder="Give your prompt a descriptive title"
				/>
			</div>

			<!-- Category -->
			<div>
				<label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Category
				</label>
				<select
					id="category"
					bind:value={category}
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
				>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>

			<!-- Prompt Content -->
			<div>
				<label for="prompt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Prompt Content *
				</label>
				<textarea
					id="prompt"
					bind:value={prompt}
					required
					rows="8"
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					placeholder="Write your AI prompt here. Be specific and clear about what you want the AI to do..."
				></textarea>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Tip: Include clear instructions, context, and examples for best results
				</p>
			</div>

			<!-- Tags -->
			<div>
				<label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Tags
				</label>
				<input
					id="tags"
					bind:value={tags}
					type="text"
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					placeholder="Separate tags with commas (e.g., creative writing, storytelling, fiction)"
				/>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Add relevant tags to help others discover your prompt
				</p>
			</div>

			{#if error}
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
					{error}
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
				<button
					type="button"
					on:click={() => goto('/')}
					class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={loading}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Creating...
					{:else}
						Create Prompt
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
