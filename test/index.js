'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Teamwork = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Team', () => {

    describe('ES6 modules properties', () => {

        it('the ES6 module marker is defined', () => {

            expect(Teamwork.__esModule).to.be.true();
        });

        it('the default property is defined', () => {

            expect(Teamwork.default).to.exist();
            expect(Teamwork.default).to.shallow.equal(Teamwork);
        });

        it('the Teamwork property is defined', () => {

            expect(Teamwork.Teamwork).to.exist();
            expect(Teamwork.Teamwork).to.shallow.equal(Teamwork);
        });
    });

    it('resolve when meeting is attended', async () => {

        const team = new Teamwork();

        setTimeout(() => {

            team.attend();
        }, 100);

        await team.work;
    });

    it('resolve when all meetings are attended', async () => {

        const team = new Teamwork({ meetings: 2 });

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
    });

    it('resolve with a note', async () => {

        const team = new Teamwork();

        setTimeout(() => {

            team.attend('1');
        }, 100);

        const note = await team.work;
        expect(note).to.equal('1');
    });

    it('resolve with notes', async () => {

        const team = new Teamwork({ meetings: 2 });

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

        const team = new Teamwork({ meetings: 2 });

        setTimeout(() => {

            team.attend(new Error('boom'));
        }, 100);

        setTimeout(() => {

            team.attend('2');
        }, 150);

        await expect(team.work).to.reject('boom');
    });

    it('resets condition after initial condition met', async () => {

        const team = new Teamwork({ meetings: 2 });

        let count = '';
        setTimeout(() => {

            count += '1';
            team.attend();
        }, 100);

        setTimeout(() => {

            count += '2';
            team.attend();
        }, 150);

        await team.regroup();

        expect(count).to.equal('12');

        setTimeout(() => {

            count += '3';
            team.attend();
        }, 150);

        await team.work;

        expect(count).to.equal('123');
    });
});
