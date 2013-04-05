Cycle.js
=====

#Introduction

Cycle.js は javascript での一定サイクルでの処理(アニメーション処理など)の実装を

簡略化するために試作しているUtilityです.

内部的な処理としては requestAnimationFrame が利用出来ればそれを使い

使用出来なければ setTimeout を用いて一定間隔での処理を実行します.

#Goal

Flash でいう ENTER_FRAME 的なものを簡単に出来るようにしたい.

CSS3 Animation 使えっていうのは、まあ、うん.

#Usage

## new Cycle(interval);

### interval

ここで指定したミリ秒間隔で cycle を発行します。

cycle 発生時の処理方法は後述の on 関数を参照してください。

## on(type,closure,scope)

Cycle は jQuery などと同様に on 関数を用いて実行内容を定義します.

scope に参照を渡す事で、 closure の実行する際の this 参照を指定する事が出来ます。

### type

type は 'start', 'cycle', 'stop' の三種類があります. 

- start

    サイクルのタイマーが開始されたタイミングで発行されます。

- cycle

    原則的にはコンストラクタで指定した間隔で発行されます。しかし、処理負荷が高まった時などには、指定した interval の間隔を超えてしまう事があります。
    
    遅延の影響を無視出来るの状況であれば良いのですが多くのアニメーション処理の場合、時間との整合性は極めて重要です。
    
    そういった状況に対応するため、cycle で実行される closure の引数には経過時間あたりに cycle を何回発行すべきであったかを引数に渡しています。
    
    たとえば interval を 16 ミリ秒に指定していたが処理負荷によって 50 ミリ秒経過してしまった場合
    
    Math.floor( 50 / 16 ) = 3 を引数に渡します。遅延無く実行された場合には 1 が渡されます。

- stop

    サイクルのタイマーが停止されたタイミングで発行されます。

### closure

closure はtype で指定したタイミングで実行される関数を渡します。

前述のとおり、発行時間間隔において実行されるべきであった

cycle の回数を引数に実行されます。

### scope

scope には closure を実行する際の this 参照のスコープを渡す事が出来ます。

## off(type,closure,scope)

on 関数で指定したハンドラを解除します。

## start()

Cycle による一定間隔処理を開始します。

## stop()

Cycle による一定間隔処理を停止します。

## exsample

    var cycle = new Cycle();
    cycle
      .on('start', function(){
        // 
      }, this )
      .on('cycle', function(times){
        // 
      }, this )
      .on('stop', function(){
        // 
      }, this )
    ;
    cycle.start();
