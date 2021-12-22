import {IterationState, Operation} from '../types';
import {createOperation, isPromise} from '../utils';

/**
 * Standard `Array.some` logic for the iterable, extended with iteration state + async.
 *
 * It emits a `boolean`, indicating whether at least one element passes the predicate test.
 *
 * ```ts
 * import {pipe, some} from 'iter-ops';
 *
 * const i = pipe(
 *     [1, 2, 3],
 *     some(a => a % 2 === 0) // checks if even numbers are present
 * );
 *
 * console.log(...i); //=> true
 *
 * console.log(i.first); //=> true
 * ```
 *
 * Note that the predicate can only return a `Promise` inside an asynchronous pipeline,
 * or else the `Promise` will be treated as a truthy value.
 *
 * @see [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some), [[every]]
 * @category Sync+Async
 */
export function some<T>(cb: (value: T, index: number, state: IterationState) => boolean | Promise<boolean>): Operation<T, boolean> {
    return createOperation(someSync, someAsync, arguments);
}

function someSync<T>(iterable: Iterable<T>, cb: (value: T, index: number, state: IterationState) => boolean): Iterable<boolean> {
    return {
        [Symbol.iterator](): Iterator<boolean> {
            const i = iterable[Symbol.iterator]();
            const state: IterationState = {};
            let index = 0, finished: boolean;
            return {
                next(): IteratorResult<boolean> {
                    if (!finished) {
                        let a;
                        while (!(a = i.next()).done && !cb(a.value, index++, state));
                        finished = true;
                        return {value: !a.done, done: false};
                    }
                    return {value: undefined, done: true};
                }
            };
        }
    };
}

function someAsync<T>(iterable: AsyncIterable<T>, cb: (value: T, index: number, state: IterationState) => boolean | Promise<boolean>): AsyncIterable<boolean> {
    return {
        [Symbol.asyncIterator](): AsyncIterator<boolean> {
            const i = iterable[Symbol.asyncIterator]();
            const state: IterationState = {};
            let index = 0, finished: boolean;
            return {
                next(): Promise<IteratorResult<boolean>> {
                    if (finished) {
                        return Promise.resolve({value: undefined, done: true});
                    }
                    return i.next().then(a => {
                        const r = (a.done || cb(a.value, index++, state)) as Promise<boolean>;
                        const out = (flag: any) => {
                            finished = flag;
                            return finished ? {value: !a.done, done: false} : this.next();
                        };
                        return isPromise(r) ? r.then(out) : out(r);
                    });
                }
            };
        }
    };
}