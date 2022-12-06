import {
    $A,
    $S,
    AsyncOperation,
    DuelOperation,
    FlattenAsync,
    FlattenSync,
    SyncOperation,
} from '../types';
import {createDuelOperation} from '../utils';

/**
 * Expands / flattens sub-iterables up to the specified `depth` (default is 1).
 *
 * ```ts
 * import {pipe, flat} from 'iter-ops';
 *
 * const i = pipe(
 *     ['one', [2, 3, [4, 5]]],
 *     flat(2)
 * );
 *
 * console.log(...i); //=> 'o', 'n', 'e', 2, 3, 4, 5
 * ```
 *
 * It implements the logic consistent with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat Array.prototype.flat()},
 * handling non-iterable values without throwing errors (unlike {@link spread}), and with optional `depth` support.
 *
 * Note that when handling a synchronous iterable, this operator can only expand synchronous sub-iterables.
 * But when handling an asynchronous iterable, it can expand mixed sub-iterables, i.e. any combination of
 * synchronous and asynchronous sub-iterables.
 *
 * Compare it to a more strict {@link spread} operator.
 *
 * @see
 *  - {@link spread}
 *  - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat Array.prototype.flat()}
 * @category Sync+Async
 */
export function flat<T, N extends number = 1>(
    depth?: N
): DuelOperation<T, FlattenSync<T, N> | FlattenAsync<T, N>> {
    return createDuelOperation<T, FlattenSync<T, N> | FlattenAsync<T, N>>(
        flatSync as any,
        flatAsync as any,
        [depth]
    );
}

/**
 * Expands / flattens sub-iterables up to the specified `depth` (default is 1).
 *
 * ```ts
 * import {pipe, flat} from 'iter-ops';
 *
 * const i = pipe(
 *     ['one', [2, 3, [4, 5]]],
 *     flat(2)
 * );
 *
 * console.log(...i); //=> 'o', 'n', 'e', 2, 3, 4, 5
 * ```
 *
 * It implements the logic consistent with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat Array.prototype.flat()},
 * handling non-iterable values without throwing errors (unlike {@link spread}), and with optional `depth` support.
 *
 * Compare it to a more strict {@link spread} operator.
 *
 * @see
 *  - {@link spread}
 *  - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat Array.prototype.flat()}
 * @category Operations
 */
export function flatSync<T, N extends number = 1>(
    depth: N = 1 as N
): SyncOperation<T, FlattenSync<T, N>> {
    return (iterable) => ({
        [$S]() {
            const d: Iterator<any>[] = new Array(depth + 1);
            d[0] = iterable[$S]();
            let level = 0;
            return {
                next() {
                    do {
                        const v = d[level].next(); // next value
                        if (v.done) {
                            if (!level) {
                                return v; // we are finished
                            }
                            level--; // back to upper level
                            continue;
                        }
                        if (level === depth) {
                            return v; // maximum depth reached
                        }
                        const i = (v.value as Iterable<T>)?.[$S]?.();
                        if (!i) {
                            return v; // non-iterable value
                        }
                        d[++level] = i; // save next iterable
                    } while (true);
                },
            };
        },
    });
}

/**
 * Expands / flattens sub-iterables up to the specified `depth` (default is 1).
 *
 * ```ts
 * import {pipe, flat} from 'iter-ops';
 *
 * const i = pipe(
 *     ['one', [2, 3, [4, 5]]],
 *     flat(2)
 * );
 *
 * console.log(...i); //=> 'o', 'n', 'e', 2, 3, 4, 5
 * ```
 *
 * It implements the logic consistent with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat Array.prototype.flat()},
 * handling non-iterable values without throwing errors (unlike {@link spread}), and with optional `depth` support.
 *
 * Compare it to a more strict {@link spread} operator.
 *
 * @see
 *  - {@link spread}
 *  - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat Array.prototype.flat()}
 * @category Operations
 */

export function flatAsync<T, N extends number = 1>(
    depth: N = 1 as N
): AsyncOperation<T, FlattenAsync<T, N>> {
    type AnyValue = T | Iterator<T> | AsyncIterator<T>;
    return (iterable) => ({
        [$A]() {
            const d: {i: any; sync: boolean}[] = new Array(depth + 1);
            d[0] = {i: iterable[$A](), sync: false};
            let level = 0;
            return {
                next() {
                    const v = d[level].i.next(); // next value
                    if (d[level].sync) {
                        if (v.done) {
                            level--; // back to upper level
                            return this.next();
                        }
                        if (level === depth) {
                            return Promise.resolve(v); // maximum depth reached
                        }
                        let i: AnyValue = v.value?.[$S]?.(); // first try with sync
                        let sync = true;
                        if (!i) {
                            i = v.value?.[$A]?.(); // then try with async
                            if (!i) {
                                return Promise.resolve(v); // non-iterable value
                            }
                            sync = false;
                        }
                        d[++level] = {i, sync}; // save next iterable
                        return this.next();
                    }
                    return v.then(
                        (
                            a: IteratorResult<
                                T | Iterable<T> | AsyncIterable<T>
                            >
                        ) => {
                            if (a.done) {
                                if (!level) {
                                    return a; // we are finished
                                }
                                level--; // back to upper level
                                return this.next();
                            }
                            if (level === depth) {
                                return a; // maximum depth reached
                            }
                            let i: AnyValue = (a.value as AsyncIterable<T>)?.[
                                $A
                            ]?.(); // first, try with async
                            let sync = false;
                            if (!i) {
                                i = (a.value as Iterable<T>)?.[$S]?.(); // then try with sync
                                if (!i) {
                                    return a; // non-iterable value
                                }
                                sync = true;
                            }
                            d[++level] = {i, sync}; // save next iterable
                            return this.next();
                        }
                    );
                },
            };
        },
    });
}
