import {Piper} from '../types';

/**
 * TODO: Here's the big one...
 *   grouping requires use of Map, and consuming all values before it can start
 *   emitting new values. This is a waste of an iterable, and makes the whole
 *   "group" operator a dubious proposal.
 *
 *   We do not want operators that require full iteration before they can start
 *   emitting (apart from the necessary ones: toArray, last, takeLast)
 */

/**
 * Groups objects/values into arrays of those, based on the returned selector value.
 */
export function groupBy<T>(keySelector: (value: T, index: number) => any): Piper<T, T[]>;

/**
 * Groups objects by property name, to be used as the key.
 *
 * This is usually followed by a "reduce" operator, to produce a single object:
 * reduce((c, i) => ({...c, ...i}), {})
 */
export function groupBy<T>(key: keyof T): Piper<T, { [key: string]: T[] }>;

/**
 * Check out:
 * - https://www.learnrxjs.io/learn-rxjs/operators/transformation/groupby
 * - https://sebhastian.com/javascript-group-by
 */
export function groupBy<T>(selector: any): Piper<T, any> {
    return (iterable: Iterable<T>) => ({
        [Symbol.iterator](): Iterator<T[]> {
            const i = iterable[Symbol.iterator]();
            // let index = 0;
            return {
                next(): IteratorResult<T[]> {
                    const a = i.next();
                    if (!a.done) {

                    }
                    return {value: undefined, done: true};
                }
            };
        }
    });
}


/*

// examples:

// this is useful, easy to remap into 1 object:
const a1 = [
    {1: ['one', 'two']},
    {2: ['three', 'four']},
    {3: ['111', '222']}
];

// this one is useless:
const a2: [number, any[]][] = [
    [1, ['one', 'two']],
    [2, ['three', 'four']],
    [3, ['111', '222']]
];

// this is the default:
const a3 = [
    [{key: 1, value: 'one'}, {key: 1, value: 'two'}],
    [{key: 2, value: 'three'}, {key: 2, value: 'four'}],
    [{key: 3, value: 'last'}]
];

const b1 = a1.reduce((c, i) => ({...c, ...i}), {});

const b2 = a2.reduce((c, i) => ({...c, [i[0]]: i[1]}), {});

// no can do, also pointless
// const b3 = a3.reduce((c, i) => ({...c, [i[0]]: i[1]}), {});

console.log(b2);
*/