import type { Month } from '../types/api';

type MonthRange = {start: Month, end: Month};

const MONTHS: Month[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatContiguousMonths(monthsAvailable: Month[] = []) {
	if (monthsAvailable.length === 0 || monthsAvailable.length >= 12) {
		return 'January–December';
	}

	// A little bit of optimization work here
	if (monthsAvailable.length === 1) {
		return monthsAvailable[0];
	}

	// Okay, now let's party
	let inRange = false;

	const monthRanges = MONTHS.reduce((ranges, month) => {
		if (!monthsAvailable.includes(month)) {
			inRange = false;
		} else if (inRange) {
			// This month is in a range that has already been started
			let currentRange = ranges[ranges.length - 1];
			currentRange.end = month;
		} else {
			// This month is the start of a range
			inRange = true;
			ranges.push({start: month, end: month} as MonthRange);
		}

		return ranges;
	}, [] as MonthRange[]);

	// Massage ranges if December and January are both part of the same range
	if (monthsAvailable.includes('January') && monthsAvailable.includes('December')) {
		const januaryRange = monthRanges.shift();
		const decemberRange = monthRanges[monthRanges.length - 1];
		if (januaryRange && decemberRange) {
			decemberRange.end = januaryRange.end;
		}
	}

	const rangeStrings = monthRanges.map(range => {
		if (range.start === range.end) {
			return range.start;
		} else {
			return `${range.start}–${range.end}`;
		}
	});

	return rangeStrings.join(', ');
}