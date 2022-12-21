interface HasWeight {
	weight: number;
}

export function choose<E>(list: E[]) {
	const randomIndex = Math.floor(Math.random() * list.length);
	return list[randomIndex];
}

export function chooseWeighted(list: HasWeight[]) {
	const filteredList = list.filter(option => option.weight > 0);
	let totalWeight = 0;
	for (const entry of filteredList) {
		totalWeight += entry.weight;
	}

	const threshold = Math.floor(Math.random() * totalWeight);

	let runningTotal = 0;
	for (const entry of filteredList) {
		runningTotal += entry.weight;
		if (runningTotal >= threshold) {
			return entry;
		}
	}
}