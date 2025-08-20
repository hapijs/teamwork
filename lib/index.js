'use strict';

const internals = {};


exports.Team = class {

    #meetings = null;
    #count = null;
    #notes = null;
    #done = false;
    #strict = false;

    constructor(options) {

        this._init(options);
    }

    static _notes(instance) {

        return instance.#notes;
    }

    _init(options = {}) {

        this.work = new Promise((resolve, reject) => {

            this._resolve = resolve;
            this._reject = reject;
        });

        const meetings = options.meetings || 1;
        this.#meetings = meetings;
        this.#count = meetings;
        this.#notes = [];
        this.#done = false;
        this.#strict = options.strict;
    }

    attend(note) {

        if (this.#strict && this.#done) {
            throw new Error('Unscheduled meeting');
        }
        else if (this.#done) {
            return;
        }

        if (note instanceof Error) {
            this.#done = true;
            this.#notes = null;
            return this._reject(note);
        }

        this.#notes.push(note);

        if (--this.#count) {
            return;
        }

        this.#done = true;
        this._resolve(this.#meetings === 1 ? this.#notes[0] : [...this.#notes]);
        this.#notes = null;
    }

    async regroup(options) {

        try {
            await this.work;
        }
        catch {}

        this._init(options);
    }
};


exports.Events = class {

    #iterators = new Set();

    static _iterators(instance) {

        return instance.#iterators;
    }

    static isIterator(iterator) {

        return iterator instanceof internals.EventsIterator;
    }

    iterator() {

        const iterator = new internals.EventsIterator(this);

        this.#iterators.add(iterator);

        return iterator;
    }

    emit(value) {

        for (const iterator of this.#iterators) {
            iterator._queue({ value, done: false });
        }
    }

    end() {

        for (const iterator of this.#iterators) {
            iterator._queue({ done: true });
        }
    }

    _remove(iterator) {

        this.#iterators.delete(iterator);
    }
};


internals.EventsIterator = class {

    #events;

    #pending = null;
    #queue = [];

    constructor(events) {

        this.#events = events;
    }

    [Symbol.asyncIterator]() {

        return this;
    }

    next() {

        if (this.#queue.length) {
            return Promise.resolve(this.#queue.shift());
        }

        if (!this.#events) {
            return { done: true };
        }

        this.#pending = new exports.Team();
        return this.#pending.work;
    }

    return() {

        this._cleanup();

        return { done: true };
    }

    _cleanup() {

        this.#events?._remove(this);
        this.#events = null;
    }

    _queue(item) {

        if (item.done) {
            this._cleanup();
        }

        if (this.#pending) {
            this.#pending.attend(item);
            this.#pending = null;
        }
        else {
            this.#queue.push(item);
        }
    }
};
