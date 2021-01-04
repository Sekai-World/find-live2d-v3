/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as acubismmotion } from './acubismmotion';
import { Live2DCubismFramework as cubismmotionqueueentry } from './cubismmotionqueueentry';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubismusermodel } from '../../framework/model/cubismusermodel';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import csmString = csmstring.csmString;
import CubismModel = cubismmodel.CubismModel;
import CubismUserModel = cubismusermodel.CubismUserModel;
import csmVector = csmvector.csmVector;
import iterator = csmvector.iterator;
import CubismMotionQueueEntry = cubismmotionqueueentry.CubismMotionQueueEntry;
import ACubismMotion = acubismmotion.ACubismMotion;
import { LAppDefine } from '../../lappdefine';
import { LAppPal } from '../../lapppal';

export namespace Live2DCubismFramework {
  /**
   * モーション再生の管理
   *
   * モーション再生の管理用クラス。CubismMotionモーションなどACubismMotionのサブクラスを再生するために使用する。
   *
   * @note 再生中に別のモーションが StartMotion()された場合は、新しいモーションに滑らかに変化し旧モーションは中断する。
   *       表情用モーション、体用モーションなどを分けてモーション化した場合など、
   *       複数のモーションを同時に再生させる場合は、複数のCubismMotionQueueManagerインスタンスを使用する。
   */
  export class CubismMotionQueueManager {
    public _userTimeSeconds: number; // デルタ時間の積算値[秒]

    public _motions: csmVector<CubismMotionQueueEntry>; // モーション
    public _eventCallBack: CubismMotionEventFunction; // コールバック関数
    public _eventCustomData: any; // コールバックに戻されるデータ
    public _currentPriority: number;
    public _reservePriority: number;

    /**
     * コンストラクタ
     */
    public constructor() {
      this._userTimeSeconds = 0.0;
      this._eventCallBack = null;
      this._eventCustomData = null;
      this._currentPriority = 0;
      this._reservePriority = 0;
      this._motions = new csmVector<CubismMotionQueueEntry>();
    }

    /**
     * デストラクタ
     */
    public release(): void {
      for (let i = 0; i < this._motions.getSize(); ++i) {
        if (this._motions.at(i)) {
          this._motions.at(i).release();
          this._motions.set(i, void 0);
          this._motions.set(i, null);
        }
      }

      this._motions = null;
    }

    /**
     * 指定したモーションの開始
     *
     * 指定したモーションを開始する。同じタイプのモーションが既にある場合は、既存のモーションに終了フラグを立て、フェードアウトを開始させる。
     *
     * @param   motion          開始するモーション
     * @param   autoDelete      再生が終了したモーションのインスタンスを削除するなら true
     * @param   userTimeSeconds デルタ時間の積算値[秒]
     * @return                      開始したモーションの識別番号を返す。個別のモーションが終了したか否かを判定するIsFinished()の引数で使用する。開始できない時は「-1」
     */
    public startMotion(
      motion: ACubismMotion,
      autoDelete: boolean,
      userTimeSeconds: number,
      model: CubismUserModel,
    ): Promise<CubismUserModel> {
      return new Promise<CubismUserModel>((resolve, reject) => {
        if (motion == null) {
          reject('no motion');
          return model;
        }

        let motionQueueEntry: CubismMotionQueueEntry = null;

        // 既にモーションがあれば終了フラグを立てる
        for (let i = 0; i < this._motions.getSize(); ++i) {
          motionQueueEntry = this._motions.at(i);
          if (motionQueueEntry == null) {
            continue;
          }

          motionQueueEntry.setFadeOut(motionQueueEntry._motion.getFadeOutTime()); // フェードアウト設定
        }

        motionQueueEntry = new CubismMotionQueueEntry(); // 終了時に破棄する
        motionQueueEntry._autoDelete = autoDelete;
        motionQueueEntry._motion = motion;

        this._motions.clear();
        this._motions.pushBack(motionQueueEntry);
        if (motion._name.split('_')[0] === model._motionIdleName && motion._weight === LAppDefine.PriorityIdle) {
          resolve();
          return;
        }

        const timeCount: number = new Date().getTime();
        const timer = window.setInterval(() => {
          if (this.isFinishedByMotionName(motion._name)) {
            window.clearInterval(timer as number);

            // resolve(motionQueueEntry._motionQueueEntryHandle, model);
            if (LAppDefine.DebugMode) {
              LAppPal.printLog('[APP]resolve motion {0}', motion._name);
              LAppPal.printLog('----------------------------------');
            }
            resolve(model);
          } else {
            let now = new Date().getTime();
            if (now - timeCount >= 30000) {
              window.clearInterval(timer as number);
              this._currentPriority = 0;
              reject(new Error('动画执行超时(30s)'));
            }
          }
        }, 20);

        return motionQueueEntry._motionQueueEntryHandle;
      });
    }

