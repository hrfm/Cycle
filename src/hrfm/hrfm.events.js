var hrfm;
(function (hrfm) {
    (function (events) {
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
        events.Closure = Closure;        
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
        events.ClosureList = ClosureList;        
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
        events.EventDispatcher = EventDispatcher;        
    })(hrfm.events || (hrfm.events = {}));
    var events = hrfm.events;
})(hrfm || (hrfm = {}));
