import { describe, expect, it } from 'vitest';

import { Events, Team } from '../src/index.js';

describe('Team', () => {
    it('resolves when meeting is attended', async () => {
        const team = new Team();

        setTimeout(() => {
            team.attend();
        }, 100);

        await team.work;
    });

    it('resolves when all meetings are attended', async () => {
        const team = new Team({ meetings: 2 });

        let count = '';
        setTimeout(() => {
            count += '1';
            team.attend();
        }, 100);

        setTimeout(() => {
            count += '2';
            team.attend();
        }, 150);

        await team.work;

        expect(count).toEqual('12');

        expect(() => team.attend()).not.toThrow();
        expect(() => team.attend(new Error())).not.toThrow();
    });

    it('throws when too many meetings attended', async () => {
        const team = new Team({ meetings: 2, strict: true });

        team.attend();
        team.attend();

        await team.work;

        expect(() => team.attend()).toThrow('Unscheduled meeting');
        expect(() => team.attend(new Error())).toThrow('Unscheduled meeting');
    });

    it('resolves with a note', async () => {
        const team = new Team();

        setTimeout(() => {
            team.attend('1');
        }, 100);

        const note = await team.work;
        expect(note).toEqual('1');
    });

    it('resolves with notes', async () => {
        const team = new Team({ meetings: 2 });

        setTimeout(() => {
            team.attend('1');
        }, 100);

        setTimeout(() => {
            team.attend('2');
        }, 150);

        const notes = await team.work;
        expect(notes).toEqual(['1', '2']);
    });

    it('rejects on first error', async () => {
        const team = new Team({ meetings: 2 });

        setTimeout(() => {
            team.attend(new Error('boom'));
        }, 100);

        setTimeout(() => {
            team.attend('2');
        }, 150);

        await expect(team.work).rejects.toThrow('boom');
    });

    it('resets condition after initial condition met', async () => {
        const team = new Team({ meetings: 2, strict: true });

        let count = '';
        setTimeout(() => {
            count += '1';
            team.attend();
        }, 100);

        setTimeout(() => {
            count += '2';
            team.attend();
        }, 150);

        await team.regroup({ strict: true });

        expect(count).toEqual('12');

        setTimeout(() => {
            count += '3';
            team.attend();
        }, 150);

        await team.work;

        expect(count).toEqual('123');
    });

    it('exposes private notes as a static accessor', async () => {
        const team = new Team({ meetings: 2 });

        team.attend('1');

        const internalNotes = Team._notes(team);
        expect(internalNotes).toEqual(['1']);

        team.attend('2');

        await team.work;
    });

    it("clears notes and doesn't add new notes when meeting is done", async () => {
        const team = new Team({ meetings: 2 });

        setTimeout(() => {
            team.attend('1');
        }, 100);

        setTimeout(() => {
            team.attend('2');
        }, 150);

        const notes = await team.work;
        expect(notes).toEqual(['1', '2']);
        expect(Team._notes(team)).toBeNull();

        expect(() => team.attend('3')).not.toThrow();
        expect(Team._notes(team)).toBeNull();
    });

    it('clears notes when attending with an error', async () => {
        const team = new Team({ meetings: 2 });

        setTimeout(() => {
            team.attend('1');
        }, 100);

        setTimeout(() => {
            team.attend(new Error());
        }, 150);

        await expect(team.work).rejects.toThrow();
        expect(Team._notes(team)).toBeNull();
    });

    it('immediately resolves non-strict empty meetings with null', async () => {
        const team = new Team({ meetings: 0, strict: false });

        const notes = await team.work;
        expect(notes).toEqual(null);
    });

    it('throws error on invalid meetings', () => {
        expect(() => new Team({ meetings: 0, strict: true })).toThrow('Invalid meetings value');
        expect(() => new Team({ meetings: 0.5 })).toThrow('Invalid meetings value');
        expect(() => new Team({ meetings: -1 })).toThrow('Invalid meetings value');
        expect(() => new Team({ meetings: NaN })).toThrow('Invalid meetings value');
        expect(() => new Team({ meetings: '' })).toThrow('Invalid meetings value');
    });

    it('regroup works after team error', async () => {
        const team = new Team({ meetings: 2, strict: true });
        team.attend(new Error('failed'));

        const regroup = team.regroup();

        await expect(team.work).rejects.toThrow('failed');
        await expect(regroup).resolves.toBeUndefined();
    });
});

describe('Events', () => {
    it('iterates over events', async () => {
        const events = new Events();
        const iterator = events.iterator();

        expect(Events.isIterator(iterator)).toBe(true);

        const collect = (async () => {
            const items = [];
            for await (const item of iterator) {
                items.push(item);
            }

            return items;
        })();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        expect(await collect).toEqual([1, 2, 3]);
        expect(Events._iterators(events)).toEqual(new Set());
    });

    it('iterates over events (queued)', async () => {
        const events = new Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        const items = [];
        for await (const item of iterator) {
            items.push(item);
        }

        expect(items).toEqual([1, 2, 3]);
        expect(Events._iterators(events)).toEqual(new Set());
    });

    it('only iterates over new events after iterator() call', async () => {
        const events = new Events();

        events.emit(1);

        const iterator = events.iterator();
        events.emit(2);
        events.emit(3);
        events.end();

        const items = [];
        for await (const item of iterator) {
            items.push(item);
        }

        expect(items).toEqual([2, 3]);
        expect(Events._iterators(events)).toEqual(new Set());
    });

    it('returns done for consumed iterators', async () => {
        const events = new Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        const items = [];
        for await (const item of iterator) {
            items.push(item);
        }

        expect(iterator.next()).toEqual({ done: true });

        expect(items).toEqual([1, 2, 3]);
        expect(Events._iterators(events)).toEqual(new Set());
    });

    it('can use break without leaking', async () => {
        const events = new Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);

        const items = [];
        for await (const item of iterator) {
            items.push(item);
            break;
        }

        expect(items).toEqual([1]);
        expect(Events._iterators(events)).toEqual(new Set());
    });

    it('can throw without leaking', async () => {
        const events = new Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);

        const items = [];
        await expect(
            (async () => {
                for await (const item of iterator) {
                    items.push(item);
                    throw new Error('fail');
                }
            })(),
        ).rejects.toThrow('fail');

        expect(items).toEqual([1]);
        expect(Events._iterators(events)).toEqual(new Set());
    });

    it('works with multiple iterators (serial)', async () => {
        const events = new Events();
        const iter1 = events.iterator();
        const iter2 = events.iterator();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        const items1 = [];
        for await (const item1 of iter1) {
            items1.push(item1);
        }

        const items2 = [];
        for await (const item2 of iter2) {
            items2.push(item2);
        }

        expect(items1).toEqual([1, 2, 3]);
        expect(items2).toEqual([1, 2, 3]);
    });

    it('works with multiple iterators (interleaved)', async () => {
        const events = new Events();
        const iter1 = events.iterator();
        const iter2 = events.iterator();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        const items1 = [];
        const items2 = [];
        for await (const item1 of iter1) {
            items1.push(item1);
            if (items2.length === 0) {
                for await (const item2 of iter2) {
                    items2.push(item2);
                }
            }
        }

        expect(items1).toEqual([1, 2, 3]);
        expect(items2).toEqual([1, 2, 3]);
    });
});
