export {
    IErrorContext,
    IterableExt,
    AsyncIterableExt,
    UnknownIterable,
    UnknownIterator,
    UnknownIterableOrIterator,
    Operation,
    SyncValue,
    Value,
    IterationState,
} from './common';

export {Decr} from './utils';

/**
 * These are for code abbreviation + smaller bundles:
 */
export const $S: typeof Symbol.iterator = Symbol.iterator;
export const $A: typeof Symbol.asyncIterator = Symbol.asyncIterator;
