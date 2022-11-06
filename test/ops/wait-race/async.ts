import {_asyncValues, expect} from '../../header';
import {pipeAsync, map, delay, waitRace} from '../../../src';

export default () => {
    it('must resolve all promises', async () => {
        const i = pipeAsync(
            [1, 2, 3, 4],
            map((a) => Promise.resolve(a)),
            waitRace(2)
        );
        expect(await _asyncValues(i)).to.have.members([1, 2, 3, 4]);
    });
    it('must resolve all simple values', async () => {
        const i = pipeAsync([1, 2, 3, 4], waitRace(2));
        expect(await _asyncValues(i)).to.have.members([1, 2, 3, 4]);
    });
    it('must resolve combinations of promises and simple values', async () => {
        const i = pipeAsync(
            [1, Promise.resolve(2), 3, Promise.resolve(4)],
            waitRace(2)
        );
        expect(await _asyncValues(i)).to.have.members([1, 2, 3, 4]);
    });
    it('must handle invalid size of cache', async () => {
        const i = pipeAsync([1, 2, 3, 4], waitRace(-1));
        expect(await _asyncValues(i)).to.have.members([1, 2, 3, 4]);
    });
    it('must reject when a value rejects', async () => {
        const i = pipeAsync([1, Promise.reject(2) as any, 3], waitRace(1));
        let err;
        try {
            await _asyncValues(i);
        } catch (e) {
            err = e;
        }
        expect(err).to.eql(2);
    });
    it('must start resolving without delay', async () => {
        const input = [1, 2, 3, 4, 5, 6, 7];
        const output: {value: number; delay: number}[] = [];
        const i = pipeAsync(
            input,
            delay(50),
            map((a) => Promise.resolve(a)),
            waitRace(5)
        );
        const start = Date.now();
        for await (const value of i) {
            const delay = Date.now() - start;
            output.push({value, delay});
        }
        /*
        // TODO: This test must pass once issue #182 has been resolved
        expect(output[0].delay).to.be.lessThan(75); // must be between 100 and 200
        expect(output[1].delay).to.be.lessThan(125); // must be between 200 and 300
         */
    });
};
