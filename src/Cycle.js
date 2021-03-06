var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var hrfm;
(function (hrfm) {
    var Closure = (function () {
        function Closure(closure, scope, priority) {
            if (scope === void 0) { scope = undefined; }
            if (priority === void 0) { priority = 0; }
            this.id = Closure._ID++;
            this._f = closure;
            this._s = scope;
            this.priority = priority;
        }
        Closure.prototype.e = function (a) {
            if (a === void 0) { a = null; }
            if (this._f.call(this._s, a) == false) {
                return null;
            }
            else {
                return this.n;
            }
        };
        Closure.prototype.eq = function (closure, scope) {
            if (scope === void 0) { scope = undefined; }
            return (closure == this._f && scope == this._s);
        };
        Closure._ID = 0;
        return Closure;
    })();
    hrfm.Closure = Closure;
    var ClosureList = (function () {
        function ClosureList() {
        }
        ClosureList.prototype.add = function (closure, scope, priority) {
            if (scope === void 0) { scope = undefined; }
            if (priority === void 0) { priority = 0; }
            var c, p, t;
            if (!this.head) {
                c = new Closure(closure, scope, priority);
                this.head = this.tail = c;
            }
            else {
                c = this.head;
                t = null;
                while (c) {
                    if (c.eq(closure, scope))
                        return -1;
                    if (!t && c.priority < priority) {
                        t = c;
                    }
                    c = c.n;
                }
                c = new Closure(closure, scope, priority);
                if (!t) {
                    t = this.tail;
                    t.n = c;
                    c.p = t;
                    this.tail = c;
                }
                else if (!t.p) {
                    t.p = c;
                    c.n = t;
                    this.head = c;
                }
                else {
                    p = t.p;
                    t.p = c;
                    c.n = t;
                    c.p = p;
                    p.n = c;
                }
            }
            return c.id;
        };
        ClosureList.prototype.rm = function (closure, scope) {
            if (scope === void 0) { scope = undefined; }
            var c = this.head;
            while (c) {
                if (c.eq(closure, scope)) {
                    this._rm(c);
                    c = null;
                    return;
                }
                c = c.n;
            }
        };
        ClosureList.prototype.rmById = function (id) {
            var c = this.head;
            while (c) {
                if (c.id == id) {
                    this._rm(c);
                    c = null;
                    return;
                }
                c = c.n;
            }
        };
        ClosureList.prototype.rmAll = function () {
            var c = this.head, n;
            while (c) {
                n = c.n;
                c = null;
                c = n;
            }
            this.head = null;
            this.tail = null;
        };
        ClosureList.prototype.exec = function (eventObject) {
            if (eventObject === void 0) { eventObject = undefined; }
            if (!this.head)
                return;
            var c = this.head;
            if (typeof eventObject === 'undefined') {
                while (c)
                    c = c.e();
            }
            else {
                while (c)
                    c = c.e(eventObject);
            }
        };
        ClosureList.prototype._rm = function (c) {
            if (this.head == c) {
                if (this.tail == c) {
                    this.head = null;
                    this.tail = null;
                    return;
                }
                this.head = c.n;
                c.n.p = null;
            }
            else if (this.tail == c) {
                this.tail = c.p;
                c.p.n = null;
            }
            else {
                c.p.n = c.n;
                c.n.p = c.p;
            }
        };
        return ClosureList;
    })();
    hrfm.ClosureList = ClosureList;
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._hash_ = [];
        }
        EventDispatcher.prototype.on = function (state, closure, scope, priority) {
            if (scope === void 0) { scope = this; }
            if (priority === void 0) { priority = 0; }
            var i, s, list = state.split(' '), len = list.length;
            for (i = 0; i < len; i++) {
                s = list[i];
                if (!this._hash_[s]) {
                    this._hash_[s] = new ClosureList();
                }
                this._hash_[s].add(closure, scope, priority);
            }
            return this;
        };
        EventDispatcher.prototype.onWithId = function (state, closure, scope, priority) {
            if (scope === void 0) { scope = this; }
            if (priority === void 0) { priority = 0; }
            if (!this._hash_[state]) {
                this._hash_[state] = new ClosureList();
            }
            return this._hash_[state].add(closure, scope, priority);
        };
        EventDispatcher.prototype.off = function (state, closure, scope) {
            if (closure === void 0) { closure = undefined; }
            if (scope === void 0) { scope = this; }
            if (typeof state === 'number') {
                for (var key in this._hash_) {
                    this._hash_[key].rmById(state);
                }
            }
            else if (typeof state === 'string') {
                var i, s, list = state.split(' '), len = list.length;
                for (i = 0; i < len; i++) {
                    s = list[i];
                    if (!this._hash_[s]) {
                        continue;
                    }
                    if (typeof closure === 'undefined') {
                        this._hash_[s].rmAll();
                    }
                    else {
                        this._hash_[s].rm(closure, scope);
                    }
                }
            }
            return this;
        };
        EventDispatcher.prototype.execute = function (state, eventObject) {
            if (eventObject === void 0) { eventObject = null; }
            if (this._hash_[state])
                this._hash_[state].exec(eventObject);
        };
        EventDispatcher.prototype.removeAllListeners = function () {
            for (var key in this._hash_) {
                this._hash_[key].rmAll();
            }
            this._hash_ = [];
        };
        return EventDispatcher;
    })();
    hrfm.EventDispatcher = EventDispatcher;
})(hrfm || (hrfm = {}));
var Cycle = (function (_super) {
    __extends(Cycle, _super);
    function Cycle(interval) {
        if (interval === void 0) { interval = 0; }
        _super.call(this);
        this.running = false;
        this.interval = interval;
        this.initialTime = new Date().getTime();
        this.elapsedTime = 0;
        this._requestAnimationFrame = window['requestAnimationFrame'] || window['webkitRequestAnimationFrame'] || window['mozRequestAnimationFrame'] || window['oRequestAnimationFrame'] || window['msRequestAnimationFrame'] || function (callback) {
            return setTimeout(callback, 17);
        };
        this._cancelAnimationFrame = window['cancelRequestAnimationFrame'] || window['webkitCancelAnimationFrame'] || window['webkitCancelRequestAnimationFrame'] || window['mozCancelRequestAnimationFrame'] || window['oCancelRequestAnimationFrame'] || window['msCancelRequestAnimationFrame'] || clearTimeout;
    }
    Cycle.prototype.start = function () {
        if (this.running == true)
            return;
        var that = this, _i, _now = 0, _time = new Date().getTime(), _startTime = _time, _elapsed = 0, _interval = this.interval;
        if (0 < _interval) {
            this._onAnimate = function () {
                _now = new Date().getTime();
                if (_interval * 100 < _now - _time) {
                    _time = _now - _interval;
                }
                _elapsed = _now - _time;
                if (_interval < _elapsed) {
                    var times = ~~(_elapsed / _interval);
                    _time += times * _interval;
                    that.execute('cycle', times);
                }
                that.elapsedTime += _elapsed;
                that._animateID = that._requestAnimationFrame.call(window, that._onAnimate);
            };
        }
        else {
            this._onAnimate = function () {
                _now = new Date().getTime();
                _elapsed = _now - _time;
                that.elapsedTime += _elapsed;
                that.execute('cycle', 1);
                _time = _now;
                that._animateID = that._requestAnimationFrame.call(window, that._onAnimate);
            };
        }
        this._animateID = this._requestAnimationFrame.call(window, that._onAnimate);
        this.running = true;
        this.execute('start');
    };
    Cycle.prototype.stop = function () {
        if (this.running == false)
            return;
        this._onAnimate = function () {
        };
        this._cancelAnimationFrame.call(window, this._animateID);
        this.running = false;
        this.execute('stop');
    };
    return Cycle;
})(hrfm.EventDispatcher);
