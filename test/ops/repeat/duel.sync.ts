import {expect} from '../../header';
import {pipe, repeat} from '../../../src';

export default () => {
    it('must not copy for 0 or negative count', () => {
        const i1 = pipe([1, 2], repeat(0));
        expect([...i1]).to.eql([1, 2]);
        const i2 = pipe([1, 2], repeat(-1));
        expect([...i2]).to.eql([1, 2]);
    });
    it('must copy for positive numbers', () => {
        const i1 = pipe([1, 2], repeat(1));
        expect([...i1]).to.eql([1, 1, 2, 2]);
        const i2 = pipe([1, 2], repeat(2));
        expect([...i2]).to.eql([1, 1, 1, 2, 2, 2]);
    });
    it('must copy for callbacks', () => {
        const i1 = pipe(
            [1, 2],
            repeat((value, index, count) => count < 1)
        );
        expect([...i1]).to.eql([1, 1, 2, 2]);
        const params: any[] = [];
        const i2 = pipe(
            [1, 2],
            repeat((value, index, count) => {
                params.push({value, index, count});
                return count < 2;
            })
        );
        expect([...i2]).to.eql([1, 1, 1, 2, 2, 2]);
        expect(params).to.eql([
            {value: 1, index: 0, count: 0},
            {value: 1, index: 0, count: 1},
            {value: 1, index: 0, count: 2},
            {value: 2, index: 1, count: 0},
            {value: 2, index: 1, count: 1},
            {value: 2, index: 1, count: 2},
        ]);
    });
};
