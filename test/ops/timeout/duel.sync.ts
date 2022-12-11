import {expect} from '../../header';
import {pipe, tap, timeout} from '../../../src';

export default () => {
    it('must end iteration after timeout', () => {
        const i = pipe(
            [1, 2, 3],
            tap(() => {
                syncDelay(5);
            }),
            timeout(8)
        );
        expect([...i]).to.eql([1, 2]);
    });
    it('must deactivate on negative timeouts', () => {
        const i = pipe([1, 2, 3], timeout(-1));
        expect([...i]).to.eql([1, 2, 3]);
    });
    it('must invoke callback on timeout', () => {
        let count;
        const i = pipe(
            [1, 2, 3],
            tap(() => {
                syncDelay(5);
            }),
            timeout(8, (c) => {
                count = c;
            })
        );
        expect([...i]).to.eql([1, 2]);
        expect(count).to.eql(2);
    });
    it('must not invoke callback without timeout', async () => {
        let invoked = false;
        const i = pipe(
            [1, 2, 3],
            timeout(1, () => {
                invoked = true;
            })
        );
        expect([...i]).to.eql([1, 2, 3]); // iterate all
        expect(invoked).to.be.false; // no callback
    });
};

function syncDelay(ms: number) {
    const start = Date.now();
    while (Date.now() - start < ms);
}
