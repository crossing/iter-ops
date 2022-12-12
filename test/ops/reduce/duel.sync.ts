import {expect} from '../../header';
import {pipe, reduce} from '../../../src';

export default () => {
    it('must work with initial value', () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const output = pipe(
            input,
            reduce((c, i) => c + i, 5)
        );
        expect(output.first).to.eql(50);
    });
    it('must work without initial value', () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const output = pipe(
            input,
            reduce((c, i) => c + i)
        );
        expect(output.first).to.eql(45);
    });
    it('must be able to convert the type', () => {
        const input = [
            [1, 2],
            [3, 4],
            [5, 6],
            [7, 8],
            [9, 0],
        ];
        const output = pipe(
            input,
            reduce((c, i) => c + i[0] * i[1], 0)
        );
        expect(output.first).to.eql(100);
    });
    it('must not generate more than one value', () => {
        const input = [1, 2];
        const output = pipe(
            input,
            reduce((a, c) => a + c)
        );
        const i = output[Symbol.iterator]();
        const result = i.next() && i.next();
        expect(result).to.eql({value: undefined, done: true});
    });
    it('must reuse the state object', () => {
        const input = 'hello!';
        const arr: number[] = [];
        const output = pipe(
            input,
            reduce((a, c, index, state) => {
                state.count = state.count ?? 0;
                state.count++;
                arr.push(state.count);
                return '';
            })
        );
        [...output];
        expect(arr).to.eql([1, 2, 3, 4, 5]);
    });
    it('must include 0 index when initial value is passed in', () => {
        const indexes: number[] = [];
        const output = pipe(
            [11, 22, 33],
            reduce((a, c, idx) => {
                indexes.push(idx);
                return 555;
            }, 77)
        );
        [...output];
        expect(indexes).to.eql([0, 1, 2]);
    });
    it('must exclude 0 index without initial value', () => {
        const indexes: number[] = [];
        const output = pipe(
            [11, 22, 33],
            reduce((a, c, idx) => {
                indexes.push(idx);
                return 555;
            })
        );
        [...output];
        expect(indexes).to.eql([1, 2]);
    });
};
