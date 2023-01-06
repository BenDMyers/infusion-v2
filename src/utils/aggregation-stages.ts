export const nameLowercase = {
	$addFields: {
		nameLowercase: {$toLower: '$name'}
	}
};

export const sortByName = {
	$sort: {
		nameLowercase: 1
	}
};

export const sortCaseInsensitively = [nameLowercase, sortByName];