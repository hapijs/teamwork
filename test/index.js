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

    it('invokes callback when all members finish', (done) => {

        let count = '';
        const finished = function () {

            expect(count).to.equal('12');
            done();
        };

        const team = new Teamwork.Team(finished);

        setTimeout(team.member(() => {

            count += '1';
        }), 100);

        setTimeout(team.member(() => {

            count += '2';
        }), 150);
    });

    it('invokes callback when all meetings are attended', (done) => {

        let count = '';
        const finished = function () {

            expect(count).to.equal('12');
            done();
        };

        const team = new Teamwork.Team(finished);
        team.meetings(2);

        setTimeout(() => {

            count += '1';
            team.attend();
        }, 100);

        setTimeout(() => {

            count += '2';
            team.attend();
        }, 150);
    });
});
