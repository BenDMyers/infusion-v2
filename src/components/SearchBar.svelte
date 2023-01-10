<script>
	import Select from 'svelte-select';
	export let options;
</script>

<Select
	name="search"
	id="search"
	class="search"
	items={options}
	inputAttributes={{
		'aria-label': 'Search for a brand or tea',
		autocomplete: 'off',
		'data-lpignore': 'true',
		type: 'search'
	}}
	clearable={false}
	placeholder="Search for a brand or tea"
>
	<div slot="item" let:item>
		<span data-label data-item-type={item.subtitle ? 'tea' : 'brand'}>
			{item.label}
		</span>
		{#if item.subtitle}
			<span data-brand-flag>
				{item.subtitle}
			</span>
		{/if}
	</div>
</Select>

<style>
	:global(.search .item) {
		--item-line-height: 1.35;
		--item-padding: 0 10px;
		overflow: unset !important;
		white-space: unset !important;
		display: flex;
	}

	:global(.item),
	:global(.item) * {
		cursor: pointer;
	}

	[slot="item"] {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	[data-label] {
		display: inline-block;
	}

	[data-item-type="brand"] {
		font-weight: 700;
	}

	[data-brand-flag] {
		display: inline-block;
		min-width: fit-content;
		max-width: min(max-content, calc(available-size / 2));
		text-overflow: ellipsis;
		background-color: #ddd;
		color: #333;
		font-size: 0.7rem;
		font-weight: bold;
		padding-inline: 0.35rem;
		padding-block: 0.2rem;
		border-radius: 10%;
	}
</style>