    /**
     * 全てのモーションの終了の確認
     * @return true 全て終了している
     * @return false 終了していない
     */
    public isFinished(): boolean {
      // ------- 処理を行う -------
      // 既にモーションがあれば終了フラグを立てる

      for (
        let ite: iterator<CubismMotionQueueEntry> = this._motions.begin();
        ite.notEqual(this._motions.end());

      ) {
        let motionQueueEntry: CubismMotionQueueEntry = ite.ptr();

        if (motionQueueEntry == null) {
          ite = this._motions.erase(ite); // 削除
          continue;
        }

        const motion: ACubismMotion = motionQueueEntry._motion;

        if (motion == null) {
          motionQueueEntry.release();
          motionQueueEntry = void 0;
          motionQueueEntry = null;
          ite = this._motions.erase(ite); // 削除
          continue;
        }

        // ----- 終了済みの処理があれば削除する ------
        if (!motionQueueEntry.isFinished()) {
          return false;
        } else {
          ite.preIncrement();
        }
      }

      return true;
    }

    /**
     * 指定したモーションの終了の確認
     * @param motionQueueEntryNumber モーションの識別番号
     * @return true 全て終了している
     * @return false 終了していない
     */
    public isFinishedByHandle(
      motionQueueEntryNumber: CubismMotionQueueEntryHandle,
    ): boolean {
      // 既にモーションがあれば終了フラグを立てる
      for (
        let ite: iterator<CubismMotionQueueEntry> = this._motions.begin();
        ite.notEqual(this._motions.end());
        ite.increment()
      ) {
        const motionQueueEntry: CubismMotionQueueEntry = ite.ptr();

        if (motionQueueEntry == null) {
          continue;
        }

        if (
          motionQueueEntry._motionQueueEntryHandle == motionQueueEntryNumber &&
          !motionQueueEntry.isFinished()
        ) {
          return false;
        }
      }
      return true;
    }

    public isFinishedByMotionName(motionName: string) {
      if (motionName) {
        let motionArray = this._motions.get();
        let find = motionArray.find((item) => item._motion._name === motionName);
        if (!find) {
          return true;
        } else {
          if (find.isFinished()) {
            return true;
          }
        }
        return false;
      }
      return true;
    }

    /**
     * 全てのモーションを停止する
     */
    public stopAllMotions(): Promise<void> {
      // ------- 処理を行う -------
      // 既にモーションがあれば終了フラグを立てる

      return new Promise((resolve) => {
        for (
          let ite: iterator<CubismMotionQueueEntry> = this._motions.begin();
          ite.notEqual(this._motions.end());

        ) {
          let motionQueueEntry: CubismMotionQueueEntry = ite.ptr();

          if (motionQueueEntry == null) {
            ite = this._motions.erase(ite);

            continue;
          }

          // ----- 終了済みの処理があれば削除する ------
          motionQueueEntry.release();
          motionQueueEntry = void 0;
          motionQueueEntry = null;
          ite = this._motions.erase(ite); // 削除
        }
        resolve();
      });
    }

