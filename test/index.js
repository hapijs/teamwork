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

    it('resolve when all members finish', async () => {

        const team = new Teamwork.Team();

        let count = '';
        setTimeout(team.member(() => {

            count += '1';
        }), 100);

        setTimeout(team.member(() => {

            count += '2';
        }), 150);

        await team.work;
        expect(count).to.equal('12');
    });

    it('resolve when all meetings are attended', async () => {

        const team = new Teamwork.Team();
        team.meetings(2);

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

    it('resolve when all meetings are attended (constructor options)', async () => {

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
    });
});
