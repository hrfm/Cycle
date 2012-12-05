module hrfm.events {
    interface IClosure {
        n: IClosure;
        e: (a: any) => IClosure;
    }
    class Closure implements IClosure {
        private f;
        private s;
        private p;
        public n: Closure;
        constructor (closure: Function, scope?: Object, priority?: number);
        public e(a?): Closure;
        public equals(closure: Function, scope?: Object): Boolean;
    }
    class ClosureList {
        public head: Closure;
        public tail: Closure;
        constructor ();
        public add(closure: Function, scope?: Object, priority?: number): void;
        public remove(closure: Function, scope?: Object): void;
        public removeAll(): void;
        public execute(eventObject?: Object): void;
    }
    class EventDispatcher {
        public _hash_: ClosureList[];
        constructor ();
        public on(state: string, closure: Function, scope?: Object): EventDispatcher;
        public off(state: string, closure?: Function, scope?: Object): EventDispatcher;
        public execute(state: string, eventObject?: Object): void;
    }
}
