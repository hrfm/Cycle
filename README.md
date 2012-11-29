Cycle.js
=====

Cycle.js は javascript での一定サイクルでの処理(アニメーション処理など)の実装を

簡略化するために試作しているUtilityです.

内部的な処理としては requestAnimationFrame が利用出来ればそれを使い

使用出来なければ setTimeout を用いて一定間隔での処理を実行します.

#Usage

## on(type,closure,scope)

Cycle は jQuery などと同様に on 関数を用いて実行内容を定義します.

### type

type は 'start', 'cycle', 'stop' の三種類があります. 

- start

    サイクルのタイマーが開始されたタイミングで発行されます.

- cycle

    一定間隔で発行されます.

- stop

    サイクルのタイマーが停止されたタイミングで発行されます.

### closure

closure はtype で指定したタイミングで実行される関数を渡します.

### scope

scope には closure を実行する際の this 参照のスコープを渡す事が出来ます.

## off(type,closure,scope)

on 関数で指定したハンドラを解除します.

## start()

Cycle による一定間隔処理を開始します.

## stop()

Cycle による一定間隔処理を停止します.

## exsample

    var cycle = new hrfm.Cycle();
    cycle
      .on('start', function(){
        // 
      }, this )
      .on('cycle', function(){
        // 
      }, this )
      .on('stop', function(){
        // 
      }, this )
    ;
    cycle.start();