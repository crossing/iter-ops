import {expectType} from 'tsd';

import type {IterableExt} from '../../../../src';
import {pipe, takeWhile} from '../../../../src/entry/sync';

declare const iterableNumber: Iterable<number>;

const test1 = pipe(
    iterableNumber,
    takeWhile((value) => true)
);
expectType<IterableExt<number>>(test1);
