<script lang="ts">
	import { auth } from '$lib/stores';
	import { goto } from '$app/navigation';
	
	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';
	
	async function handleSignup() {
		if (!username || !email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}
		
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		
		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}
		
		loading = true;
		error = '';
		
		const result = await auth.signup(username, email, password);
		
		if (result.success) {
			goto('/');
		} else {
			error = result.error || 'Signup failed';
		}
		
		loading = false;
	}
</script>

<svelte:head>
	<title>Sign Up - PromptPin</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Create your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				Or
				<a href="/login" class="font-medium text-red-600 hover:text-red-500">
					sign in to your existing account
				</a>
			</p>
		</div>
		
		<form class="mt-8 space-y-6" on:submit|preventDefault={handleSignup}>
			<div class="rounded-md shadow-sm space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Username
					</label>
					<input
						id="username"
						bind:value={username}
						type="text"
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
						placeholder="Choose a username"
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Email address
					</label>
					<input
						id="email"
						bind:value={email}
						type="email"
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
						placeholder="Enter your email"
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Password
					</label>
					<input
						id="password"
						bind:value={password}
						type="password"
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
						placeholder="Choose a password"
					/>
				</div>
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						bind:value={confirmPassword}
						type="password"
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
						placeholder="Confirm your password"
					/>
				</div>
			</div>
			
			{#if error}
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
					{error}
				</div>
			{/if}
			
			<div>
				<button
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Creating account...
					{:else}
						Create account
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
