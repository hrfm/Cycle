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
        return Closure;
    })();
    hrfm.Closure = Closure;    
    var ClosureList = (function () {
        function ClosureList() {
            this._closures = [];
        }
        ClosureList.prototype.add = function (closure, scope, priority) {
            if (typeof scope === "undefined") { scope = null; }
            if (typeof priority === "undefined") { priority = 0; }
            var fnc = new Closure(closure, scope, priority);
            var len = this._closures.length;

            if(0 < len) {
                this._closures[len - 1].n = fnc;
            }
            this._closures[len] = fnc;
        };
        ClosureList.prototype.execute = function () {
            if(this._closures.length == 0) {
                return;
            }
            var c = this._closures[0];
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
            this._interval = interval;
            this._initialTime = Date.now();
            this._y = {
                'start': new ClosureList(),
                'stop': new ClosureList(),
                'cycle': new ClosureList()
            };
            this._requestAnimationFrame = window['requestAnimationFrame'] || window['webkitRequestAnimationFrame'] || window['mozRequestAnimationFrame'] || window['oRequestAnimationFrame'] || window['msRequestAnimationFrame'] || function (callback) {
                return setTimeout(callback, 8);
            };
            this._cancelAnimationFrame = window['cancelRequestAnimationFrame'] || window['webkitCancelAnimationFrame'] || window['webkitCancelRequestAnimationFrame'] || window['mozCancelRequestAnimationFrame'] || window['oCancelRequestAnimationFrame'] || window['msCancelRequestAnimationFrame'] || clearTimeout;
        }
        Cycle.prototype.start = function () {
            if(this._running == true) {
                return;
            }
            var that = this;
            var time = Date.now();
            this._startTime = time;
            this._onTimeout = function () {
                var now = Date.now();
                this.elapsedTime += now - time;
                time = now;
                that._y['cycle'].execute();
                that._timerID = setTimeout(that._onTimeout, that._interval);
            };
            this._timerID = setTimeout(this._onTimeout, this._interval);
            this._running = true;
            this._y['start'].execute();
        };
        Cycle.prototype.stop = function () {
            if(this._running == false) {
                return;
            }
            clearTimeout(this._timerID);
            this._cancelAnimationFrame.call(window, this._animateID);
            this._running = false;
            this._y['stop'].execute();
        };
        Cycle.prototype.running = function () {
            return this._running;
        };
        Cycle.prototype.bind = function (state, closure, scope) {
            if(typeof this._y[state] === 'undefined') {
                return;
            }
            this._y[state].add(closure, scope);
        };
        Cycle.prototype.unbind = function (state, closure, scope) {
            if(typeof this._y[state] === 'undefined') {
                return;
            }
        };
        return Cycle;
    })();
    hrfm.Cycle = Cycle;    
})(hrfm || (hrfm = {}));

