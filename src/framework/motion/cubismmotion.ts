/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismmotionjson } from './cubismmotionjson';
import { Live2DCubismFramework as cubismmotioninternal } from './cubismmotioninternal';
import { Live2DCubismFramework as acubismmotion } from './acubismmotion';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import { Live2DCubismFramework as cubismmotionqueueentry } from './cubismmotionqueueentry';
import { Live2DCubismFramework as cubismmath } from '../math/cubismmath';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { CubismLogDebug, CSM_ASSERT } from '../utils/cubismdebug';
import csmString = csmstring.csmString;
import CubismMotionData = cubismmotioninternal.CubismMotionData;
import CubismMotionSegment = cubismmotioninternal.CubismMotionSegment;
import CubismMotionPoint = cubismmotioninternal.CubismMotionPoint;
import CubismMotionEvent = cubismmotioninternal.CubismMotionEvent;
import CubismMotionSegmentType = cubismmotioninternal.CubismMotionSegmentType;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismMotionCurve = cubismmotioninternal.CubismMotionCurve;
import CubismMotionCurveTarget = cubismmotioninternal.CubismMotionCurveTarget;
import csmVector = csmvector.csmVector;
import CubismMath = cubismmath.CubismMath;
import CubismMotionQueueEntry = cubismmotionqueueentry.CubismMotionQueueEntry;
import CubismFramework = cubismframework.CubismFramework;
import CubismModel = cubismmodel.CubismModel;
import ACubismMotion = acubismmotion.ACubismMotion;
import CubismMotionJson = cubismmotionjson.CubismMotionJson;

export namespace Live2DCubismFramework {
  const EffectNameEyeBlink: string = 'EyeBlink';
  const EffectNameLipSync: string = 'LipSync';
  const TargetNameModel: string = 'Model';
  const TargetNameParameter: string = 'Parameter';
  const TargetNamePartOpacity: string = 'PartOpacity';

  function lerpPoints(a: CubismMotionPoint, b: CubismMotionPoint, t: number): CubismMotionPoint {
    const result: CubismMotionPoint = new CubismMotionPoint();

    result.time = a.time + ((b.time - a.time) * t);
    result.value = a.value + ((b.value - a.value) * t);

    return result;
  }

  function linearEvaluate(points: CubismMotionPoint[], time: number): number {
    let t: number = (time - points[0].time) / (points[1].time - points[0].time);

    if (t < 0.0) {
      t = 0.0;
    }

    return points[0].value + ((points[1].value - points[0].value) * t);
  }

  function bezierEvaluate(points: CubismMotionPoint[], time: number): number {
    let t: number = (time - points[0].time) / (points[3].time - points[0].time);

    if (t < 0.0) {
      t = 0.0;
    }

    const p01: CubismMotionPoint = lerpPoints(points[0], points[1], t);
    const p12: CubismMotionPoint = lerpPoints(points[1], points[2], t);
    const p23: CubismMotionPoint = lerpPoints(points[2], points[3], t);

    const p012: CubismMotionPoint = lerpPoints(p01, p12, t);
    const p123: CubismMotionPoint = lerpPoints(p12, p23, t);

    return lerpPoints(p012, p123, t).value;
  }

  function steppedEvaluate(points: CubismMotionPoint[], time: number): number {
    return points[0].value;
  }

  function inverseSteppedEvaluate(points: CubismMotionPoint[], time: number): number {
    return points[1].value;
  }

