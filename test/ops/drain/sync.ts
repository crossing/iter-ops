import {expect} from '../../header';
import {pipe, drain, tap} from '../../../src';

export default () => {
    it('must pull all values', () => {
        const c: number[] = [];
        const i = pipe(
            [1, 2, 3],
            tap((a) => {
                c.push(a);
            }),
            drain()
        );
        expect(i.first).to.be.undefined;
        expect(c).to.eql([1, 2, 3]);
    });
};
