const COEFFICIENTS = [1, -1];

type Comparator<E> = (a: E, b: E) => number;
type ComparatorCouplet<E> = {asc: Comparator<E>, desc: Comparator<E>};

/**
 * Generates ascending and descending comparators based on some given attribute.
 * @param {function} toComparable - a function that converts an array element into a more easily comparable data type
 * @return {{asc: function, desc: function}} - an object with an `asc` property of an ascending comparator and a `desc` property of a descending comparator
 */
export function comparators<E>(toComparable: Function): ComparatorCouplet<E> {
    if(!toComparable) {
        throw new Error('toComparable is required');
    } else if(typeof toComparable !== 'function') {
        throw new TypeError('toComparable is not a function');
    }

    const [asc, desc] = COEFFICIENTS.map((coefficient) => {
        return (a: E, b: E) => {
            const aComparable = toComparable(a);
            const bComparable = toComparable(b);
            if(aComparable === bComparable) {
                return 0;
            } else {
                let comparison = (aComparable > bComparable) ? 1 : -1;
                return (coefficient * comparison);
            }
        };
    });

    return {asc, desc};
};

/**
 * Combines multiple comparators into new ascending and descending comparators.
 * @param {...function} rest - all comparators, in order of precedence
 * @return {{asc: function, desc: function}} - an object with an `asc` property of an ascending comparator and a `desc` property of a descending comparator
 */
export function composeComparators<E>(...rest: Comparator<E>[]): ComparatorCouplet<E> {
    if(!rest.length) {
        throw new Error('No comparators to compose');
    } else if(rest.some(comparator => typeof comparator !== 'function')) {
        throw new TypeError('All arguments must be functions');
    }

    const [asc, desc] = COEFFICIENTS.map((coefficient) => {
        return (a: E, b: E) => {
            for(let i = 0, len = rest.length; i < len; i++) {
                const comparison = rest[i](a, b);
                if(comparison) {
                    return coefficient * comparison;
                }
                else if(i === len - 1) {
                    return 0;
                }
            }
        };
    });

    return {asc, desc} as ComparatorCouplet<E>;
};

interface WithName {
	name: string;
};

interface WithDate {
	date: Date
};

export const byName = comparators((a: WithName) => a.name.toLocaleLowerCase());
export const byDate = comparators((a: WithDate) => a.date);