  function evaluateCurve(motionData: CubismMotionData, index: number, time: number): number {
    // Find segment to evaluate.
    const curve: CubismMotionCurve = motionData.curves.at(index);

    let target: number = -1;
    const totalSegmentCount: number = curve.baseSegmentIndex + curve.segmentCount;
    let pointPosition: number = 0;
    for (let i: number = curve.baseSegmentIndex; i < totalSegmentCount; ++i) {
      // Get first point of next segment.
      pointPosition = motionData.segments.at(i).basePointIndex
        + (motionData.segments.at(i).segmentType == CubismMotionSegmentType.CubismMotionSegmentType_Bezier
          ? 3
          : 1);


      // Break if time lies within current segment.
      if (motionData.points.at(pointPosition).time > time) {
        target = i;
        break;
      }
    }


    if (target == -1) {
      return motionData.points.at(pointPosition).value;
    }


    const segment: CubismMotionSegment = motionData.segments.at(target);

    return segment.evaluate(motionData.points.get(segment.basePointIndex), time);
  }

  /**
   * 运动类
   *
   * 运动类。
   */
  export class CubismMotion extends ACubismMotion {
    /**
     * 创建一个实例
     *
     * @param buffer 缓冲区，其中加载了motion3.json
     * @param size 缓冲区大小
     * @return 创建的实例
     */
    public static create(buffer: ArrayBuffer, size: number, name: string, priority: number): CubismMotion {
      const ret: CubismMotion = new CubismMotion();

      ret.parse(buffer, size);
      ret._sourceFrameRate = ret._motionData.fps;
      ret._loopDurationSeconds = ret._motionData.duration;
      ret._name = name;
      ret._weight = priority;

      // NOTE: 在编辑器中，不支持带循环的运动导出
      // ret->_loop = (ret->_motionData->Loop > 0);
      return ret;
    }

    public _sourceFrameRate: number;           // 已加载文件的FPS。 如果没有描述，则默认值为15 fps
    public _loopDurationSeconds: number;       // mtn文件中定义的一系列运动的长度
    public _isLoop: boolean;                   // 你想循环吗？
    public _isLoopFadeIn: boolean;             // 循环时是否启用淡入的标志。 默认有效。
    public _lastWeight: number;                // 最后设定的权重

    public _motionData: CubismMotionData;                        // 实际运动数据

    public _eyeBlinkParameterIds: csmVector<CubismIdHandle>;  // 应用自动闪烁的参数ID句柄列表。 将模型（模型设置）与参数相关联。
    public _lipSyncParameterIds: csmVector<CubismIdHandle>;   // 用于应用唇形同步的参数ID句柄列表。 将模型（模型设置）与参数相关联。

    public _modelCurveIdEyeBlink: CubismIdHandle;    // 处理模型自动闪烁的参数ID。 将模型与动作相关联。
    public _modelCurveIdLipSync: CubismIdHandle;     // 处理模型的唇形同步参数ID。 将模型与动作相关联。

    /**
     * 构造函数
     */
    public constructor() {
      super();
      this._sourceFrameRate = 30.0;
      this._loopDurationSeconds = -1.0;
      this._isLoop = false;           // 将默认值从true更改为false
      this._isLoopFadeIn = true;      // 循环时是否启用淡入的标志
      this._lastWeight = 0.0;
      this._motionData = null as any;
      this._modelCurveIdEyeBlink = null as any;
      this._modelCurveIdLipSync = null as any;
      this._eyeBlinkParameterIds = null as any;
      this._lipSyncParameterIds = null as any;
    }

