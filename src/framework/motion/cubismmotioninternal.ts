/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import csmVector = csmvector.csmVector;
import csmString = csmstring.csmString;
import CubismIdHandle = cubismid.CubismIdHandle;

export namespace Live2DCubismFramework {
  /**
   * @brief 运动曲线类型
   *
* 运动曲线类型。
   */
  export enum CubismMotionCurveTarget {
    CubismMotionCurveTarget_Model,          // 对于模型
    CubismMotionCurveTarget_Parameter,      // 对于参数
    CubismMotionCurveTarget_PartOpacity,     // 防止零件的不透明度
  }


  /**
   * @brief 运动曲线段类型
   *
   * 运动曲线段类型。
   */
  export enum CubismMotionSegmentType {
    CubismMotionSegmentType_Linear = 0,         // 线性
    CubismMotionSegmentType_Bezier = 1,         // 贝齐尔曲线
    CubismMotionSegmentType_Stepped = 2,        // 步
    CubismMotionSegmentType_InverseStepped = 3,  // 反向步骤
  }

  /**
   * @brief 运动曲线控制点
   *
   * 运动曲线控制点。
   */
  export class CubismMotionPoint {
    public time: number = 0.0;         // 時間[秒]
    public value: number = 0.0;        // 値
  }


  /**
   * 运动曲线段评估功能
   *
   * @param   points      运动曲线控制点列表
   * @param   time        评估时间[秒]
   */
  export type csmMotionSegmentEvaluationFunction = (
    points: CubismMotionPoint[],
    time: number,
  ) => number;

  /**
   * @brief 运动曲线段
   *
   * 运动曲线段
   */
  export class CubismMotionSegment {

    public evaluate: csmMotionSegmentEvaluationFunction;   // 评估功能使用
    public basePointIndex: number;     // 第一段的索引
    public segmentType: number;    // 细分类型
    /**
     * @brief 构造函数
     *
     * 构造函数。
     */
    public constructor() {
      this.evaluate = null as any;
      this.basePointIndex = 0;
      this.segmentType = 0;
    }
  }

  /**
   * @brief 运动曲线
   *
   * 运动曲线。
   */
  export class CubismMotionCurve {

    public type: CubismMotionCurveTarget;               // 曲线类型
    public id: CubismIdHandle = undefined as any;       // 曲线的ID
    public segmentCount: number;                      // 细分数量
    public baseSegmentIndex: number;                  // 第一段指数
    public fadeInTime: number;                      // 淡入时间[秒]
    public fadeOutTime: number;                     // 时间淡出[秒]
    public constructor() {
      this.type = CubismMotionCurveTarget.CubismMotionCurveTarget_Model;
      this.segmentCount = 0;
      this.baseSegmentIndex = 0;
      this.fadeInTime = 0.0;
      this.fadeOutTime = 0.0;
    }
  }

  /**
  * 事件。
  */
  export class CubismMotionEvent {
    public fireTime: number = 0.0;
    public value: csmString = undefined as any;
  }

  /**
   * @brief 动作数据
   *
   * 动作数据。
   */
  export class CubismMotionData {

    public duration: number;                                   // 动作长度[秒]
    public loop: boolean;                                      // 是否循环
    public curveCount: number;                                 // 曲线数量
    public eventCount: number;                                 // UserData的数量
    public fps: number;                                        // 帧率
    public curves: csmVector<CubismMotionCurve>;               // 曲线列表
    public segments: csmVector<CubismMotionSegment>;           // 细分列表
    public points: csmVector<CubismMotionPoint>;               // 积分清单
    public events: csmVector<CubismMotionEvent>;               // 事件清单
    public constructor() {
      this.duration = 0.0;
      this.loop = false;
      this.curveCount = 0;
      this.eventCount = 0;
      this.fps = 0.0;

      this.curves = new csmVector<CubismMotionCurve>();
      this.segments = new csmVector<CubismMotionSegment>();
      this.points = new csmVector<CubismMotionPoint>();
      this.events = new csmVector<CubismMotionEvent>();
    }
  }
}
