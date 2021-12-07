import {createAsync, expect, getAsyncValues} from './header';
import {pipe, filter} from '../src';

describe('sync filter', () => {
    it('must emit on condition', () => {
        const input = [1, 2, 3, 4, 5, 0];
        const output = pipe(input, filter(a => a < 3));
        expect([...output]).to.eql([1, 2, 0]);
    });
    it('must reuse the state object', () => {
        const input = 'hello!';
        const arr: number[] = [];
        const output = pipe(input, filter((value, index, state) => {
            state.count = state.count ?? 0;
            state.count++;
            arr.push(state.count);
            return false;
        }));
        [...output];
        expect(arr).to.eql([1, 2, 3, 4, 5, 6]);
    });
});

describe('async filter', () => {
    it('must emit on condition', async () => {
        const input = createAsync([1, 2, 3, 4, 5, 0]);
        const output = pipe(input, filter(a => a < 3));
        expect(await getAsyncValues(output)).to.eql([1, 2, 0]);
    });
    it('must reuse the state object', async () => {
        const input = createAsync('hello!');
        const arr: number[] = [];
        const output = pipe(input, filter((value, index, state) => {
            state.count = state.count ?? 0;
            state.count++;
            arr.push(state.count);
            return false;
        }));
        await getAsyncValues(output);
        expect(arr).to.eql([1, 2, 3, 4, 5, 6]);
    });
});
