import {$A, $S, IterationState, Operation, UnknownIterable, Value} from '../types';
import {createOperation} from '../utils';

/**
 * Strategy for value injection by operator {@link injectIf}.
 *
 * @see {@link injectIf}
 */
export enum InjectionPosition {
    /**
     * Inject after the value.
     *
     * Any value greater than 0 is valid.
     */
    after = 1,

    /**
     * Inject before the value.
     *
     * Any value less than 0 is valid.
     */
    before = -1,

    /**
     * Replace the value.
     */
    replace = 0
}

/**
 * Injects
 *
 * @category Sync+Async
 */
export function injectIf<T, R>(value: Value<R>, cb: (
    value: T,
    index: number,
    state: IterationState
) => boolean | Promise<boolean>): Operation<T, T | R>;

export function injectIf(...args: unknown[]) {
    return createOperation(injectIfSync, injectIfAsync, args);
}

function injectIfSync<T>(iterable: Iterable<Iterable<T>>): Iterable<T> {
    return {
        [$S](): Iterator<T> {
            const i = iterable[$S]();
            let a: IteratorResult<Iterable<T>>,
                k: Iterator<T>,
                v: IteratorResult<T>,
                start = true,
                index = 0;
            return {
                next(): IteratorResult<T> {
                    do {
                        if (start) {
                            a = i.next();
                            start = false;
                            if (!a.done) {
                                k = a.value?.[$S]?.();
                                if (!k) {
                                    throw new TypeError(
                                        `Value at index ${index} is not iterable: ${JSON.stringify(
                                            a.value
                                        )}`
                                    );
                                }
                            }
                            index++;
                        }
                        if (!a.done) {
                            v = k.next();
                            if (!v.done) {
                                return v;
                            }
                            start = true;
                        }
                    } while (!a.done);
                    return a;
                },
            };
        },
    };
}

function injectIfAsync<T>(
    iterable: AsyncIterable<Iterable<T> | AsyncIterable<T>>
): AsyncIterable<T> {
    return {
        [$A](): AsyncIterator<T> {
            const i = iterable[$A]();
            let k: any,
                start = true,
                index = 0,
                sync: boolean;
            return {
                next(): Promise<IteratorResult<T>> {
                    const nextValue = (
                        wrap: boolean
                    ): Promise<IteratorResult<T>> => {
                        const out = (v: IteratorResult<T>) => {
                            if (!v.done) {
                                return sync && wrap ? Promise.resolve(v) : v;
                            }
                            start = true;
                            return this.next();
                        };
                        const r = k.next();
                        return sync ? out(r) : r.then(out);
                    };
                    if (start) {
                        start = false;
                        return i.next().then((a: IteratorResult<any>) => {
                            if (a.done) {
                                return a;
                            }
                            sync = true;
                            k = a.value?.[$S]?.();
                            if (!k) {
                                sync = false;
                                k = a.value?.[$A]?.();
                            }
                            if (!k) {
                                throw new TypeError(
                                    `Value at index ${index} is not iterable: ${JSON.stringify(
                                        a.value
                                    )}`
                                );
                            }
                            index++;
                            return nextValue(false);
                        });
                    }
                    return nextValue(true);
                },
            };
        },
    };
}
