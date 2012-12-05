/// <reference path="hrfm.events.d.ts" />
class Cycle extends hrfm.events.EventDispatcher {
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
