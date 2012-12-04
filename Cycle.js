var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var hrfm;
(function (hrfm) {
    var Closure = (function () {
        function Closure(closure, scope, priority) {
            if (typeof scope === "undefined") { scope = undefined; }
            if (typeof priority === "undefined") { priority = 0; }
            this.f = closure;
            this.s = scope;
            this.p = priority;
        }
        Closure.prototype.e = function (a) {
            if (typeof a === "undefined") { a = null; }
            this.f.call(this.s, a);
            return this.n;
        };
        Closure.prototype.equals = function (closure, scope) {
            if (typeof scope === "undefined") { scope = undefined; }
            return (closure == this.f && scope == this.s);
        };
        return Closure;
    })();
    hrfm.Closure = Closure;    
    var ClosureList = (function () {
        function ClosureList() {
        }
        ClosureList.prototype.add = function (closure, scope, priority) {
            if (typeof scope === "undefined") { scope = undefined; }
            if (typeof priority === "undefined") { priority = 0; }
            var c = this.head;
            while(c) {
                if(c.equals(closure, scope)) {
                    return;
                }
                c = c.n;
            }
            c = new Closure(closure, scope, priority);
            if(!this.head) {
                this.head = this.tail = c;
            } else {
                this.tail.n = c;
                this.tail = c;
            }
        };
        ClosureList.prototype.remove = function (closure, scope) {
            if (typeof scope === "undefined") { scope = undefined; }
            var c = this.head, b4;
            while(c) {
                if(c.equals(closure, scope)) {
                    if(b4) {
                        b4.n = c.n;
                        if(!b4.n) {
                            this.tail = b4;
                        }
                    } else {
                        if(c == this.head) {
                            this.head = c.n;
                        } else {
                            b4.n = c.n;
                        }
                    }
                    c = null;
                    return;
                }
                b4 = c;
                c = c.n;
            }
        };
        ClosureList.prototype.removeAll = function () {
            var c = this.head, n;
            while(c) {
                n = c.n;
                c = null;
                c = n;
            }
            this.head = null;
            this.tail = null;
        };
        ClosureList.prototype.execute = function (eventObject) {
            if (typeof eventObject === "undefined") { eventObject = undefined; }
            if(!this.head) {
                return;
            }
            var c = this.head;
            if(typeof eventObject === 'undefined') {
                while(c) {
                    c = c.e();
                }
            } else {
                while(c) {
                    c = c.e(eventObject);
                }
            }
        };
        return ClosureList;
    })();
    hrfm.ClosureList = ClosureList;    
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._hash_ = [];
        }
        EventDispatcher.prototype.on = function (state, closure, scope) {
            if (typeof scope === "undefined") { scope = undefined; }
            var i, s, list = state.split(' '), len = list.length;
            for(i = 0; i < len; i++) {
                s = list[i];
                if(!this._hash_[s]) {
                    this._hash_[s] = new ClosureList();
                }
                this._hash_[s].add(closure, scope);
            }
            return this;
        };
        EventDispatcher.prototype.off = function (state, closure, scope) {
            if (typeof closure === "undefined") { closure = undefined; }
            if (typeof scope === "undefined") { scope = undefined; }
            var i, s, list = state.split(' '), len = list.length;
            for(i = 0; i < len; i++) {
                s = list[i];
                if(!this._hash_[s]) {
                    continue;
                }
                if(typeof closure === 'undefined') {
                    this._hash_[s].removeAll();
                } else {
                    this._hash_[s].remove(closure, scope);
                }
            }
            return this;
        };
        EventDispatcher.prototype.execute = function (state, eventObject) {
            if (typeof eventObject === "undefined") { eventObject = null; }
            if(this._hash_[state]) {
                this._hash_[state].execute(eventObject);
            }
        };
        return EventDispatcher;
    })();
    hrfm.EventDispatcher = EventDispatcher;    
    var Cycle = (function (_super) {
        __extends(Cycle, _super);
        function Cycle(interval) {
            if (typeof interval === "undefined") { interval = 16; }
                _super.call(this);
            this.running = false;
            this.interval = interval;
            this.initialTime = Date.now();
            this._requestAnimationFrame = window['requestAnimationFrame'] || window['webkitRequestAnimationFrame'] || window['mozRequestAnimationFrame'] || window['oRequestAnimationFrame'] || window['msRequestAnimationFrame'] || function (callback) {
                return setTimeout(callback, interval);
            };
            this._cancelAnimationFrame = window['cancelRequestAnimationFrame'] || window['webkitCancelAnimationFrame'] || window['webkitCancelRequestAnimationFrame'] || window['mozCancelRequestAnimationFrame'] || window['oCancelRequestAnimationFrame'] || window['msCancelRequestAnimationFrame'] || clearTimeout;
        }
        Cycle.prototype.start = function () {
            if(this.running == true) {
                return;
            }
            var that = this, _now = 0, _time = Date.now(), _startTime = _time, _elapsed = 0;
            this._onAnimate = function () {
                _now = Date.now();
                _elapsed = _now - _time;
                _time = _now;
                that.elapsedTime += _elapsed;
                that.execute('cycle');
                that._animateID = that._requestAnimationFrame.call(window, that._onAnimate);
            };
            this._animateID = this._requestAnimationFrame.call(window, that._onAnimate);
            this.running = true;
            this.execute('start');
        };
        Cycle.prototype.stop = function () {
            if(this.running == false) {
                return;
            }
            this._onAnimate = function () {
            };
            this._cancelAnimationFrame.call(window, this._animateID);
            this.running = false;
            this.execute('stop');
        };
        return Cycle;
    })(EventDispatcher);
    hrfm.Cycle = Cycle;    
})(hrfm || (hrfm = {}));
