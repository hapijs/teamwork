import { describe, expectTypeOf, it } from 'vitest';

import { Events, Team } from '../src/index.js';

describe('typings', () => {
    describe('Team', () => {
        describe('constructor', () => {
            it('call signatures compile', () => {
                expectTypeOf(new Team()).toEqualTypeOf<Team>();
                expectTypeOf(new Team({ meetings: 2 })).toEqualTypeOf<Team>();
                expectTypeOf(new Team({ strict: true })).toEqualTypeOf<Team>();
            });

            it('invalid calls rejected', () => {
                // @ts-expect-error unknown option key
                new Team({ foo: true });
                try {
                    // @ts-expect-error meetings must be a number
                    new Team({ meetings: 'foo' });
                } catch {}
            });
        });

        describe('attend', () => {
            it('accepts notes matching the results type', () => {
                expectTypeOf(new Team().attend()).toBeVoid();

                // Attending with an error rejects work(), so the runtime pass needs a handler

                const failed = new Team();
                failed.work.catch(() => {});
                expectTypeOf(failed.attend(new Error())).toBeVoid();

                expectTypeOf(new Team<string>().attend('foo')).toBeVoid();
                expectTypeOf(new Team<string[]>().attend('foo')).toBeVoid();
                expectTypeOf(new Team<[boolean, string]>().attend('foo')).toBeVoid();
            });

            it('invalid calls rejected', () => {
                // @ts-expect-error note must match the results type
                new Team<boolean>().attend('foo');
                // @ts-expect-error note must match the results element type
                new Team<boolean[]>().attend('foo');
            });
        });

        describe('work', () => {
            it('resolves with the results type', () => {
                expectTypeOf(new Team().work).toEqualTypeOf<Promise<void>>();
                expectTypeOf(new Team<boolean>().work).toEqualTypeOf<Promise<boolean>>();
                expectTypeOf(new Team<boolean[]>().work).toEqualTypeOf<Promise<boolean[]>>();
            });
        });

        describe('regroup', () => {
            it('call signatures compile', () => {
                expectTypeOf(new Team().regroup()).toEqualTypeOf<Promise<void>>();
                expectTypeOf(new Team().regroup({ meetings: 2 })).toEqualTypeOf<Promise<void>>();
                expectTypeOf(new Team().regroup({ strict: true })).toEqualTypeOf<Promise<void>>();
            });
        });
    });

    describe('Events', () => {
        describe('emit', () => {
            it('accepts only the event type', () => {
                const events = new Events<string>();

                expectTypeOf(events.emit('foo')).toBeVoid();
                expectTypeOf(events.end()).toBeVoid();
            });

            it('invalid calls rejected', () => {
                const events = new Events<string>();

                // @ts-expect-error event must match the emitter type
                events.emit(1);
            });
        });

        describe('iterator', () => {
            it('is an async iterator of the event type', async () => {
                const events = new Events<number>();

                const iterator = events.iterator();
                expectTypeOf(iterator).toExtend<AsyncIterator<number>>();

                events.emit(1);
                events.emit(2);
                events.emit(3);
                events.end();

                const items: number[] = [];
                for await (const item of iterator) {
                    expectTypeOf(item).toBeNumber();
                    items.push(item);
                }

                expectTypeOf(items).toEqualTypeOf<number[]>();
            });
        });
    });
});