    /**
         * 指定したCubismMotionQueueEntryの取得

         * @param   motionQueueEntryNumber  モーションの識別番号
         * @return  指定したCubismMotionQueueEntry
         * @return  null   見つからなかった
         */
    public getCubismMotionQueueEntry(
      motionQueueEntryNumber: any,
    ): CubismMotionQueueEntry {
      // ------- 処理を行う -------
      // 既にモーションがあれば終了フラグを立てる
      for (
        let ite: iterator<CubismMotionQueueEntry> = this._motions.begin();
        ite.notEqual(this._motions.end());
        ite.preIncrement()
      ) {
        const motionQueueEntry: CubismMotionQueueEntry = ite.ptr();

        if (motionQueueEntry == null) {
          continue;
        }

        if (
          motionQueueEntry._motionQueueEntryHandle == motionQueueEntryNumber
        ) {
          return motionQueueEntry;
        }
      }

      return null;
    }

    /**
     * イベントを受け取るCallbackの登録
     *
     * @param callback コールバック関数
     * @param customData コールバックに返されるデータ
     */
    public setEventCallback(
      callback: CubismMotionEventFunction,
      customData: any = null,
    ): void {
      this._eventCallBack = callback;
      this._eventCustomData = customData;
    }

    /**
     * モーションを更新して、モデルにパラメータ値を反映する。
     *
     * @param   model   対象のモデル
     * @param   userTimeSeconds   デルタ時間の積算値[秒]
     * @return  true    モデルへパラメータ値の反映あり
     * @return  false   モデルへパラメータ値の反映なし(モーションの変化なし)
     */
    public doUpdateMotion(
      model: CubismModel,
      userTimeSeconds: number,
    ): boolean {
      let updated = false;

      // ------- 処理を行う --------
      // 既にモーションがあれば終了フラグを立てる

      for (
        let ite: iterator<CubismMotionQueueEntry> = this._motions.begin();
        ite.notEqual(this._motions.end());

      ) {
        let motionQueueEntry: CubismMotionQueueEntry = ite.ptr();

        if (motionQueueEntry == null) {
          ite = this._motions.erase(ite); // 削除
          continue;
        }

        const motion: ACubismMotion = motionQueueEntry._motion;

        if (motion == null) {
          motionQueueEntry.release();
          motionQueueEntry = void 0;
          motionQueueEntry = null;
          ite = this._motions.erase(ite); // 削除

          continue;
        }

        // ------ 値を反映する ------
        motion.updateParameters(model, motionQueueEntry, userTimeSeconds);
        updated = true;

        // ------ ユーザトリガーイベントを検査する ----
        const firedList: csmVector<csmString> = motion.getFiredEvent(
          motionQueueEntry.getLastCheckEventSeconds() -
            motionQueueEntry.getStartTime(),
          userTimeSeconds - motionQueueEntry.getStartTime(),
        );

        for (let i = 0; i < firedList.getSize(); ++i) {
          this._eventCallBack(this, firedList.at(i), this._eventCustomData);
        }

        motionQueueEntry.setLastCheckEventSeconds(userTimeSeconds);

        // ------ 終了済みの処理があれば削除する ------
        if (motionQueueEntry.isFinished()) {
          motionQueueEntry.release();
          motionQueueEntry = void 0;
          motionQueueEntry = null;
          ite = this._motions.erase(ite); // 削除
        } else {
          if (motionQueueEntry.isTriggeredFadeOut()) {
            motionQueueEntry.startFadeOut(
              motionQueueEntry.getFadeOutSeconds(),
              userTimeSeconds,
            );
          }
          ite.preIncrement();
        }
      }

      return updated;
    }
  }

  /**
   * イベントのコールバック関数を定義
   *
   * イベントのコールバックに登録できる関数の型情報
   * @param caller        発火したイベントを再生させたCubismMotionQueueManager
   * @param eventValue    発火したイベントの文字列データ
   * @param customData   コールバックに返される登録時に指定されたデータ
   */
  export type CubismMotionEventFunction = (
      caller: CubismMotionQueueManager,
      eventValue: csmString,
      customData: any,
    ) => void;

  /**
   * モーションの識別番号
   *
   * モーションの識別番号の定義
   */
  export declare type CubismMotionQueueEntryHandle = any;
  export const InvalidMotionQueueEntryHandleValue: CubismMotionQueueEntryHandle = -1;
}
