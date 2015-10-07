// Load modules


// Declare internals

var internals = {};


exports.Team = internals.Team = function (callback) {

    this._callback = callback;
    this._members = {};
    this._seq = 0;
};


internals.Team.prototype.member = function (func) {

    var self = this;

    var id = ++this._seq;
    this._members[id] = true;

    return function () {

        func.apply(this, arguments);

        delete self._members[id];
        if (!Object.keys(self._members).length) {
            return self._callback();
        }
    };
};
