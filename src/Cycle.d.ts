declare module hrfm {
    interface IClosure {
        n: IClosure;
        e: (a) => IClosure;
    }
    class Closure implements IClosure {
        private static _ID;
        private _f;
        private _s;
        priority: number;
        id: number;
        n: Closure;
        p: Closure;
        constructor(closure: Function, scope?: Object, priority?: number);
        e(a?: any): Closure;
        eq(closure: Function, scope?: Object): Boolean;
    }
    class ClosureList {
        head: Closure;
        tail: Closure;
        constructor();
        add(closure: Function, scope?: Object, priority?: number): number;
        rm(closure: Function, scope?: Object): void;
        rmById(id: number): void;
        rmAll(): void;
        exec(eventObject?: Object): void;
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
        _hash_: ClosureList[];
        constructor();
        on(state: string, closure: Function, scope?: Object, priority?: number): EventDispatcher;
        onWithId(state: string, closure: Function, scope?: Object, priority?: number): number;
        off(state: any, closure?: Function, scope?: Object): EventDispatcher;
        execute(state: string, eventObject?: Object): void;
        removeAllListeners(): void;
    }
}
declare class Cycle extends hrfm.EventDispatcher {
    interval: number;
    initialTime: number;
    elapsedTime: number;
    running: Boolean;
    private _onAnimate;
    private _animateID;
    private _requestAnimationFrame;
    private _cancelAnimationFrame;
    constructor(interval?: number);
    start(): void;
    stop(): void;
}
