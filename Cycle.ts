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
        constructor( closure:Function, scope:Object = undefined, priority:number = 0 ){
            this.f = closure;
            this.s = scope;
            this.p = priority;
        }
        e(a = null):Closure{
            this.f.call( this.s, a );
            return this.n;
        }
        equals( closure:Function, scope:Object = undefined ):Boolean{
            return ( closure == this.f && scope == this.s )
        }
    }

    export class ClosureList{

        // ------- MEMBER --------------------
        
        head:Closure;
        tail:Closure;

        // ------- PUBLIC --------------------

        constructor(){}

        add( closure:Function, scope:Object = undefined, priority:number = 0 ):void{
            var c:Closure = this.head;
            while(c){
                if( c.equals( closure, scope ) ) return;
                c = c.n;
            }
            c = new Closure( closure, scope, priority );
            if( !this.head ){
                this.head = this.tail = c;
            }else{
                this.tail.n = c;
                this.tail = c;
            }
        }

        remove( closure:Function, scope:Object = undefined ):void{
            var c:Closure = this.head,
                b4:Closure;
            while(c){
                if( c.equals( closure, scope ) ){
                    if( b4 ){
                        b4.n = c.n;
                        if(!b4.n) this.tail = b4;
                    }else if( c == this.head ){
                        this.head = c.n;
                    }else{
                        b4.n = c.n;
                    }
                    c = null;
                    return;
                }
                b4 = c;
                c = c.n;
            }
        }

        removeAll():void{
            var c:Closure = this.head,
                n:Closure;
            while( c ){
                n = c.n;
                c = null;
                c = n;
            }
            this.head = null;
            this.tail = null;
        }

        execute( eventObject:Object = undefined ):void{
            if( !this.head ) return;
            var c:Closure = this.head;
            if( typeof eventObject === 'undefined' ){
                while(c) c = c.e();
            }else{
                while(c) c = c.e(eventObject);
            }
        }

    }

    export class EventDispatcher{

        // ------- MEMBER --------------------------------------------
        
        private _hash_:ClosureList[];

        // ------- PUBLIC --------------------------------------------

        constructor(){
            this._hash_ = [];
        }

        /**
         * 指定した state のイベントを Listen します.
         * @param state
         * @param closure
         * @param scope
         */
        on( state:string, closure:Function, scope:Object = undefined ):EventDispatcher{
            var i:number, s:string,
                list:string[] = state.split(' '),
                len:number = list.length;
            for( i=0; i<len; i++ ){
                s = list[i];
                if( !this._hash_[s] ){
                    this._hash_[s] = new ClosureList();
                }
                this._hash_[s].add( closure, scope );
            }
            return this;
        }

        /**
         * 指定した state のイベントの Listen を解除します.
         * @param state
         * @param closure
         * @param scope
         */
        off( state:string, closure:Function = undefined, scope:Object = undefined ):EventDispatcher{
            var i:number, s:string,
                list:string[] = state.split(' '),
                len:number = list.length;
            for( i=0; i<len; i++ ){
                s = list[i];
                if( !this._hash_[s] ){
                    continue;
                }
                if( typeof closure === 'undefined' ){
                    this._hash_[s].removeAll();
                }else{
                    this._hash_[s].remove( closure, scope );
                }
            }
            return this;
        }

        /**
         * 指定した state のイベントを発行します.
         * @param state
         */
        execute( state:string, eventObject:Object = null ):void{
            if( this._hash_[state] ) this._hash_[state].execute(eventObject);
        }

    }

    /**
     * 時間監視を行うユーティリティクラスです.
     * 利用可能であれば AnimationFrame を利用し、描画タイミングの最適化を行いやすくします.
     * 
     * @author KAWAKITA Hirofumi.
     * @version 0.1
     */
    export class Cycle extends EventDispatcher{

        // ------- MEMBER --------------------------------------------

        interval    : number;
        initialTime : number;
        elapsedTime : number;
        
        running : Boolean;
        
        private _onAnimate : Function;
        private _animateID : number;
        private _requestAnimationFrame:Function;
        private _cancelAnimationFrame :Function;

        // ------- PUBLIC --------------------------------------------

        constructor( interval:number = 16 ){

            super();

            this.running  = false;
            this.interval = interval;
            this.initialTime = Date.now();

            // アニメーション管理用の処理
            this._requestAnimationFrame =
                window['requestAnimationFrame']       ||
                window['webkitRequestAnimationFrame'] ||
                window['mozRequestAnimationFrame']    ||
                window['oRequestAnimationFrame']      ||
                window['msRequestAnimationFrame']     ||
                function(callback){ return setTimeout(callback, interval); };

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
                _elapsed   : number   = 0;

            this._onAnimate = function(){
                _now     = Date.now();
                _elapsed = _now - _time;
                _time    = _now;
                that.elapsedTime += _elapsed;
                that.execute('cycle');
                that._animateID = that._requestAnimationFrame.call( window, that._onAnimate );
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

}