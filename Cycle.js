var hrfm;
(function (hrfm) {
    var Closure = (function () {
        function Closure(closure, scope, priority) {
            if (typeof scope === "undefined") { scope = null; }
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
            if (typeof scope === "undefined") { scope = null; }
            return (closure == this.f && scope == this.s);
        };
        return Closure;
    })();
    hrfm.Closure = Closure;    
    var ClosureList = (function () {
        function ClosureList() {
        }
        ClosureList.prototype.add = function (closure, scope, priority) {
            if (typeof scope === "undefined") { scope = null; }
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
            if (typeof scope === "undefined") { scope = null; }
            var b4;
            var c = this.head;

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
        ClosureList.prototype.execute = function () {
            if(!this.head) {
                return;
            }
            var c = this.head;
            if(typeof arguments === 'undefined') {
                while(c) {
                    c = c.e();
                }
            } else {
                while(c) {
                    c = c.e(arguments);
                }
            }
        };
        return ClosureList;
    })();
    hrfm.ClosureList = ClosureList;    
    var Cycle = (function () {
        function Cycle(interval) {
            if (typeof interval === "undefined") { interval = 16; }
            this.interval = interval;
            this.initialTime = Date.now();
            this._start = new ClosureList();
            this._stop = new ClosureList();
            this._cycle = new ClosureList();
            this._requestAnimationFrame = window['requestAnimationFrame'] || window['webkitRequestAnimationFrame'] || window['mozRequestAnimationFrame'] || window['oRequestAnimationFrame'] || window['msRequestAnimationFrame'] || function (callback) {
                return setTimeout(callback, 8);
            };
            this._cancelAnimationFrame = window['cancelRequestAnimationFrame'] || window['webkitCancelAnimationFrame'] || window['webkitCancelRequestAnimationFrame'] || window['mozCancelRequestAnimationFrame'] || window['oCancelRequestAnimationFrame'] || window['msCancelRequestAnimationFrame'] || clearTimeout;
        }
        Cycle.prototype.start = function () {
            if(this.running == true) {
                return;
            }
            var that = this;
            var _now = 0;
            var _time = Date.now();
            var _startTime = _time;
            var _onTimeout = function () {
                _now = Date.now();
                that.elapsedTime += _now - _time;
                _time = _now;
                that._cycle.execute();
                that._timerID = setTimeout(_onTimeout, that.interval);
            };

            this._timerID = setTimeout(_onTimeout, this.interval);
            this.running = true;
            this._start.execute();
        };
        Cycle.prototype.stop = function () {
            if(this.running == false) {
                return;
            }
            clearTimeout(this._timerID);
            this._timerID = 0;
            this.running = false;
            this._stop.execute();
        };
        Cycle.prototype.on = function (state, closure, scope) {
            switch(state) {
                case 'start': {
                    this._start.add(closure, scope);
                    break;

                }
                case 'stop': {
                    this._stop.add(closure, scope);
                    break;

                }
                case 'cycle': {
                    this._cycle.add(closure, scope);
                    break;

                }
            }
        };
        Cycle.prototype.off = function (state, closure, scope) {
            switch(state) {
                case 'start': {
                    this._start.remove(closure, scope);
                    break;

                }
                case 'stop': {
                    this._stop.remove(closure, scope);
                    break;

                }
                case 'cycle': {
                    this._cycle.remove(closure, scope);
                    break;

                }
            }
        };
        return Cycle;
    })();
    hrfm.Cycle = Cycle;    
})(hrfm || (hrfm = {}));

