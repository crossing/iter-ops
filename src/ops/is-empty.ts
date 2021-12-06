import {Operation} from '../types';

/**
 * Checks if the iterable can produce any value,
 * and returns a one-value iterable with the flag.
 */
export function isEmpty<T>(): Operation<T, boolean> {
    return null as any;/*
    return (iterable: Iterable<T>) => ({
        [Symbol.iterator](): Iterator<boolean> {
            let done = false;
            return {
                next(): IteratorResult<boolean> {
                    if (done) {
                        return {value: undefined, done};
                    }
                    const a = iterable[Symbol.iterator]().next();
                    done = true;
                    return {value: !!a.done};
                }
            };
        }
    });*/
}
