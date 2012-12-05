/// <reference path="hrfm.events.d.ts" />

/**
 * 時間監視を行うユーティリティクラスです.
 * 利用可能であれば AnimationFrame を利用し、描画タイミングの最適化を行いやすくします.
 * 
 * @author KAWAKITA Hirofumi.
 * @version 0.1
 */
class Cycle extends hrfm.events.EventDispatcher{

    // ------- MEMBER --------------------------------------------

    interval    : number;
    initialTime : number;
    elapsedTime : number;
    running     : Boolean;
    
    private _onAnimate : Function;
    private _animateID : number;
    private _requestAnimationFrame:Function;
    private _cancelAnimationFrame :Function;

    // ------- PUBLIC --------------------------------------------

    constructor( interval:number = 0 ){

        super();

        this.running  = false;
        this.interval = interval;
        this.initialTime = Date.now();
        this.elapsedTime = 0;

        // アニメーション管理用の処理
        this._requestAnimationFrame =
            window['requestAnimationFrame']       ||
            window['webkitRequestAnimationFrame'] ||
            window['mozRequestAnimationFrame']    ||
            window['oRequestAnimationFrame']      ||
            window['msRequestAnimationFrame']     ||
            function(callback){ return setTimeout(callback, interval || 1 ); };

        this._cancelAnimationFrame =
            window['cancelRequestAnimationFrame']       ||
            window['webkitCancelAnimationFrame']        ||
            window['webkitCancelRequestAnimationFrame'] ||
            window['mozCancelRequestAnimationFrame']    ||
            window['oCancelRequestAnimationFrame']      ||
            window['msCancelRequestAnimationFrame']     ||
            clearTimeout;

    }

    /**
     * 監視サイクルを開始します.
     */
    start(){

        if( this.running == true ) return;

        var that = this,
            _now       : number   = 0,
            _time      : number   = Date.now(),
            _startTime : number   = _time,
            _elapsed   : number   = 0,
            _interval  : number   = this.interval;

        // 単位時間ごとの処理を最適化するか.
        if( 0 < _interval ){
            this._onAnimate = function(){
                _now = Date.now();
                if( _interval * 100 < _now - _time ){
                    _time = _now - _interval;
                }
                while( _interval <= _now - _time ){
                    _elapsed = _now - _time;
                    that.elapsedTime += _elapsed;
                    _time += _interval;
                    that.execute( 'cycle', _now - _time < _interval );
                }
                that._animateID = that._requestAnimationFrame.call( window, that._onAnimate );
            }
        }else{
            this._onAnimate = function(){
                _now     = Date.now();
                _elapsed = _now - _time;
                that.elapsedTime += _elapsed;
                that.execute( 'cycle', true );
                _time = _now;
                that._animateID = that._requestAnimationFrame.call( window, that._onAnimate );
            }
        }
        this._animateID = this._requestAnimationFrame.call( window, that._onAnimate );

        this.running = true;

        this.execute('start');

    }

    /**
     * 監視サイクルを停止します.
     */
    stop(){

        if( this.running == false ) return;

        this._onAnimate = function(){};
        this._cancelAnimationFrame.call( window, this._animateID );

        this.running = false;

        this.execute('stop');

    }

    // ------- PRIVATE -------------------------------------------

}