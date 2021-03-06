/*

 Copyright (c) 2014-2016 Hirofumi Kawakita
 hrfm0818@gmail.com
 https://github.com/hrfm/Cycle
 
 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

 */

module events{

	interface IClosure {
		// ------- MEMBER --------------------
		n: IClosure;
		// ------- PUBLIC --------------------
		e: (a) => IClosure;
	}

	/**
	 * ClosureList で使われるクロージャ管理用のオブジェクト.
	 */
	class Closure implements IClosure {
		// ------- MEMBER --------------------
		private static _ID: number = 0;
		// function
		private _f: Function;
		// scope
		private _s: Object;
		// priority
		priority: number;
		// indentity of this instance.
		id: number;
		// next
		n: Closure;
		// prev
		p: Closure;
		// ------- PUBLIC --------------------
		constructor(closure: Function, scope: Object = undefined, priority: number = 0) {
			this.id = Closure._ID++;
			this._f = closure;
			this._s = scope;
			this.priority = priority;
		}
		e(a = null): Closure {
			if (this._f.call(this._s, a) == false) {
				return null;
			} else {
				return this.n;
			}
		}
		eq(closure: Function, scope: Object = undefined): Boolean {
			return (closure == this._f && scope == this._s)
		}
	}

	/**
	 * 関数を連続実行するための Function の Linked List.
	 */
	class ClosureList {

		// ------- MEMBER --------------------

		head: Closure;
		tail: Closure;

		// ------- PUBLIC --------------------

		constructor() { }

		/**
		 * Linked List に Closure を追加.
		 * @param closure
		 * @param scope
		 * @param priority
		 */
		add(closure: Function, scope: Object = undefined, priority: number = 0): number {

			var c: Closure, p: Closure, t: Closure;

			if (!this.head) {

				// そもそも存在しない場合は即追加.
				c = new Closure(closure, scope, priority);
				this.head = this.tail = c;

			} else {

				// 重複を調べて追加.
				c = this.head;
				t = null;

				while (c) {
					// 既に存在した場合リターン.
					if (c.eq(closure, scope)) return -1;
					// priority で入れる場所を判断.
					if (!t && c.priority < priority) {
						t = c;
					}
					c = c.n;
				}

				// 新規 Closure インスタンスを作成.
				c = new Closure(closure, scope, priority);

				if (!t) {
					// ターゲットが存在しない場合は末尾に追加.
					t = this.tail;
					t.n = c;
					c.p = t;
					this.tail = c;
				} else if (!t.p) {
					// ターゲットが先頭の場合.
					t.p = c;
					c.n = t;
					this.head = c;
				} else {
					// ターゲットが先頭/末尾以外の場合.
					p = t.p;
					t.p = c;
					c.n = t;
					c.p = p;
					p.n = c;
				}
			}
			return c.id;
		}

		/**
		 * 指定した closure と scope の Closure を
		 * Linked List から削除します.
		 * @param closure
		 * @param scope
		 */
		rm(closure: Function, scope: Object = undefined): void {
			var c: Closure = this.head;
			while (c) {
				if (c.eq(closure, scope)) {
					this._rm(c);
					c = null;
					return;
				}
				c = c.n;
			}
		}

		/**
		 * 指定した ID の Closure を
		 * Linked List から削除します.
		 * @param id
		 */
		rmById(id: number): void {
			var c: Closure = this.head;
			while (c) {
				if (c.id == id) {
					this._rm(c);
					c = null;
					return;
				}
				c = c.n;
			}
		}

		/**
		 * このリストに登録されている全てのリスナを削除します.
		 */
		rmAll(): void {
			var c: Closure = this.head, n: Closure;
			// スコープの指定が無い場合は全て破棄する.
			while (c) {
				n = c.n;
				c = null;
				c = n;
			}
			this.head = null;
			this.tail = null;
		}

		/**
		 * このリストに登録されている全てのリスナを実行します.
		 * @param eventObject
		 */
		exec(eventObject: Object = undefined): void {
			if (!this.head) return;
			var c: Closure = this.head;
			if (typeof eventObject === 'undefined') {
				while (c) c = c.e();
			} else {
				while (c) c = c.e(eventObject);
			}
		}

		// ------- PRIVATE ------------------------------------------

		/**
		 * リスナ削除の内部処理.
		 */
		private _rm(c: Closure) {
			// Closure の削除
			if (this.head == c) {
				if (this.tail == c) {
					this.head = null;
					this.tail = null;
					return;
				}
				this.head = c.n;
				c.n.p = null;
			} else if (this.tail == c) {
				this.tail = c.p;
				c.p.n = null;
			} else {
				c.p.n = c.n;
				c.n.p = c.p;
			}
		}

	}

	// ===================================================================
	// Event の通知を管理するクラス.

	export interface IEventDispatcher {

		_hash_: ClosureList[];

		/**
		 * 指定した state のイベントを Listen します.
		 * @param state
		 * @param closure
		 * @param scope
		 * @param priority
		 */
		on: (state: string, closure: Function, scope: Object, priority: number) => EventDispatcher;

		/**
		 * 指定した state のイベントを Listen し, その id を返します.
		 * ここで取得した id を使って off(id) でリスナ解除が可能です.
		 * @param state
		 * @param closure
		 * @param scope
		 * @param priority
		 * @return
		 */
		onWithId: (state: string, closure: Function, scope: Object, priority: number) => number;

