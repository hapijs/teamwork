import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import * as Teamwork from '..';


const { expect } = Lab.types;


// Team

// Constructor tests

expect.type<Teamwork.Team>(new Teamwork.Team());
expect.type<Teamwork.Team>(new Teamwork.Team({ meetings: 2 }));
expect.error(new Teamwork.Team({ foo: true }));
expect.error(new Teamwork.Team({ meetings: 'foo' }));
expect.type<Promise<void>>(new Teamwork.Team().work);


// Attend tests

expect.type<void>(new Teamwork.Team().attend());
expect.type<void>(new Teamwork.Team().attend(new Error()));
expect.type<void>(new Teamwork.Team<string>().attend('foo'));
expect.type<void>(new Teamwork.Team<string[]>().attend('foo'));
expect.error(new Teamwork.Team<boolean>().attend('foo'));
expect.error(new Teamwork.Team<boolean[]>().attend('foo'));
expect.type<void>(new Teamwork.Team<[boolean, string]>().attend('foo'));


// Work tests

expect.type<Promise<void>>(new Teamwork.Team().work);
expect.type<Promise<boolean>>(new Teamwork.Team<boolean>().work);
expect.type<Promise<boolean[]>>(new Teamwork.Team<boolean[]>().work);


// Regroup tests

expect.type<Promise<void>>(new Teamwork.Team().regroup());


// Events

const events = new Teamwork.Events<string>();
expect.error(events.emit(1));

const iterator = events.iterator();
expect.type<AsyncIterator<string>>(iterator);


const test = async function () {

    const events = new Teamwork.Events<number>();
    events.emit(1);
    events.emit(2);
    events.emit(3);
    events.end();

    const items = [];
    for await (const item of events.iterator()) {
        items.push(item);
    }

    Code.expect(items).to.equal([1, 2, 3]);
};

test();
