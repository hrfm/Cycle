module hrfm{

    export interface IClosure{
        // ------- MEMBER --------------------
        n :IClosure;
        // ------- PUBLIC --------------------
        e :(a) => IClosure;
    }

    export class Closure implements IClosure{
        // ------- MEMBER --------------------
        // function
        private f:Function;
        // scope
        private s:Object;
        // priority
        private p:number;
        // next
        n : Closure;
        // ------- PUBLIC --------------------
        constructor( closure:Function, scope:Object = null, priority:number = 0 ){
            this.f = closure;
            this.s = scope;
            this.p = priority;
        }
        e(a = null):Closure{
            this.f.call( this.s, a );
            return this.n;
        }
    }

    export class ClosureList{

        // ------- MEMBER --------------------

        private _closures:Closure[];
        fnc:Function;
        // ------- PUBLIC --------------------

        constructor(){
            this._closures = [];
        }

        add( closure:Function, scope:Object = null, priority:number = 0 ):void{
            var fnc:Closure    = new Closure( closure, scope, priority ),
                len:number = this._closures.length;
            if( 0 < len ) this._closures[len-1].n = fnc;
            this._closures[len] = fnc;
        }

        execute():void{

            if( this._closures.length == 0 ) return;

            var c:Closure = this._closures[0];

            if( typeof arguments === 'undefined' ){
                while(c) c = c.e();
            }else{
                while(c) c = c.e(arguments);
            }
        }

    }

    /**
     * 時間監視を行うユーティリティクラスです.
     * 利用可能であれば AnimationFrame を利用し、描画タイミングの最適化を行いやすくします.
     * 
     * @author KAWAKITA Hirofumi.
     * @version 0.1
     */
    export class Cycle{

        // ------- MEMBER --------------------------------------------

        elapsedTime : number;

        private _interval    : number;
        private _initialTime : number;
        private _startTime   : number;

        private _running : Boolean;

        private _timerID   : number;
        private _onTimeout : Function;

        private _animateID : number;
        private _onAnimate : Function;

        private _requestAnimationFrame:Function;
        private _cancelAnimationFrame :Function;

        private _y:Object;

        // ------- PUBLIC --------------------------------------------

        constructor( interval:number = 16 ){

            this._interval = interval;
            this._initialTime = Date.now();

            this._y = {
                'start' : new ClosureList(),
                'stop'  : new ClosureList(),
                'cycle' : new ClosureList()
            }


            // アニメーション管理用の処理
            this._requestAnimationFrame =
                window['requestAnimationFrame']       ||
                window['webkitRequestAnimationFrame'] ||
                window['mozRequestAnimationFrame']    ||
                window['oRequestAnimationFrame']      ||
                window['msRequestAnimationFrame']     ||
                function(callback){ return setTimeout(callback, 8); };

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

            if( this._running == true ) return;

            var that = this;
            var time:number = Date.now();

            this._startTime = time;

            this._onTimeout = function(){

                var now:number = Date.now();

                this.elapsedTime += now - time;
                time = now;

                that._y['cycle'].execute();
                that._timerID = setTimeout( that._onTimeout, that._interval );

            }
            this._timerID = setTimeout( this._onTimeout, this._interval );

            /*
            this._onAnimate = function(){
                that._y['cycle'].execute();
                that._animateID = that._requestAnimationFrame.call( window, that._onAnimate );
            }
            this._animateID = this._requestAnimationFrame.call( window, this._onAnimate );
            */

            this._running = true;

            this._y['start'].execute();

        }

        /**
         * 監視サイクルを停止します.
         */
        stop(){

            if( this._running == false ) return;

            clearTimeout( this._timerID );
            this._cancelAnimationFrame.call( window, this._animateID );

            this._running = false;

            this._y['stop'].execute();

        }

        /**
         * 監視サイクルが実行中であるかを調べます.
         * @return
         */
        running():Boolean{
            return this._running;
        }

        /**
         * 監視サイクルのイベントをListenします.
         */
        bind( state:string, closure:Function, scope:Object ){
            if( typeof this._y[state] === 'undefined' ) return;
            this._y[state].add( closure, scope );
        }

        /**
         * 監視サイクルのイベントのListenを解除します.
         */
        unbind( state:string, closure:Function, scope:Object ){
            if( typeof this._y[state] === 'undefined' ) return;
            //_y[state].remove( closure, scope );
        }

        // ------- PRIVATE -------------------------------------------

    }

}