    /**
     * 执行模型参数更新
     * @param model             目标模型
     * @param userTimeSeconds   当前时间[秒]
     * @param fadeWeight        运动权重
     * @param motionQueueEntry  由CubismMotionQueueManager管理的动作
     */
    public doUpdateParameters(model: CubismModel, userTimeSeconds: number, fadeWeight: number, motionQueueEntry: CubismMotionQueueEntry): void {
      if (this._modelCurveIdEyeBlink == null) {
        this._modelCurveIdEyeBlink = CubismFramework.getIdManager().getId(EffectNameEyeBlink);
      }

      if (this._modelCurveIdLipSync == null) {
        this._modelCurveIdLipSync = CubismFramework.getIdManager().getId(EffectNameLipSync);
      }

      let timeOffsetSeconds: number = userTimeSeconds - motionQueueEntry.getStartTime();

      if (timeOffsetSeconds < 0.0) {
        timeOffsetSeconds = 0.0; // エラー回避
      }

      let lipSyncValue: number = Number.MAX_VALUE;
      let eyeBlinkValue: number = Number.MAX_VALUE;

      // 用于检测闪烁和唇形同步之间的运动应用的位（最多为maxFlagCount）
      const MaxTargetSize = 64;
      let lipSyncFlags = 0;
      let eyeBlinkFlags = 0;

      // 如果闪烁和唇形同步目标的数量超过上限
      if (this._eyeBlinkParameterIds.getSize() > MaxTargetSize) {
        CubismLogDebug('too many eye blink targets : {0}', this._eyeBlinkParameterIds.getSize());
      }
      if (this._lipSyncParameterIds.getSize() > MaxTargetSize) {
        CubismLogDebug('too many lip sync targets : {0}', this._lipSyncParameterIds.getSize());
      }

      const tmpFadeIn: number = (this._fadeInSeconds <= 0.0)
        ? 1.0
        : CubismMath.getEasingSine((userTimeSeconds - motionQueueEntry.getFadeInStartTime()) / this._fadeInSeconds);

      const tmpFadeOut: number = (this._fadeOutSeconds <= 0.0 || motionQueueEntry.getEndTime() < 0.0)
        ? 1.0
        : CubismMath.getEasingSine((motionQueueEntry.getEndTime() - userTimeSeconds) / this._fadeOutSeconds);
      let value: number;
      let c: number, parameterIndex: number;

      // 必要时'重复'时间。
      let time: number = timeOffsetSeconds;

      if (this._isLoop) {
        while (time > this._motionData.duration) {
          time -= this._motionData.duration;
        }
      }

      const curves: csmVector<CubismMotionCurve> = this._motionData.curves;

      // 评估模型曲线。
      for (c = 0; c < this._motionData.curveCount && curves.at(c).type == CubismMotionCurveTarget.CubismMotionCurveTarget_Model; ++c) {
        // 评估曲线和调用处理程序。
        value = evaluateCurve(this._motionData, c, time);

        if (curves.at(c).id == this._modelCurveIdEyeBlink) {
          eyeBlinkValue = value;
        } else if (curves.at(c).id == this._modelCurveIdLipSync) {
          lipSyncValue = value;
        }
      }

      let parameterMotionCurveCount: number = 0;

      for (; c < this._motionData.curveCount && curves.at(c).type == CubismMotionCurveTarget.CubismMotionCurveTarget_Parameter; ++c) {
        parameterMotionCurveCount++;

        // 查找参数索引。
        parameterIndex = model.getParameterIndex(curves.at(c).id);

        // 如果没有沉没值，则跳过曲线评估。
        if (parameterIndex == -1) {
          continue;
        }

        const sourceValue: number = model.getParameterValueByIndex(parameterIndex);

        // 评估曲线并应用价值。
        value = evaluateCurve(this._motionData, c, time);

        if (eyeBlinkValue != Number.MAX_VALUE) {
          for (let i: number = 0; i < this._eyeBlinkParameterIds.getSize() && i < MaxTargetSize; ++i) {
            if (this._eyeBlinkParameterIds.at(i) == curves.at(c).id) {
              value *= eyeBlinkValue;
              eyeBlinkFlags |= 1 << i;
              break;
            }
          }
        }

        if (lipSyncValue != Number.MAX_VALUE) {
          for (let i: number = 0; i < this._lipSyncParameterIds.getSize() && i < MaxTargetSize; ++i) {
            if (this._lipSyncParameterIds.at(i) == curves.at(c).id) {
              value += lipSyncValue;
              lipSyncFlags |= 1 << i;
              break;
            }
          }
        }

        let v: number;

        // 每个参数淡入淡出
        if (curves.at(c).fadeInTime < 0.0 && curves.at(c).fadeOutTime < 0.0) {
          // 应用运动淡入淡出
          v = sourceValue + (value - sourceValue) * fadeWeight;
        } else {
          // 如果为参数设置了淡入或淡出，请应用它
          let fin: number;
          let fout: number;

          if (curves.at(c).fadeInTime < 0.0) {
            fin = tmpFadeIn;
          } else {
            fin = curves.at(c).fadeInTime == 0.0
              ? 1.0
              : CubismMath.getEasingSine((userTimeSeconds - motionQueueEntry.getFadeInStartTime()) / curves.at(c).fadeInTime);
          }

          if (curves.at(c).fadeOutTime < 0.0) {
            fout = tmpFadeOut;
          } else {
            fout = (curves.at(c).fadeOutTime == 0.0 || motionQueueEntry.getEndTime() < 0.0)
              ? 1.0
              : CubismMath.getEasingSine((motionQueueEntry.getEndTime() - userTimeSeconds) / curves.at(c).fadeOutTime);
          }

          const paramWeight: number = this._weight * fin * fout;

          // 每个参数应用淡入淡出
          v = sourceValue + (value - sourceValue) * paramWeight;
        }

        model.setParameterValueByIndex(parameterIndex, v, 1.0);
      }

      {
        if (eyeBlinkValue != Number.MAX_VALUE) {
          for (let i: number = 0; i < this._eyeBlinkParameterIds.getSize() && i < MaxTargetSize; ++i) {
            const sourceValue: number = model.getParameterValueById(this._eyeBlinkParameterIds.at(i));

            // 用动作覆盖时不闪烁
            if ((eyeBlinkFlags >> i) & 0x01) {
              continue;
            }

            const v: number = sourceValue + (eyeBlinkValue - sourceValue) * fadeWeight;

            model.setParameterValueById(this._eyeBlinkParameterIds.at(i), v);
          }
        }

        if (lipSyncValue != Number.MAX_VALUE) {
          for (let i: number = 0; i < this._lipSyncParameterIds.getSize() && i < MaxTargetSize; ++i) {
            const sourceValue: number = model.getParameterValueById(this._lipSyncParameterIds.at(i));

            // 移动被覆盖时，唇形同步不适用
            if ((lipSyncFlags >> i) & 0x01) {
              continue;
            }

            const v: number = sourceValue + (lipSyncValue - sourceValue) * fadeWeight;

            model.setParameterValueById(this._lipSyncParameterIds.at(i), v);
          }
        }
      }

      for (; c < this._motionData.curveCount && curves.at(c).type == CubismMotionCurveTarget.CubismMotionCurveTarget_PartOpacity; ++c) {
        // 查找参数索引。
        parameterIndex = model.getParameterIndex(curves.at(c).id);

        // 如果没有沉没值，则跳过曲线评估。
        if (parameterIndex == -1) {
          continue;
        }

        // 评估曲线并应用价值。
        value = evaluateCurve(this._motionData, c, time);

        model.setParameterValueByIndex(parameterIndex, value);
      }

      if (timeOffsetSeconds >= this._motionData.duration) {
        if (this._isLoop) {
          motionQueueEntry.setStartTime(userTimeSeconds); // 到了第一个州
          if (this._isLoopFadeIn) {
            // 如果循环中启用了循环淡入，请重置淡入设置。
            motionQueueEntry.setFadeInStartTime(userTimeSeconds);
          }
        } else {
          motionQueueEntry.setIsFinished(true);
        }
      }
      this._lastWeight = fadeWeight;
    }

