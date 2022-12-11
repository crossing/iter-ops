import {_async, _asyncValues, expect} from '../../header';
import {pipe, map, wait} from '../../../src';

export default () => {
    it('must resolve promises', async () => {
        const i = pipe(
            _async([1, 2, 3]),
            map((a) => Promise.resolve(a)),
            wait()
        );
        expect(await _asyncValues(i)).to.eql([1, 2, 3]);
    });
    it('must allow simple values', async () => {
        const i = pipe(_async([1, 2, 3]), wait());
        expect(await _asyncValues(i)).to.eql([1, 2, 3]);
    });
};
