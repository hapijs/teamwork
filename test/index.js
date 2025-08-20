'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Teamwork = require('..');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Team', () => {

    it('resolves when meeting is attended', async () => {

        const team = new Teamwork.Team();

        setTimeout(() => {

            team.attend();
        }, 100);

        await team.work;
    });

    it('resolves when all meetings are attended', async () => {

        const team = new Teamwork.Team({ meetings: 2 });

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

        expect(count).to.equal('12');

        expect(() => team.attend()).not.to.throw();
        expect(() => team.attend(new Error())).not.to.throw();
    });

    it('throws when too many meetings attended', async () => {

        const team = new Teamwork.Team({ meetings: 2, strict: true });

        team.attend();
        team.attend();

        await team.work;

        expect(() => team.attend()).to.throw('Unscheduled meeting');
        expect(() => team.attend(new Error())).to.throw('Unscheduled meeting');
    });

    it('resolves with a note', async () => {

        const team = new Teamwork.Team();

        setTimeout(() => {

            team.attend('1');
        }, 100);

        const note = await team.work;
        expect(note).to.equal('1');
    });

    it('resolves with notes', async () => {

        const team = new Teamwork.Team({ meetings: 2 });

        setTimeout(() => {

            team.attend('1');
        }, 100);

        setTimeout(() => {

            team.attend('2');
        }, 150);

        const notes = await team.work;
        expect(notes).to.equal(['1', '2']);
    });

    it('rejects on first error', async () => {

        const team = new Teamwork.Team({ meetings: 2 });

        setTimeout(() => {

            team.attend(new Error('boom'));
        }, 100);

        setTimeout(() => {

            team.attend('2');
        }, 150);

        await expect(team.work).to.reject('boom');
    });

    it('resets condition after initial condition met', async () => {

        const team = new Teamwork.Team({ meetings: 2, strict: true });

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

        expect(count).to.equal('12');

        setTimeout(() => {

            count += '3';
            team.attend();
        }, 150);

        await team.work;

        expect(count).to.equal('123');
    });

    it('exposes private notes as a static accessor', async () => {

        const team = new Teamwork.Team({ meetings: 2 });

        team.attend('1');

        const internalNotes = Teamwork.Team._notes(team);
        expect(internalNotes).to.equal(['1']);

        team.attend('2');

        await team.work;
    });

    it('clears notes and doesn\'t add new notes when meeting is done', async () => {

        const team = new Teamwork.Team({ meetings: 2 });

        setTimeout(() => {

            team.attend('1');
        }, 100);

        setTimeout(() => {

            team.attend('2');
        }, 150);

        const notes = await team.work;
        expect(notes).to.equal(['1', '2']);
        expect(Teamwork.Team._notes(team)).to.be.null();

        expect(() => team.attend('3')).to.not.throw();
        expect(Teamwork.Team._notes(team)).to.be.null();
    });

    it('clears notes when attending with an error', async () => {

        const team = new Teamwork.Team({ meetings: 2 });

        setTimeout(() => {

            team.attend('1');
        }, 100);

        setTimeout(() => {

            team.attend(new Error());
        }, 150);

        await expect(team.work).to.reject();
        expect(Teamwork.Team._notes(team)).to.be.null();
    });
});

describe('Events', () => {

    it('iterates over events', async () => {

        const events = new Teamwork.Events();
        const iterator = events.iterator();

        expect(Teamwork.Events.isIterator(iterator)).to.be.true();

        const collect = new Promise(async (resolve) => {

            const items = [];
            for await (const item of iterator) {
                items.push(item);
            }

            resolve(items);
        });

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        expect(await collect).to.equal([1, 2, 3]);
        expect(Teamwork.Events._iterators(events)).to.equal(new Set());
    });

    it('iterates over events (queued)', async () => {

        const events = new Teamwork.Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        const items = [];
        for await (const item of iterator) {
            items.push(item);
        }

        expect(items).to.equal([1, 2, 3]);
        expect(Teamwork.Events._iterators(events)).to.equal(new Set());
    });

    it('only iterates over new events after iterator() call', async () => {

        const events = new Teamwork.Events();

        events.emit(1);

        const iterator = events.iterator();
        events.emit(2);
        events.emit(3);
        events.end();

        const items = [];
        for await (const item of iterator) {
            items.push(item);
        }

        expect(items).to.equal([2, 3]);
        expect(Teamwork.Events._iterators(events)).to.equal(new Set());
    });

    it('returns done for consumed iterators', async () => {

        const events = new Teamwork.Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);
        events.emit(3);
        events.end();

        const items = [];
        for await (const item of iterator) {
            items.push(item);
        }

        expect(iterator.next()).to.equal({ done: true });

        expect(items).to.equal([1, 2, 3]);
        expect(Teamwork.Events._iterators(events)).to.equal(new Set());
    });

    it('can use break without leaking', async () => {

        const events = new Teamwork.Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);

        const items = [];
        for await (const item of iterator) {
            items.push(item);
            break;
        }

        expect(items).to.equal([1]);
        expect(Teamwork.Events._iterators(events)).to.equal(new Set());
    });

    it('can throw without leaking', async () => {

        const events = new Teamwork.Events();
        const iterator = events.iterator();

        events.emit(1);
        events.emit(2);

        const items = [];
        await expect((async () => {

            for await (const item of iterator) {
                items.push(item);
                throw new Error('fail');
            }
        })()).to.reject('fail');

        expect(items).to.equal([1]);
        expect(Teamwork.Events._iterators(events)).to.equal(new Set());
    });

    it('works with multiple iterators (serial)', async () => {

        const events = new Teamwork.Events();
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

        expect(items1).to.equal([1, 2, 3]);
        expect(items2).to.equal([1, 2, 3]);
    });

    it('works with multiple iterators (interleaved)', async () => {

        const events = new Teamwork.Events();
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

        expect(items1).to.equal([1, 2, 3]);
        expect(items2).to.equal([1, 2, 3]);
    });
});
