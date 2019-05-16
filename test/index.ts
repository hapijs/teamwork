import * as Lab from '@hapi/lab';
import { Teamwork } from '..';


const { expect } = Lab.types;


// Constructor tests

expect.type<Teamwork>(new Teamwork());
expect.type<Teamwork>(new Teamwork({ meetings: 2 }));
expect.error(new Teamwork({ foo: true }));
expect.error(new Teamwork({ meetings: 'foo' }));
expect.type<Promise<void>>(new Teamwork().work);
expect.type<void>(await new Teamwork().work);


// Attend tests

expect.type<void>(new Teamwork().attend());
expect.type<void>(new Teamwork().attend(new Error()));
expect.type<void>(new Teamwork<string>().attend('foo'));
expect.type<void>(new Teamwork<string[]>().attend('foo'));
expect.error(new Teamwork<boolean>().attend('foo'));
expect.error(new Teamwork<boolean[]>().attend('foo'));
expect.type<void>(new Teamwork<[boolean, string]>().attend('foo'));


// Work tests

expect.type<Promise<void>>(new Teamwork().work);
expect.type<Promise<boolean>>(new Teamwork<boolean>().work);
expect.type<Promise<boolean[]>>(new Teamwork<boolean[]>().work);


// Regroup tests

expect.type<Promise<void>>(new Teamwork().regroup());
