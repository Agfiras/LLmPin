<script lang="ts">
	import { page } from '$app/stores';
	import { prompts, currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Heart, Copy, Tag, Calendar, ArrowLeft } from 'lucide-svelte';
	import type { Prompt } from '$lib/types';
	
	let prompt: Prompt | undefined;
	
	$: {
		const promptId = $page.params.id;
		prompt = $prompts.find(p => p.id === promptId);
	}
	
	function toggleLike() {
		if (!prompt || !$currentUser) {
			alert('Please log in to like prompts');
			return;
		}
		
		prompts.like(prompt.id, $currentUser.id);
	}
	
	function copyPrompt() {
		if (!prompt) return;
		
		navigator.clipboard.writeText(prompt.prompt).then(() => {
			alert('Prompt copied to clipboard!');
		}).catch(() => {
			alert('Failed to copy prompt');
		});
	}
	
	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>{prompt ? prompt.title : 'Prompt'} - PromptPin</title>
</svelte:head>

{#if prompt}
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Back Button -->
		<button
			on:click={() => goto('/')}
			class="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
		>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Back to prompts
		</button>

		<!-- Prompt Card -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
			<!-- Header -->
			<div class="mb-6">
				<div class="flex items-center justify-between mb-4">
					<span class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
						{prompt.category}
					</span>
					<div class="flex items-center space-x-2">
						<button
							on:click={copyPrompt}
							class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							<Copy class="w-4 h-4 mr-2" />
							Copy
						</button>
						<button
							on:click={toggleLike}
							class="inline-flex items-center px-3 py-2 border rounded-md text-sm transition-colors {
								$currentUser && prompt.likedBy.includes($currentUser.id)
									? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
									: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
							}"
						>
							<Heart class="w-4 h-4 mr-2 {$currentUser && prompt.likedBy.includes($currentUser.id) ? 'fill-current' : ''}" />
							{prompt.likes}
						</button>
					</div>
				</div>
				
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">{prompt.title}</h1>
				
				<!-- Author and Date -->
				<div class="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
					<div class="flex items-center">
						<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
							{prompt.author.charAt(0)}
						</div>
						<span>by {prompt.author}</span>
					</div>
					<div class="flex items-center">
						<Calendar class="w-4 h-4 mr-2" />
						<span>{formatDate(prompt.createdAt)}</span>
					</div>
				</div>
			</div>

			<!-- Prompt Content -->
			<div class="mb-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prompt</h2>
				<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border-l-4 border-red-500">
					<p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{prompt.prompt}</p>
				</div>
			</div>

			<!-- Tags -->
			{#if prompt.tags && prompt.tags.length > 0}
				<div class="mb-6">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
					<div class="flex flex-wrap gap-2">
						{#each prompt.tags as tag}
							<span class="inline-flex items-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
								<Tag class="w-3 h-3 mr-1" />
								{tag}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Usage Tips -->
			<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Usage Tips</h3>
				<ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1">
					<li>• Copy this prompt and paste it into your favorite AI chat interface</li>
					<li>• Customize it with your specific requirements</li>
					<li>• Add context relevant to your use case</li>
				</ul>
			</div>
		</div>
	</div>
{:else}
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prompt not found</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-6">The prompt you're looking for doesn't exist or has been removed.</p>
			<button
				on:click={() => goto('/')}
				class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to prompts
			</button>
		</div>
	</div>
{/if}