		/**
		 * 指定した state のイベントの Listen を解除します.
		 * @param state
		 * @param closure
		 * @param scope
		 */
		off: (state: any, closure: Function, scope: Object) => EventDispatcher;

		/**
		 * 指定した state のイベントを発行します.
		 * @param state
		 * @param eventObject
		 */
		trigger: (state: string, eventObject: Object) => void;

		/**
		 * 全てのリスナを破棄します.
		 * この動作は取り消しが出来ません.
		 */
		removeAllListeners: () => void;

	}

	export class EventDispatcher implements IEventDispatcher {

		// ------- MEMBER --------------------------------------------

		_hash_: ClosureList[];

		// ------- PUBLIC --------------------------------------------

		constructor() {
			this._hash_ = [];
		}

		/**
		 * 指定した state のイベントを Listen します.
		 * @param state
		 * @param closure
		 * @param scope
		 * @param priority
		 */
		on(state: string, closure: Function, scope: Object = this, priority: number = 0): EventDispatcher {
			var i: number, s: string,
				list: string[] = state.split(' '),
				len: number = list.length;
			for (i = 0; i < len; i++) {
				s = list[i];
				if (!this._hash_[s]) {
					this._hash_[s] = new ClosureList();
				}
				this._hash_[s].add(closure, scope, priority);
			}
			return this;
		}

		/**
		 * 指定した state のイベントを Listen し, その id を返します.
		 * ここで取得した id を使って off(id) でリスナ解除が可能です.
		 * @param state
		 * @param closure
		 * @param scope
		 * @param priority
		 * @return
		 */
		onWithId(state: string, closure: Function, scope: Object = this, priority: number = 0): number {
			if (!this._hash_[state]) {
				this._hash_[state] = new ClosureList();
			}
			return this._hash_[state].add(closure, scope, priority);
		}

		/**
		 * 指定した state のイベントの Listen を解除します.
		 * @param state
		 * @param closure
		 * @param scope
		 */
		off(state: any, closure: Function = undefined, scope: Object = this): EventDispatcher {
			if (typeof state === 'number') {
				for (var key in this._hash_) {
					this._hash_[key].rmById(state);
				}
			} else if (typeof state === 'string') {
				var i: number, s: string,
					list: string[] = state.split(' '),
					len: number = list.length;
				for (i = 0; i < len; i++) {
					s = list[i];
					if (!this._hash_[s]) {
						continue;
					}
					if (typeof closure === 'undefined') {
						this._hash_[s].rmAll();
					} else {
						this._hash_[s].rm(closure, scope);
					}
				}
			}
			return this;
		}

		/**
		 * 指定した state のイベントを発行します.
		 * @param state
		 * @param eventObject
		 */
		trigger(state: string, eventObject: Object = null): void {
			if (this._hash_[state]) this._hash_[state].exec(eventObject);
		}

		/**
		 * 全てのリスナを破棄します.
		 * この動作は取り消しが出来ません.
		 */
		removeAllListeners(): void {
			for (var key in this._hash_) {
				this._hash_[key].rmAll();
			}
			this._hash_ = [];
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
class Cycle extends events.EventDispatcher{

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
		this.initialTime = new Date().getTime();
		this.elapsedTime = 0;

		// アニメーション管理用の処理
		this._requestAnimationFrame =
			window['requestAnimationFrame']       ||
			window['webkitRequestAnimationFrame'] ||
			window['mozRequestAnimationFrame']    ||
			window['oRequestAnimationFrame']      ||
			window['msRequestAnimationFrame']     ||
			function(callback){ return setTimeout(callback, 17 ); };

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
			_i         : number,
			_now       : number = 0,
			_time      : number = new Date().getTime(),
			_startTime : number = _time,
			_elapsed   : number = 0,
			_interval  : number = this.interval;

		// 単位時間ごとの処理を最適化するか.
		if( 0 < _interval ){
			this._onAnimate = function(){
				_now = new Date().getTime();
				if( _interval * 100 < _now - _time ){
					_time = _now - _interval;
				}
				_elapsed = _now - _time;
				if( _interval < _elapsed ){
					var times:number = ~~(_elapsed/_interval);
					_time += times * _interval;
					that.trigger( 'cycle', times );
				}
				that.elapsedTime += _elapsed;
				that._animateID = that._requestAnimationFrame.call( window, that._onAnimate );
			}
		}else{
			this._onAnimate = function(){
				_now     = new Date().getTime();
				_elapsed = _now - _time;
				that.elapsedTime += _elapsed;
				that.trigger( 'cycle', 1 );
				_time = _now;
				that._animateID = that._requestAnimationFrame.call( window, that._onAnimate );
			}
		}
		this._animateID = this._requestAnimationFrame.call( window, that._onAnimate );

		this.running = true;

		this.trigger('start');

	}

	/**
	 * 監視サイクルを停止します.
	 */
	stop(){

		if( this.running == false ) return;

		this._onAnimate = function(){};
		this._cancelAnimationFrame.call( window, this._animateID );

		this.running = false;

		this.trigger('stop');

	}

	// ------- PRIVATE -------------------------------------------

}

export {events};
export {Cycle};
