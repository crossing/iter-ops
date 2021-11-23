import {expect} from './header';
import {pipe, groupBy} from '../src';

describe('groupBy', () => {
    it('must group by selector', () => {
        const people = [
            {name: 'Sue', age: 25},
            {name: 'Joe', age: 30},
            {name: 'Frank', age: 25},
            {name: 'Sarah', age: 35}
        ];
        const output = pipe(people, groupBy(person => person.age));
        expect([...output]).to.eql([
            [{age: 25, name: 'Sue'}, {age: 25, name: 'Frank'}],
            [{age: 30, name: 'Joe'}],
            [{age: 35, name: 'Sarah'}]
        ]);
    });
});
