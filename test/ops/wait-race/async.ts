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
    it('must resolve correctly', async () => {
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
        // TODO: This test must pass once issue #182 has been resolved
        /*
        expect(output.map(a => a.value), 'Missing resolution values').to.include.members(input);
        expect(output[0].delay, 'First resolution took too long').to.be.lessThan(85);
        expect(output[1].delay, 'Second resolution took too long').to.be.lessThan(145);
        expect(output[input.length - 1].delay, 'Last resolution took too long').to.be.lessThan(470);
         */
    });
};
