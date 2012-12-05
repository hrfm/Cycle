/// <reference path="hrfm.events.d.ts" />
/// <reference path="../d/jquery.d.ts" />

module hrfm.hardware{
        
    // -----------------------
    // 座標情報.
    export interface IPoint{
        x:number;
        y:number;
    }

    export class Touch extends hrfm.events.EventDispatcher{

        // ------- MEMBERå ------------------------------------------------------

        static private _INSTANCE;

        supported:Boolean;
        enabled:Boolean;

        isTouching:Boolean;

        numTouches:number;

        touchStart:IPoint;
        touchStartTime:number;
        touchPrevious:IPoint;

        pinch:number;

        // ------- PUBLIC ------------------------------------------------------

        constructor(){
            
            super();

            this.supported = ('ontouchstart' in window);
            this.enabled   = true;

            this.isTouching = false;

            this.numTouches = 0;

            this.touchStart     = { x:0, y:0 };
            this.touchStartTime = 0;
            this.touchPrevious  = { x:0, y:0 };

            this.pinch = 0;

        }

        static getInstance():Touch{
            if( !Touch._INSTANCE ){
                Touch._INSTANCE = new Touch();
            }
            return Touch._INSTANCE;
        }

        listen( target:JQuery = $(window) ):Touch{
            var that = this;
            target.on({
                'touchstart mousedown' : function(e){ that._onTouchStart(e) },
                'touchmove mousemove'  : function(e){ that._onTouchMove(e)  },
                'touchend mouseup'     : function(e){ that._onTouchEnd(e)   }
            });
            return this;
        }

        // ------- PRIVATE -----------------------------------------------------

        private _onTouchStart(e):void{

            if( !this.enabled ) return;

            var x:number, y:number,
                touches = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches : [];

            if( this.supported && 0 < touches.length ){
                this.numTouches = touches.length;
                x = touches[0].pageX;
                y = touches[0].pageY;
            }else{
                this.numTouches = 1;
                x = e.pageX;
                y = e.pageY;
            }

            // タッチ位置を取得

            if( 2 <= touches.length ){
                var p1 = touches[1],
                    dx:number = p1.pageX - x,
                    dy:number = p1.pageY - y;
                this.pinch = Math.sqrt( dx*dx + dy*dy );
            }else{
                this.pinch = 0;
            }

            // タッチ開始位置に代入
            this.touchStart.x = this.touchPrevious.x = x;
            this.touchStart.y = this.touchPrevious.y = y;
            this.touchStartTime = new Date().getTime();
            this.isTouching = true;

        }

        private _onTouchMove(e):void{

            if( !this.enabled ) return;

            e.preventDefault();
            
            var x:number, y:number,
                dx:number, dy:number, dist:number,
                touches = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches : [];

            if( this.supported && 0 < touches.length ){
                x = touches[0].pageX;
                y = touches[0].pageY;
            }else{
                x = e.pageX;
                y = e.pageY;
            }
   
            if( 2 <= touches.length ){
                var p1 = e.originalEvent.touches[1];
                dx   = p1.pageX - x;
                dy   = p1.pageY - y;
                dist = Math.sqrt( dx*dx + dy*dy );
                this.execute('pinched', dist-this.pinch );
                this.pinch = dist;
            }else if( this.numTouches == 1 ){
                this.execute(
                    'touchmove',{
                        dx:x-this.touchPrevious.x,
                        dy:y-this.touchPrevious.y
                    }
                );
            }

            this.touchPrevious.x = x;
            this.touchPrevious.y = y;

        }

        private _onTouchEnd(e):void{
                            
            if( !this.enabled ) return;

            var x:number, y:number,
                dx:number, dy:number, dist:number,
                touches = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches : [];

            this.isTouching = ( 0 < touches.length );
            this.numTouches = touches.length;

            if( this.isTouching ){
                if( this.supported && 0 < touches.length ){
                    x = touches[0].pageX;
                    y = touches[0].pageY;
                }else{
                    x = e.pageX;
                    y = e.pageY;
                }
                this.touchPrevious.x = x;
                this.touchPrevious.y = y;
            }else{
                if( new Date().getTime() - this.touchStartTime < 300 ){
                    if( this.touchPrevious.y - this.touchStart.y < -200 ){
                        this.execute('vswipe',-1);
                    }else if( this.touchPrevious.y - this.touchStart.y > 200 ){
                        this.execute('vswipe',1);
                    }
                }
            }

            if( touches.length < 2 ){
                this.pinch = 0;
            }

            var dx = this.touchPrevious.x - this.touchStart.x,
                dy = this.touchPrevious.y - this.touchStart.y;
            this.execute( 'clickable', Math.sqrt(dx*dx+dy*dy) < 20 );

        }

    }

    export class DeviceMotion{

        // ------- MEMBER ------------------------
        static private _INSTANCE:DeviceMotion;

        x:number;
        y:number;
        z:number;
        gravity: Object;
        orientation:number;

        windowWidth:number;
        windowHeight:number;

        //tiltX:number;
        tilt:number;

        // ------- PUBLIC ------------------------

        constructor(){
            
            var that = this;
            
            window.addEventListener("devicemotion", function(e){ that._onDeviceMotion(e); }, true );
            window.addEventListener("deviceorientation", function(e){ that._onDeviceOrientation(e); }, true );

            this.x = 0;
            this.y = 0;
            this.z = 0;
            
            //this.tiltX = 0;
            this.tilt = 0;

            this.orientation = window['orientation'] || 0;

            this.windowWidth  = $(window).width();
            this.windowHeight = $(window).height();
            
            $(window).resize(function(){
                that.windowWidth  = $(window).width();
                that.windowHeight = $(window).height();
                that.orientation = window['orientation'] || 0;
            });

        }

        static getInstance():DeviceMotion{
            if( !DeviceMotion._INSTANCE ){
                DeviceMotion._INSTANCE = new DeviceMotion();
            }
            return DeviceMotion._INSTANCE;
        }

        static supported():Boolean{
            return true;
        }

        private _onDeviceMotion(e:Event){
            
            var x:number = e['accelerationIncludingGravity'].x,
                y:number = e['accelerationIncludingGravity'].y,
                z:number = e['accelerationIncludingGravity'].z;

            this.x = ((x<0)?-1:1) * Math.pow( x/10, 2 );
            this.y = ((y<0)?-1:1) * Math.pow( y/10, 2 );
            this.z = ((z<0)?-1:1) * Math.pow( z/10, 2 );
            this.gravity = e['accelerationIncludingGravity'];

            var x_, tilt_;

            switch( this.orientation ){
                case 0 : 
                    x_ = this.y;
                    tilt_ = this.x;
                    break;
                case 90 : 
                    x_ = -this.x;
                    tilt_ = -this.y;
                    break;
                case 180 : 
                    x_ = -this.y;
                    tilt_ = -this.x;
                    break;
                case -90 : 
                    x_ = this.x;
                    tilt_ = this.y;
                    break;
            }

            //this.tiltX = x_;
            this.tilt = tilt_;

        }

        private _onDeviceOrientation(e:Event){
            this.orientation = window['orientation'] || 0;
        }

    }

}