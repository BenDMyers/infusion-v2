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

export const sortByUserDate = {
	$sort: {
		userDate: -1,
		date: -1,
		_id: 1
	}
};