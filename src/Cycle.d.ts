/// <reference path="hrfm.events.d.ts" />
module hrfm {
    class Event {
        static WHEEL: string;
        static RESIZE: string;
        static START: string;
        static MOVE: string;
        static END: string;
        static CANCEL: string;
        static TRNEND: string;
        static TOUCH_SUPPORTED: Boolean;
        static initialize(hasTouch: Boolean, vendor, isGecko: Boolean): void;
        static bind(target, type: string, callback: Function, useCapture?: Boolean): void;
        static unbind(target, type: string, callback: Function, useCapture?: Boolean): void;
        static click(target): void;
    }
    interface IClosure {
        n: IClosure;
        e: (a: any) => IClosure;
    }
    class Closure implements IClosure {
        static _ID;
        private _f;
        private _s;
        public priority: number;
        public id: number;
        public n: Closure;
        public p: Closure;
        constructor (closure: Function, scope?: Object, priority?: number);
        public e(a?): Closure;
        public eq(closure: Function, scope?: Object): Boolean;
    }
    class ClosureList {
        public head: Closure;
        public tail: Closure;
        constructor ();
        public add(closure: Function, scope?: Object, priority?: number): number;
        public rm(closure: Function, scope?: Object): void;
        public rmById(id: number): void;
        public rmAll(): void;
        public exec(eventObject?: Object): void;
        private _rm(c);
    }
    interface IEventDispatcher {
        _hash_: ClosureList[];
        on: (state: string, closure: Function, scope: Object, priority: number) => EventDispatcher;
        onWithId: (state: string, closure: Function, scope: Object, priority: number) => number;
        off: (state: any, closure: Function, scope: Object) => EventDispatcher;
        execute: (state: string, eventObject: Object) => void;
        removeAllListeners: () => void;
    }
    class EventDispatcher implements IEventDispatcher {
        public _hash_: ClosureList[];
        constructor ();
        public on(state: string, closure: Function, scope?: Object, priority?: number): EventDispatcher;
        public onWithId(state: string, closure: Function, scope?: Object, priority?: number): number;
        public off(state: any, closure?: Function, scope?: Object): EventDispatcher;
        public execute(state: string, eventObject?: Object): void;
        public removeAllListeners(): void;
    }
}
class Cycle extends hrfm.EventDispatcher {
    public interval: number;
    public initialTime: number;
    public elapsedTime: number;
    public running: Boolean;
    private _onAnimate;
    private _animateID;
    private _requestAnimationFrame;
    private _cancelAnimationFrame;
    constructor (interval?: number);
    public start(): void;
    public stop(): void;
}