    /**
     * 设置循环信息
     * @param loop 循环信息
     */
    public setIsLoop(loop: boolean): void {
      this._isLoop = loop;
    }

    /**
     * 获取循环信息
     * @return true 要循环
     * @return false 不要循环
     */
    public isLoop(): boolean {
      return this._isLoop;
    }

    /**
     * 循环时设置淡入信息
     * @param loopFadeIn  循环时淡入信息
     */
    public setIsLoopFadeIn(loopFadeIn: boolean): void {
      this._isLoopFadeIn = loopFadeIn;
    }

    /**
     * 循环时获取淡入信息
     *
     * @return  true
     * @return  false
     */
    public isLoopFadeIn(): boolean {
      return this._isLoopFadeIn;
    }

    /**
     * 得到动作的长度。
     *
     * @return  动作长度[秒]
     */
    public getDuration(): number {
      return this._isLoop ? -1.0 : this._loopDurationSeconds;
    }

    /**
     * 获取运动循环的长度。
     *
     * @return  运动循环长度[秒]
     */
    public getLoopDuration(): number {
      return this._loopDurationSeconds;
    }

    /**
     * 设置参数的淡入时间。
     *
     * @param parameterId     参数ID
     * @param value           淡入时间[秒]
     */
    public setParameterFadeInTime(parameterId: CubismIdHandle, value: number): void {
      const curves: csmVector<CubismMotionCurve> = this._motionData.curves;

      for (let i: number = 0; i < this._motionData.curveCount; ++i) {
        if (parameterId == curves.at(i).id) {
          curves.at(i).fadeInTime = value;
          return;
        }
      }
    }

