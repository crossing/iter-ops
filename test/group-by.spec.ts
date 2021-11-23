import {expect} from './header';
import {pipe, groupBy, reduce, tap} from '../src';

describe('groupBy', () => {
    const people = [
        {name: 'Sue', age: 25},
        {name: 'Joe', age: 30},
        {name: 'Frank', age: 25},
        {name: 'Sarah', age: 35}
    ];
    describe('with key selector', () => {
        it('must group by selector', () => {
            const output = pipe(people, groupBy(person => person.age));
            expect([...output]).to.eql([
                [{age: 25, name: 'Sue'}, {age: 25, name: 'Frank'}],
                [{age: 30, name: 'Joe'}],
                [{age: 35, name: 'Sarah'}]
            ]);
        });
    });
    describe('with property name', () => {
        it('must group by property', () => {
            const output = pipe(people, groupBy('age'));
            expect([...output]).to.eql([
                {
                    25: [{age: 25, name: 'Sue'}, {age: 25, name: 'Frank'}]
                },
                {
                    30: [{age: 30, name: 'Joe'}]
                },
                {
                    35: [{age: 35, name: 'Sarah'}]
                }
            ]);
        });
        it('must resolve types correctly', () => {
            // this is mainly a type-casting test;
            const output = pipe(
                people,
                groupBy('age'),
                tap((value) => {
                    const a: { age: number, name: string }[] = value.bla; // TODO: this must not resolve!
                }),
                reduce((c, i) => ({...c, ...i}), {})
            );
        });
    });
});
