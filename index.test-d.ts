import { expectError, expectType } from 'tsd';
import { Teamwork } from '.';

// Constructor tests
expectType<Teamwork>(new Teamwork());
expectType<Teamwork>(new Teamwork({ meetings: 2 }));
expectError(new Teamwork({ foo: true }));
expectError(new Teamwork({ meetings: 'foo' }));
expectType<Promise<void>>(new Teamwork().work);
expectType<void>(await new Teamwork().work);

// Attend tests
expectType<void>(new Teamwork().attend());
expectType<void>(new Teamwork().attend(new Error()));
expectType<void>(new Teamwork<string>().attend('foo'));
expectType<void>(new Teamwork<string[]>().attend('foo'));
expectError(new Teamwork<boolean>().attend('foo'));
expectError(new Teamwork<boolean[]>().attend('foo'));
expectType<void>(new Teamwork<[boolean, string]>().attend('foo'));

// Work tests
expectType<Promise<void>>(new Teamwork().work);
expectType<Promise<boolean>>(new Teamwork<boolean>().work);
expectType<Promise<boolean[]>>(new Teamwork<boolean[]>().work);

// Regroup tests
expectType<Promise<void>>(new Teamwork().regroup());
