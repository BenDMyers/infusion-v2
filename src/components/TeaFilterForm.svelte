<script>
	import Select from 'svelte-select';
	import { field } from 'src/utils/field';
	import { availabilityValues, caffeineContentValues, yesNoValues } from 'src/utils/tea-enums';

	export let favoritedByDefault;
	export let brandOptions;
	export let teaTypeOptions;
	export let ingredientOptions;

	$: highestRating = '';

	const yesNoOptions = yesNoValues.map(value => ({label: value, value}));

	let brand;
	let teaType;
	let caffeineContent;
	let ingredients;
	let recommendedSteepTemperature;
	let availability;
	let steepedBefore;
	let favorited = favoritedByDefault ? yesNoOptions[1] : undefined;
	let wishlist;
	
	const availabilityOptions = availabilityValues.map(value => ({label: value, value}));
	const caffeineContentOptions = caffeineContentValues.map(value => ({label: value, value}));

	function handleChange(event) {
		const formData = new FormData(event.target.closest('form'));
		highestRating = formData.get('highestRating') || '';
	}

	function handleReset(event) {
		brand = undefined;
		teaType = undefined;
		caffeineContent = undefined;
		ingredients = undefined;
		recommendedSteepTemperature = undefined;
		availability = undefined;
		steepedBefore = undefined;
		highestRating = '';
		favorited = undefined;
		wishlist = undefined;
	}

	$: hasActiveValue = [brand, teaType, caffeineContent, ingredients, recommendedSteepTemperature, availability, steepedBefore, highestRating, favorited, wishlist].some(x => {
		if (!x) {
			return false;
		}

		if (x?.hasOwnProperty('value')) {
			return !!x.value;
		}

		return !!x;
	});

	$: {
		console.log([brand, teaType, caffeineContent, ingredients, recommendedSteepTemperature, availability, steepedBefore, highestRating, favorited, wishlist]);

		const brandSections = document.querySelectorAll('[data-brand]');
		const teaCards = document.querySelectorAll('[data-tea]');
		const noTeasMessage = document.querySelector('.no-teas-found');

		setTimeout(() => {
			if (hasActiveValue) {
				const form = document.querySelector('form[name="filters"]');
				const formData = new FormData(form);
				fetch('/api/teas', {method: 'post', body: formData})
					.then(async (res) => {
						const {data} = await res.json();
						const {brands, teas} = data;
						console.log(brands, teas);
						noTeasMessage.hidden = !!teas.length;
						brandSections.forEach(brandSection => {
							const brandId = brandSection.getAttribute('data-brand');
							const brandIsActive = brands.includes(brandId);
							brandSection.hidden = !brandIsActive;
						});
						teaCards.forEach(card => {
							const teaId = card.getAttribute('data-tea');
							const teaIsActive = teas.includes(teaId);
							card.hidden = !teaIsActive;
						});
					});
			} else {
				brandSections.forEach(brandSection => brandSection.hidden = false);
				teaCards.forEach(card => card.hidden = false);
				noTeasMessage.hidden = true;
			}
		}, 0);
	}
</script>

<form name="filters" on:reset={handleReset} on:change={handleChange}>
	<div class="row">
		<div data-field="vendor">
			<label for="vendor">Brand</label>
			<Select
				bind:value={brand}
				name="vendor"
				id="vendor"
				items={brandOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				showChevron
				placeholder=""
			/>
			<small id="vendor-error" class="error-message"></small>
		</div>
		<div data-field="teaType">
			<label for="teaType">Type</label>
			<Select
				bind:value={teaType}
				name="teaType"
				id="teaType"
				items={teaTypeOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				multiple
				clearable={false}
				showChevron
				placeholder=""
			/>
			<small id="teaType-error" class="error-message"></small>
		</div>
		<div data-field="caffeineLevel">
			<label for="caffeineLevel">Caffeine Content</label>
			<Select
				bind:value={caffeineContent}
				name="caffeineLevel"
				id="caffeineLevel"
				items={caffeineContentOptions}
				clearable={false}
				searchable={false}
				showChevron
				placeholder=""
			/>
			<small id="caffeineLevel-error" class="error-message"></small>
		</div>
		<div data-field="ingredients">
			<label for="ingredients">Ingredients</label>
			<Select
				bind:value={ingredients}
				name="ingredients"
				id="ingredients"
				items={ingredientOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				multiple
				clearable={false}
				showChevron
				placeholder=""
			/>
			<small id="ingredients-error" class="error-message"></small>
		</div>
	</div>
	<div class="row">
		<div data-field="recommendedSteepTemperature">
			<label for="recommendedSteepTemperature">Recommended Temperature (℉)</label>
			<input
				{...field('recommendedSteepTemperature')}
				type="number"
				bind:value={recommendedSteepTemperature}
			/>
			<small id="recommendedSteepTemperature-error" class="error-message"></small>
		</div>
		<div data-field="availability">
			<label for="availability">Current Availability</label>
			<Select
				bind:value={availability}
				name="availability"
				id="availability"
				items={availabilityOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				clearable={false}
				showChevron
				placeholder=""
				searchable={false}
			/>
			<small id="availability-error" class="error-message"></small>
		</div>
		<div data-field="steepedBefore">
			<label for="steepedBefore">Steeped Before?</label>
			<Select
				bind:value={steepedBefore}
				name="steepedBefore"
				id="steepedBefore"
				items={yesNoOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				clearable={false}
				showChevron
				placeholder=""
				searchable={false}
			/>
			<small id="steepedBefore-error" class="error-message"></small>
		</div>
		<div data-field="highestRating">
			<fieldset>
				<legend>Rated at Least...</legend>
				<slot name="highest-rating-field" />
			</fieldset>
			<small id="highestRating-error" class="error-message"></small>
		</div>
	</div>
	<div class="row">
		<div data-field="favorited">
			<label for="favorited">Favorited?</label>
			<Select
				bind:value={favorited}
				name="favorited"
				id="favorited"
				items={yesNoOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				clearable={false}
				showChevron
				placeholder=""
				searchable={false}
			/>
			<small id="favorited-error" class="error-message"></small>
		</div>
		<div data-field="wishlist">
			<label for="wishlist">In Wishlist?</label>
			<Select
				bind:value={wishlist}
				name="wishlist"
				id="wishlist"
				items={yesNoOptions}
				inputAttributes={{
					autocomplete: 'off',
					'data-lpignore': 'true'
				}}
				clearable={false}
				showChevron
				placeholder=""
				searchable={false}
			/>
			<small id="wishlist-error" class="error-message"></small>
		</div>
	</div>
	<div>
		<button type="reset" disabled={!hasActiveValue}>
			<slot name="reset-sprite" />
			<span>Reset Filters</span>
		</button>
	</div>
</form>