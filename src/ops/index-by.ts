import {createDuelOperation} from '../utils';
import {
    $A,
    $S,
    AsyncOperation,
    DuelOperation,
    IterationState,
    SyncOperation,
} from '../types';
import {isPromiseLike} from '../typeguards';

/**
 * Pair of `{index, value}` that passed predicate test of {@link indexBy} operator.
 *
 * @see {@link indexBy}
 */
export interface IIndexedValue<T> {
    /**
     * Index of the value that passed the predicate test.
     */
    index: number;

    /**
     * Value that corresponds to the `index`.
     */
    value: T;
}

/**
 * Emits indexed values that pass the predicate test.
 *
 * ```ts
 * import {pipe, indexBy} from 'iter-ops';
 *
 * const i = pipe(
 *     [12, 7, 30, 9],
 *     indexBy(a => a % 2 === 0) // index even numbers
 * );
 *
 * console.log(...i); //=> {index: 0, value: 12}, {index: 2, value: 30}
 * ```
 *
 * Note that the predicate can only return a `Promise` inside an asynchronous pipeline,
 * or else the `Promise` will be treated as a truthy value.
 *
 * @see
 *  - {@link IIndexedValue}
 * @category Sync+Async
 */
export function indexBy<T>(
    cb: (
        value: T,
        index: number,
        state: IterationState
    ) => boolean | Promise<boolean>
): DuelOperation<T, IIndexedValue<T>> {
    return createDuelOperation<T, IIndexedValue<T>>(indexBySync, indexByAsync, [
        cb,
    ]);
}

/**
 * Emits indexed values that pass the predicate test.
 *
 * ```ts
 * import {pipe, indexBy} from 'iter-ops';
 *
 * const i = pipe(
 *     [12, 7, 30, 9],
 *     indexBy(a => a % 2 === 0) // index even numbers
 * );
 *
 * console.log(...i); //=> {index: 0, value: 12}, {index: 2, value: 30}
 * ```
 *
 * @see
 *  - {@link IIndexedValue}
 *
 * @category Operations
 */
export function indexBySync<T>(
    cb: (value: T, index: number, state: IterationState) => boolean
): SyncOperation<T, IIndexedValue<T>> {
    return (iterable) => ({
        [$S]() {
            const i = iterable[$S]();
            const state: IterationState = {};
            let index = -1;
            return {
                next() {
                    let a;
                    while (
                        !(a = i.next()).done &&
                        !cb(a.value, ++index, state)
                    );
                    return a.done
                        ? a
                        : {value: {index, value: a.value}, done: false};
                },
            };
        },
    });
}

/**
 * Emits indexed values that pass the predicate test.
 *
 * ```ts
 * import {pipe, indexBy} from 'iter-ops';
 *
 * const i = pipe(
 *     [12, 7, 30, 9],
 *     indexBy(a => a % 2 === 0) // index even numbers
 * );
 *
 * console.log(...i); //=> {index: 0, value: 12}, {index: 2, value: 30}
 * ```
 *
 * @see
 *  - {@link IIndexedValue}
 *
 * @category Operations
 */
export function indexByAsync<T>(
    cb: (
        value: T,
        index: number,
        state: IterationState
    ) => boolean | Promise<boolean>
): AsyncOperation<T, IIndexedValue<T>> {
    return (iterable) => ({
        [$A]() {
            const i = iterable[$A]();
            const state: IterationState = {};
            let index = -1;
            return {
                next() {
                    return i.next().then((a) => {
                        if (a.done) {
                            return a;
                        }
                        const r = cb(
                            a.value,
                            ++index,
                            state
                        ) as Promise<boolean>;
                        const out = (flag: any) =>
                            flag
                                ? {value: {index, value: a.value}, done: false}
                                : this.next();
                        return isPromiseLike(r) ? r.then(out) : out(r);
                    });
                },
            };
        },
    });
}
