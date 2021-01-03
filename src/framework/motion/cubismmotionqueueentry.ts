/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as acubismmotion } from './acubismmotion';
import { Live2DCubismFramework as cubismmotionqueuemanager } from './cubismmotionqueuemanager';
import CubismMotionQueueEntryHandle = cubismmotionqueuemanager.CubismMotionQueueEntryHandle;
import ACubismMotion = acubismmotion.ACubismMotion;

export namespace Live2DCubismFramework {
  /**
   * CubismMotionQueueManager中每个动作的管理类。
   */
  export class CubismMotionQueueEntry {

    public _autoDelete: boolean;               // 自动删除
    public _motion: ACubismMotion;             // 运动

    public _available: boolean;                // 激活标志
    public _finished: boolean;                 // 结束标志
    public _started: boolean;                  // 开始标志
    public _startTimeSeconds: number;          // 动作播放开始时间[秒]
    public _fadeInStartTimeSeconds: number;    // 淡入开始时间（仅在第一次循环时）[秒]
    public _endTimeSeconds: number;            // 预定结束时间[秒]
    public _stateTimeSeconds: number;          // 时间状态[秒]
    public _stateWeight: number;　             // 权重状态
    public _lastEventCheckSeconds: number;     // 检查最后一个Motion侧的时间

    public _motionQueueEntryHandle: CubismMotionQueueEntryHandle; // 每个实例具有唯一值的标识号
    /**
     * 构造函数
     */
    public constructor() {
      this._autoDelete = false;
      this._motion = null as any;
      this._available = true;
      this._finished = false;
      this._started = false;
      this._startTimeSeconds = -1.0;
      this._fadeInStartTimeSeconds = 0.0;
      this._endTimeSeconds = -1.0;
      this._stateTimeSeconds = 0.0;
      this._stateWeight = 0.0;
      this._lastEventCheckSeconds = 0.0;
      this._motionQueueEntryHandle = this;
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      if (this._autoDelete && this._motion) {
        ACubismMotion.delete(this._motion); //
      }
    }

    /**
     * 开始淡出
     * @param fadeOutSeconds 时间淡出[秒]
     * @param userTimeSeconds 增量时间的综合值[秒]
     */
    public startFadeout(fadeoutSeconds: number, userTimeSeconds: number): void {
      const newEndTimeSeconds: number = userTimeSeconds + fadeoutSeconds;

      if (this._endTimeSeconds < 0.0 || newEndTimeSeconds < this._endTimeSeconds) {
        this._endTimeSeconds = newEndTimeSeconds;
      }
    }

    /**
     * 确认动作结束
     *
     * @return true 已经结束
     * @return false 没完
     */
    public isFinished(): boolean {
      return this._finished;
    }

    /**
     * 确认动作开始
     * @return true 动作开始了
     * @return false 没有开始
     */
    public isStarted(): boolean {
      return this._started;
    }

    /**
     * 获取动作开始时间
     * @return 动作开始时间[秒]
     */
    public getStartTime(): number {
      return this._startTimeSeconds;
    }

    /**
     * 获得淡入开始时间
     * @return 淡入开始时间[秒]
     */
    public getFadeInStartTime(): number {
      return this._fadeInStartTimeSeconds;
    }

    /**
     * 获得淡入结束时间
     * @return 获得淡入结束时间
     */
    public getEndTime(): number {
      return this._endTimeSeconds;
    }

    /**
     * 设置动作开始时间
     * @param startTime 动作开始时间
     */
    public setStartTime(startTime: number): void {
      this._startTimeSeconds = startTime;
    }

    /**
     * 设置淡入开始时间
     * @param startTime 淡入开始时间[秒]
     */
    public setFadeInStartTime(startTime: number): void {
      this._fadeInStartTimeSeconds = startTime;
    }

    /**
     * 设置淡入结束时间
     * @param endTime 淡入结束时间[秒]
     */
    public setEndTime(endTime: number): void {
      this._endTimeSeconds = endTime;
    }

    /**
     * 设置动作结束
     * @param f true 是动议的结束
     */
    public setIsFinished(f: boolean): void {
      this._finished = f;
    }

    /**
     * 动作开始设定
     * @param f 如果为true，则启动动作
     */
    public setIsStarted(f: boolean): void {
      this._started = f;
    }

    /**
     * 检查运动的有效性
     * @return true 动作是有效的
     * @return false 动作已禁用
     */
    public isAvailable(): boolean {
      return this._available;
    }

    /**
     * 设定运动有效性
     * @param v true 有效
     */
    public setIsAvailable(v: boolean): void {
      this._available = v;
    }

    /**
     * 设置动作状态
     * @param timeSeconds 当前时间[秒]
     * @param weight 动作权重
     */
    public setState(timeSeconds: number, weight: number): void {
      this._stateTimeSeconds = timeSeconds;
      this._stateWeight = weight;
    }

    /**
     * 获取当前的动作时间
     * @return 当前动作时间[秒]
     */
    public getStateTime(): number {
      return this._stateTimeSeconds;
    }

    /**
     * 获取运动权重
     * @return 运动权重
     */
    public getStateWeight(): number {
      return this._stateWeight;
    }

    /**
     * 获取上次检查事件的时间
     *
     * @return 上次检查事件的时间[秒]
     */
    public getLastCheckEventTime(): number {
      return this._lastEventCheckSeconds;
    }

    /**
     * 设置上次检查事件的时间
     * @param checkTime 上次检查事件时间[秒]
     */
    public setLastCheckEventTime(checkTime: number): void {
      this._lastEventCheckSeconds = checkTime;
    }
  }
}
