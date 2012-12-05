var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Cycle = (function (_super) {
    __extends(Cycle, _super);
    function Cycle(interval) {
        if (typeof interval === "undefined") { interval = 0; }
        _super.call(this);
        this.running = false;
        this.interval = interval;
        this.initialTime = Date.now();
        this.elapsedTime = 0;
        this._requestAnimationFrame = window['requestAnimationFrame'] || window['webkitRequestAnimationFrame'] || window['mozRequestAnimationFrame'] || window['oRequestAnimationFrame'] || window['msRequestAnimationFrame'] || function (callback) {
            return setTimeout(callback, interval || 1);
        };
        this._cancelAnimationFrame = window['cancelRequestAnimationFrame'] || window['webkitCancelAnimationFrame'] || window['webkitCancelRequestAnimationFrame'] || window['mozCancelRequestAnimationFrame'] || window['oCancelRequestAnimationFrame'] || window['msCancelRequestAnimationFrame'] || clearTimeout;
    }
    Cycle.prototype.start = function () {
        if(this.running == true) {
            return;
        }
        var that = this, _now = 0, _time = Date.now(), _startTime = _time, _elapsed = 0, _interval = this.interval;
        if(0 < _interval) {
            this._onAnimate = function () {
                _now = Date.now();
                if(_interval * 100 < _now - _time) {
                    _time = _now - _interval;
                }
                while(_interval <= _now - _time) {
                    _elapsed = _now - _time;
                    that.elapsedTime += _elapsed;
                    _time += _interval;
                    that.execute('cycle', _now - _time < _interval);
                }
                that._animateID = that._requestAnimationFrame.call(window, that._onAnimate);
            };
        } else {
            this._onAnimate = function () {
                _now = Date.now();
                _elapsed = _now - _time;
                that.elapsedTime += _elapsed;
                that.execute('cycle', true);
                _time = _now;
                that._animateID = that._requestAnimationFrame.call(window, that._onAnimate);
            };
        }
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
})(hrfm.events.EventDispatcher);