    /**
    * 设置参数的淡出时间
    * @param parameterId     参数ID
    * @param value           时间淡出[秒]
    */
    public setParameterFadeOutTime(parameterId: CubismIdHandle, value: number): void {
      const curves: csmVector<CubismMotionCurve> = this._motionData.curves;

      for (let i: number = 0; i < this._motionData.curveCount; ++i) {
        if (parameterId == curves.at(i).id) {
          curves.at(i).fadeOutTime = value;
          return;
        }
      }
    }

    /**
    * 获取参数的淡入时间
    * @param    parameterId     参数ID
    * @return   淡入时间[秒]
    */
    public getParameterFadeInTime(parameterId: CubismIdHandle): number {
      const curves: csmVector<CubismMotionCurve> = this._motionData.curves;

      for (let i: number = 0; i < this._motionData.curveCount; ++i) {
        if (parameterId == curves.at(i).id) {
          return curves.at(i).fadeInTime;
        }
      }

      return -1;
    }

    /**
    * 获取参数的淡出时间
    *
    * @param   parameterId     参数ID
    * @return   时间淡出[秒]
    */
    public getParameterFadeOutTime(parameterId: CubismIdHandle): number {
      const curves: csmVector<CubismMotionCurve> = this._motionData.curves;

      for (let i: number = 0; i < this._motionData.curveCount; ++i) {
        if (parameterId == curves.at(i).id) {
          return curves.at(i).fadeOutTime;
        }
      }

      return -1;
    }

    /**
     * 设置应用自动效果的参数ID列表
     * @param eyeBlinkParameterIds    自动闪烁的参数ID列表
     * @param lipSyncParameterIds     应用唇形同步的参数ID列表
     */
    public setEffectIds(eyeBlinkParameterIds: csmVector<CubismIdHandle>, lipSyncParameterIds: csmVector<CubismIdHandle>): void {
      this._eyeBlinkParameterIds = eyeBlinkParameterIds;
      this._lipSyncParameterIds = lipSyncParameterIds;
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      this._motionData = void 0 as any;
      this._motionData = null as any;
    }

