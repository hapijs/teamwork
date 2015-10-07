// Load modules

var Code = require('code');
var Lab = require('lab');
var Teamwork = require('..');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;


describe('Team', function () {

    it('invokes callback when all members finish', function (done) {

        var count = '';
        var finished = function () {

            expect(count).to.equal('12');
            done();
        };

        var team = new Teamwork.Team(finished);

        setTimeout(team.member(function () {

            count += '1';
        }), 100);


        setTimeout(team.member(function () {

            count += '2';
        }), 150);
    });
});
