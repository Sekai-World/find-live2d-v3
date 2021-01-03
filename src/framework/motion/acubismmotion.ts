/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismmath } from '../math/cubismmath';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubismmotionqueueentry } from './cubismmotionqueueentry';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { CSM_ASSERT } from '../utils/cubismdebug';
import csmVector = csmvector.csmVector;
import csmString = csmstring.csmString;
import CubismMotionQueueEntry = cubismmotionqueueentry.CubismMotionQueueEntry;
import CubismModel = cubismmodel.CubismModel;
import CubismMath = cubismmath.CubismMath;

export namespace Live2DCubismFramework {
  /**
   * 运动的抽象基类
   *
   * 运动的抽象基类。 使用MotionQueueManager管理动画播放。
   */
  export abstract class ACubismMotion {
    /**
     * 销毁实例
     */
    public static delete(motion: ACubismMotion): void {
      motion.release();
      motion = void 0 as any;
      motion = null as any;
    }


    public _fadeInSeconds: number; // 淡入时间[秒]
    public _fadeOutSeconds: number; // 淡出时间[秒]
    public _weight: number; // 应用运动的权重
    public _offsetSeconds: number; // 动作播放开始时间[秒]
    public _name: string;
    public _firedEventValues: csmVector<csmString>;

    /**
     * 构造函数
     */
    public constructor() {
      this._fadeInSeconds = -1.0;
      this._fadeOutSeconds = -1.0;
      this._weight = 1.0;
      this._offsetSeconds = 0.0;  // 播放开始时间
      this._firedEventValues = new csmVector<csmString>();
      this._name = '';
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      this._weight = 0.0;
    }

    /**
     * 模型参数
     * @param model 目标模型
     * @param motionQueueEntry 由CubismMotionQueueManager管理的动作
     * @param userTimeSeconds 增量时间的综合值[秒]
     */
    public updateParameters(model: CubismModel, motionQueueEntry: CubismMotionQueueEntry, userTimeSeconds: number): void {
      if (!motionQueueEntry.isAvailable() || motionQueueEntry.isFinished()) {
        return;
      }

      if (!motionQueueEntry.isStarted()) {
        motionQueueEntry.setIsStarted(true);
        motionQueueEntry.setStartTime(userTimeSeconds - this._offsetSeconds); // 记录动作的开始时间
        motionQueueEntry.setFadeInStartTime(userTimeSeconds); // 淡入开始时间

        const duration: number = this.getDuration();

        if (motionQueueEntry.getEndTime() < 0) {
          // 它可以设置为在开始之前结束。
          motionQueueEntry.setEndTime((duration <= 0) ? -1 : motionQueueEntry.getStartTime() + duration);
          // duration == -1 则循环
        }
      }

      let fadeWeight: number = 1; // 应用运动的权重

      // ---- 淡入/淡出处理 ----
      // 具有简单的正弦功能
      const fadeIn: number = this._fadeInSeconds == 0.0
        ? 1.0
        : CubismMath.getEasingSine((userTimeSeconds - motionQueueEntry.getFadeInStartTime()) / this._fadeInSeconds);

      const fadeOut: number = (this._fadeOutSeconds == 0.0 || motionQueueEntry.getEndTime() < 0.0)
        ? 1.0
        : CubismMath.getEasingSine((motionQueueEntry.getEndTime() - userTimeSeconds) / this._fadeOutSeconds);

      fadeWeight = fadeWeight * fadeIn * fadeOut;
      motionQueueEntry.setState(userTimeSeconds, fadeWeight);
      CSM_ASSERT(0.0 <= fadeWeight && fadeWeight <= 1.0);

      // ---- 遍历所有参数ID ----
      this.doUpdateParameters(model, userTimeSeconds, fadeWeight, motionQueueEntry);

      // 后处理
      // 结束时间后设置结束标志(CubismMotionQueueManager)
      if ((motionQueueEntry.getEndTime() > 0) && (motionQueueEntry.getEndTime() < userTimeSeconds)) {
        motionQueueEntry.setIsFinished(true); // 終了
      }
    }

    /**
     * 设置淡入时间
     * @param fadeInSeconds 淡入时间[秒]
     */
    public setFadeInTime(fadeInSeconds: number): void {
      this._fadeInSeconds = fadeInSeconds;
    }

    /**
     * 设置淡出时间
     * @param fadeOutSeconds 时间淡出[秒]
     */
    public setFadeOutTime(fadeOutSeconds: number): void {
      this._fadeOutSeconds = fadeOutSeconds;
    }

    /**
     * 取淡出时间
     * @return 时间淡出[秒]
     */
    public getFadeOutTime(): number {
      return this._fadeOutSeconds;
    }

    /**
     * 取淡入时间
     * @return 淡入时间[秒]
     */
    public getFadeInTime(): number {
      return this._fadeInSeconds;
    }

    /**
     * 设置应用运动的权重
     * @param weight 权重（0.0 - 1.0）
     */
    public setWeight(weight: number): void {
      this._weight = weight;
    }

    /**
     * 获得运动应用的权重
     * @return 权重（0.0 - 1.0）
     */
    public getWeight(): number {
      return this._weight;
    }

    /**
     * 获得运动的长度
     * @return 动作长度[秒]
     *
     * @note 循环时为-1。
     *       如果它不是循环，则覆盖它
     *       如果该值为正，则在获得的时间结束。
     *       当“-1”时，除非有来自外部的停止命令，否则该过程不会结束。
     */
    public getDuration(): number {
      return -1.0;
    }

    /**
     * 获取一个运动循环的长度
     * @return 运动循环长度[秒]
     *
     * @note 如果不循环，则返回与getDuration（）相同的值
     *       如果无法定义一个循环的长度（例如以编程方式继续移动的子类），则返回-1。
     */
    public getLoopDuration(): number {
      return -1.0;
    }

    /**
     * 设置动作播放的开始时间
     * @param offsetSeconds 动作播放开始时间[秒]
     */
    public setOffsetTime(offsetSeconds: number): void {
      this._offsetSeconds = offsetSeconds;
    }

    /**
     * 更新模型参数
     *
     * 检查事件发生
     * 输入时间是被叫运动时间为0的秒数
     *
     * @param beforeCheckTimeSeconds 最后一次事件检查时间[秒]
     * @param motionTimeSeconds 当前播放时间[秒]
     */
    public getFiredEvent(beforeCheckTimeSeconds: number, motionTimeSeconds: number): csmVector<csmString> {
      return this._firedEventValues;
    }

    /**
     * 更新运动以反映模型中的参数值
     * @param model 目标模型
     * @param userTimeSeconds 增量时间的综合值[秒]
     * @param weight 运动权重
     * @param motionQueueEntry 由CubismMotionQueueManager管理的动作
     * @return true参数值反映在模型中
     * @return false模型中没有反映参数值（运动无变化）
     */
    public abstract doUpdateParameters(model: CubismModel, userTimeSeconds: number, weight: number, motionQueueEntry: CubismMotionQueueEntry): void;
  }
}