    /**
     * 解析motion3.json。
     *
     * @param motionJson  缓冲区，其中加载了motion3.json
     * @param size        缓冲区大小
     */
    public parse(motionJson: ArrayBuffer, size: number): void {
      this._motionData = new CubismMotionData();

      let json: CubismMotionJson = new CubismMotionJson(motionJson, size);

      this._motionData.duration = json.getMotionDuration();
      this._motionData.loop = json.isMotionLoop();
      this._motionData.curveCount = json.getMotionCurveCount();
      this._motionData.fps = json.getMotionFps();
      this._motionData.eventCount = json.getEventCount();

      if (json.isExistMotionFadeInTime()) {
        this._fadeInSeconds = (json.getMotionFadeInTime() < 0.0)
          ? 1.0
          : json.getMotionFadeInTime();
      } else {
        this._fadeInSeconds = 1.0;
      }

      if (json.isExistMotionFadeOutTime()) {
        this._fadeOutSeconds = (json.getMotionFadeOutTime() < 0.0)
          ? 1.0
          : json.getMotionFadeOutTime();
      } else {
        this._fadeOutSeconds = 1.0;
      }

      this._motionData.curves.updateSize(this._motionData.curveCount, CubismMotionCurve, true);
      this._motionData.segments.updateSize(json.getMotionTotalSegmentCount(), CubismMotionSegment, true);
      this._motionData.points.updateSize(json.getMotionTotalPointCount(), CubismMotionPoint, true);
      this._motionData.events.updateSize(this._motionData.eventCount, CubismMotionEvent, true);

      let totalPointCount: number = 0;
      let totalSegmentCount: number = 0;

      // Curves
      for (let curveCount: number = 0; curveCount < this._motionData.curveCount; ++curveCount) {
        if (json.getMotionCurveTarget(curveCount) == TargetNameModel) {
          this._motionData.curves.at(curveCount).type = CubismMotionCurveTarget.CubismMotionCurveTarget_Model;
        } else if (json.getMotionCurveTarget(curveCount) == TargetNameParameter) {
          this._motionData.curves.at(curveCount).type = CubismMotionCurveTarget.CubismMotionCurveTarget_Parameter;
        } else if (json.getMotionCurveTarget(curveCount) == TargetNamePartOpacity) {
          this._motionData.curves.at(curveCount).type = CubismMotionCurveTarget.CubismMotionCurveTarget_PartOpacity;
        }

        this._motionData.curves.at(curveCount).id = json.getMotionCurveId(curveCount);

        this._motionData.curves.at(curveCount).baseSegmentIndex = totalSegmentCount;

        this._motionData.curves.at(curveCount).fadeInTime =
          (json.isExistMotionCurveFadeInTime(curveCount))
            ? json.getMotionCurveFadeInTime(curveCount)
            : -1.0;
        this._motionData.curves.at(curveCount).fadeOutTime =
          (json.isExistMotionCurveFadeOutTime(curveCount))
            ? json.getMotionCurveFadeOutTime(curveCount)
            : -1.0;

        // Segments
        for (let segmentPosition: number = 0; segmentPosition < json.getMotionCurveSegmentCount(curveCount);) {
          if (segmentPosition == 0) {
            this._motionData.segments.at(totalSegmentCount).basePointIndex = totalPointCount;

            this._motionData.points.at(totalPointCount).time = json.getMotionCurveSegment(curveCount, segmentPosition);
            this._motionData.points.at(totalPointCount).value = json.getMotionCurveSegment(curveCount, segmentPosition + 1);

            totalPointCount += 1;
            segmentPosition += 2;
          } else {
            this._motionData.segments.at(totalSegmentCount).basePointIndex = totalPointCount - 1;
          }

          const segment: number = json.getMotionCurveSegment(curveCount, segmentPosition);
          switch (segment) {
            case CubismMotionSegmentType.CubismMotionSegmentType_Linear: {
              this._motionData.segments.at(totalSegmentCount).segmentType = CubismMotionSegmentType.CubismMotionSegmentType_Linear;
              this._motionData.segments.at(totalSegmentCount).evaluate = linearEvaluate;

              this._motionData.points.at(totalPointCount).time = json.getMotionCurveSegment(curveCount, (segmentPosition + 1));
              this._motionData.points.at(totalPointCount).value = json.getMotionCurveSegment(curveCount, (segmentPosition + 2));

              totalPointCount += 1;
              segmentPosition += 3;

              break;
            }
            case CubismMotionSegmentType.CubismMotionSegmentType_Bezier: {
              this._motionData.segments.at(totalSegmentCount).segmentType = CubismMotionSegmentType.CubismMotionSegmentType_Bezier;
              this._motionData.segments.at(totalSegmentCount).evaluate = bezierEvaluate;

              this._motionData.points.at(totalPointCount).time = json.getMotionCurveSegment(curveCount, (segmentPosition + 1));
              this._motionData.points.at(totalPointCount).value = json.getMotionCurveSegment(curveCount, (segmentPosition + 2));

              this._motionData.points.at(totalPointCount + 1).time = json.getMotionCurveSegment(curveCount, (segmentPosition + 3));
              this._motionData.points.at(totalPointCount + 1).value = json.getMotionCurveSegment(curveCount, (segmentPosition + 4));

              this._motionData.points.at(totalPointCount + 2).time = json.getMotionCurveSegment(curveCount, (segmentPosition + 5));
              this._motionData.points.at(totalPointCount + 2).value = json.getMotionCurveSegment(curveCount, (segmentPosition + 6));

              totalPointCount += 3;
              segmentPosition += 7;

              break;
            }

            case CubismMotionSegmentType.CubismMotionSegmentType_Stepped: {
              this._motionData.segments.at(totalSegmentCount).segmentType = CubismMotionSegmentType.CubismMotionSegmentType_Stepped;
              this._motionData.segments.at(totalSegmentCount).evaluate = steppedEvaluate;

              this._motionData.points.at(totalPointCount).time = json.getMotionCurveSegment(curveCount, (segmentPosition + 1));
              this._motionData.points.at(totalPointCount).value = json.getMotionCurveSegment(curveCount, (segmentPosition + 2));

              totalPointCount += 1;
              segmentPosition += 3;

              break;
            }

            case CubismMotionSegmentType.CubismMotionSegmentType_InverseStepped: {
              this._motionData.segments.at(totalSegmentCount).segmentType = CubismMotionSegmentType.CubismMotionSegmentType_InverseStepped;
              this._motionData.segments.at(totalSegmentCount).evaluate = inverseSteppedEvaluate;

              this._motionData.points.at(totalPointCount).time = json.getMotionCurveSegment(curveCount, (segmentPosition + 1));
              this._motionData.points.at(totalPointCount).value = json.getMotionCurveSegment(curveCount, (segmentPosition + 2));

              totalPointCount += 1;
              segmentPosition += 3;

              break;
            }
            default:
              {
                CSM_ASSERT(0);
                break;
              }
          }

          ++this._motionData.curves.at(curveCount).segmentCount;
          ++totalSegmentCount;
        }
      }

      for (let userdatacount: number = 0; userdatacount < json.getEventCount(); ++userdatacount) {
        this._motionData.events.at(userdatacount).fireTime = json.getEventTime(userdatacount);
        this._motionData.events.at(userdatacount).value = json.getEventValue(userdatacount);
      }

      json.release();
      json = void 0 as any;
      json = null as any;
    }

    /**
     * 更新模型参数
     *
     * 检查事件发生。
     * 输入时间是被叫运动时间为0的秒数。
     *
     * @param beforeCheckTimeSeconds   最后一次事件检查时间[秒]
     * @param motionTimeSeconds        当前播放时间[秒]
     */
    public getFiredEvent(beforeCheckTimeSeconds: number, motionTimeSeconds: number): csmVector<csmString> {
      this._firedEventValues.updateSize(0);

      // 事件解雇检查
      for (let u: number = 0; u < this._motionData.eventCount; ++u) {
        if ((this._motionData.events.at(u).fireTime > beforeCheckTimeSeconds) &&
          (this._motionData.events.at(u).fireTime <= motionTimeSeconds)) {
          this._firedEventValues.pushBack(new csmString(this._motionData.events.at(u).value.s));
        }
      }

      return this._firedEventValues;
    }
  }
}
