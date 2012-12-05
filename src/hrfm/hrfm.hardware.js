var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var hrfm;
(function (hrfm) {
    (function (hardware) {
        var Touch = (function (_super) {
            __extends(Touch, _super);
            function Touch() {
                        _super.call(this);
                this.supported = ('ontouchstart' in window);
                this.enabled = true;
                this.isTouching = false;
                this.numTouches = 0;
                this.touchStart = {
                    x: 0,
                    y: 0
                };
                this.touchStartTime = 0;
                this.touchPrevious = {
                    x: 0,
                    y: 0
                };
                this.pinch = 0;
            }
            Touch._INSTANCE = undefined;
            Touch.getInstance = function getInstance() {
                if(!Touch._INSTANCE) {
                    Touch._INSTANCE = new Touch();
                }
                return Touch._INSTANCE;
            }
            Touch.prototype.listen = function (target) {
                if (typeof target === "undefined") { target = $(window); }
                var that = this;
                target.on({
                    'touchstart mousedown': function (e) {
                        that._onTouchStart(e);
                    },
                    'touchmove mousemove': function (e) {
                        that._onTouchMove(e);
                    },
                    'touchend mouseup': function (e) {
                        that._onTouchEnd(e);
                    }
                });
                return this;
            };
            Touch.prototype._onTouchStart = function (e) {
                if(!this.enabled) {
                    return;
                }
                var x, y, touches = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches : [];
                if(this.supported && 0 < touches.length) {
                    this.numTouches = touches.length;
                    x = touches[0].pageX;
                    y = touches[0].pageY;
                } else {
                    this.numTouches = 1;
                    x = e.pageX;
                    y = e.pageY;
                }
                if(2 <= touches.length) {
                    var p1 = touches[1], dx = p1.pageX - x, dy = p1.pageY - y;
                    this.pinch = Math.sqrt(dx * dx + dy * dy);
                } else {
                    this.pinch = 0;
                }
                this.touchStart.x = this.touchPrevious.x = x;
                this.touchStart.y = this.touchPrevious.y = y;
                this.touchStartTime = new Date().getTime();
                this.isTouching = true;
            };
            Touch.prototype._onTouchMove = function (e) {
                if(!this.enabled) {
                    return;
                }
                e.preventDefault();
                var x, y, dx, dy, dist, touches = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches : [];
                if(this.supported && 0 < touches.length) {
                    x = touches[0].pageX;
                    y = touches[0].pageY;
                } else {
                    x = e.pageX;
                    y = e.pageY;
                }
                if(2 <= touches.length) {
                    var p1 = e.originalEvent.touches[1];
                    dx = p1.pageX - x;
                    dy = p1.pageY - y;
                    dist = Math.sqrt(dx * dx + dy * dy);
                    this.execute('pinched', dist - this.pinch);
                    this.pinch = dist;
                } else {
                    if(this.numTouches == 1) {
                        this.execute('touchmove', {
                            dx: x - this.touchPrevious.x,
                            dy: y - this.touchPrevious.y
                        });
                    }
                }
                this.touchPrevious.x = x;
                this.touchPrevious.y = y;
            };
            Touch.prototype._onTouchEnd = function (e) {
                if(!this.enabled) {
                    return;
                }
                var x, y, dx, dy, dist, touches = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches : [];
                this.isTouching = (0 < touches.length);
                this.numTouches = touches.length;
                if(this.isTouching) {
                    if(this.supported && 0 < touches.length) {
                        x = touches[0].pageX;
                        y = touches[0].pageY;
                    } else {
                        x = e.pageX;
                        y = e.pageY;
                    }
                    this.touchPrevious.x = x;
                    this.touchPrevious.y = y;
                } else {
                    if(new Date().getTime() - this.touchStartTime < 300) {
                        if(this.touchPrevious.y - this.touchStart.y < -200) {
                            this.execute('vswipe', -1);
                        } else {
                            if(this.touchPrevious.y - this.touchStart.y > 200) {
                                this.execute('vswipe', 1);
                            }
                        }
                    }
                }
                if(touches.length < 2) {
                    this.pinch = 0;
                }
                var dx = this.touchPrevious.x - this.touchStart.x, dy = this.touchPrevious.y - this.touchStart.y;
                this.execute('clickable', Math.sqrt(dx * dx + dy * dy) < 20);
            };
            return Touch;
        })(hrfm.events.EventDispatcher);
        hardware.Touch = Touch;        
        var DeviceMotion = (function () {
            function DeviceMotion() {
                var that = this;
                window.addEventListener("devicemotion", function (e) {
                    that._onDeviceMotion(e);
                }, true);
                window.addEventListener("deviceorientation", function (e) {
                    that._onDeviceOrientation(e);
                }, true);
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.tilt = 0;
                this.orientation = window['orientation'] || 0;
                this.windowWidth = $(window).width();
                this.windowHeight = $(window).height();
                $(window).resize(function () {
                    that.windowWidth = $(window).width();
                    that.windowHeight = $(window).height();
                    that.orientation = window['orientation'] || 0;
                });
            }
            DeviceMotion._INSTANCE = null;
            DeviceMotion.getInstance = function getInstance() {
                if(!DeviceMotion._INSTANCE) {
                    DeviceMotion._INSTANCE = new DeviceMotion();
                }
                return DeviceMotion._INSTANCE;
            }
            DeviceMotion.supported = function supported() {
                return true;
            }
            DeviceMotion.prototype._onDeviceMotion = function (e) {
                var x = e['accelerationIncludingGravity'].x, y = e['accelerationIncludingGravity'].y, z = e['accelerationIncludingGravity'].z;
                this.x = ((x < 0) ? -1 : 1) * Math.pow(x / 10, 2);
                this.y = ((y < 0) ? -1 : 1) * Math.pow(y / 10, 2);
                this.z = ((z < 0) ? -1 : 1) * Math.pow(z / 10, 2);
                this.gravity = e['accelerationIncludingGravity'];
                var x_, tilt_;
                switch(this.orientation) {
                    case 0: {
                        x_ = this.y;
                        tilt_ = this.x;
                        break;

                    }
                    case 90: {
                        x_ = -this.x;
                        tilt_ = -this.y;
                        break;

                    }
                    case 180: {
                        x_ = -this.y;
                        tilt_ = -this.x;
                        break;

                    }
                    case -90: {
                        x_ = this.x;
                        tilt_ = this.y;
                        break;

                    }
                }
                this.tilt = tilt_;
            };
            DeviceMotion.prototype._onDeviceOrientation = function (e) {
                this.orientation = window['orientation'] || 0;
            };
            return DeviceMotion;
        })();
        hardware.DeviceMotion = DeviceMotion;        
    })(hrfm.hardware || (hrfm.hardware = {}));
    var hardware = hrfm.hardware;
})(hrfm || (hrfm = {}));
