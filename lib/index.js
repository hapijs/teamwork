'use strict';

// Load modules


// Declare internals

const internals = {};


exports.Team = internals.Team = function () {

    this.work = new Promise((resolve) => {

        this._resolve = resolve;
        this._members = {};
        this._seq = 0;
    });
};


internals.Team.prototype.member = function (func) {

    const self = this;

    const id = ++this._seq;
    this._members[id] = true;

    return function () {

        func.apply(this, arguments);

        delete self._members[id];
        self._check();
    };
};


internals.Team.prototype.meetings = function (count) {

    this._count = count;
};


internals.Team.prototype.attend = function () {

    --this._count;
    this._check();
};


internals.Team.prototype._check = function () {

    if (!Object.keys(this._members).length &&
        !this._count) {

        return this._resolve();
    }
};
