import {Piper} from '../types';

/**
 * Check out: https://www.learnrxjs.io/learn-rxjs/operators/transformation/groupby
 */
export function groupBy<T, K>(keySelector: (value: T, index: number) => K): Piper<T, T[]> {
    return (iterable: Iterable<T>) => ({
        [Symbol.iterator](): Iterator<T[]> {
            // const i = iterable[Symbol.iterator]();
            // let index = 0;
            return {
                next(): IteratorResult<T[]> {
                    return {value: undefined, done: true};
                }
            };
        }
    });
}
