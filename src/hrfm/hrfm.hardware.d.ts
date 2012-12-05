/// <reference path="hrfm.events.d.ts" />
/// <reference path="../d/jquery.d.ts" />
module hrfm.hardware {
    interface IPoint {
        x: number;
        y: number;
    }
    class Touch extends events.EventDispatcher {
        static _INSTANCE;
        public supported: Boolean;
        public enabled: Boolean;
        public isTouching: Boolean;
        public numTouches: number;
        public touchStart: IPoint;
        public touchStartTime: number;
        public touchPrevious: IPoint;
        public pinch: number;
        constructor ();
        static getInstance(): Touch;
        public listen(target?: JQuery): Touch;
        private _onTouchStart(e);
        private _onTouchMove(e);
        private _onTouchEnd(e);
    }
    class DeviceMotion {
        static _INSTANCE;
        public x: number;
        public y: number;
        public z: number;
        public gravity: Object;
        public orientation: number;
        public windowWidth: number;
        public windowHeight: number;
        public tilt: number;
        constructor ();
        static getInstance(): DeviceMotion;
        static supported(): Boolean;
        private _onDeviceMotion(e);
        private _onDeviceOrientation(e);
    }
}
