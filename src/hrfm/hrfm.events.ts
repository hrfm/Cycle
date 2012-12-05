module hrfm.events{
        
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
        
        _hash_:ClosureList[];

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

}