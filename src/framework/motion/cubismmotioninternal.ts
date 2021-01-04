/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import csmVector = csmvector.csmVector;
import csmString = csmstring.csmString;
import CubismIdHandle = cubismid.CubismIdHandle;

export namespace Live2DCubismFramework {
  /**
   * @brief モーションカーブの種類
   *
   * モーションカーブの種類。
   */
  export enum CubismMotionCurveTarget {
    CubismMotionCurveTarget_Model, // モデルに対して
    CubismMotionCurveTarget_Parameter, // パラメータに対して
    CubismMotionCurveTarget_PartOpacity, // パーツの不透明度に対して
  }

  /**
   * @brief モーションカーブのセグメントの種類
   *
   * モーションカーブのセグメントの種類。
   */
  export enum CubismMotionSegmentType {
    CubismMotionSegmentType_Linear = 0, // リニア
    CubismMotionSegmentType_Bezier = 1, // ベジェ曲線
    CubismMotionSegmentType_Stepped = 2, // ステップ
    CubismMotionSegmentType_InverseStepped = 3, // インバースステップ
  }

  /**
   * @brief モーションカーブの制御点
   *
   * モーションカーブの制御点。
   */
  export class CubismMotionPoint {
    public time = 0.0; // 時間[秒]
    public value = 0.0; // 値
  }

  /**
   * モーションカーブのセグメントの評価関数
   *
   * @param   points      モーションカーブの制御点リスト
   * @param   time        評価する時間[秒]
   */
  export type csmMotionSegmentEvaluationFunction = (points: CubismMotionPoint[], time: number) => number;

  /**
   * @brief モーションカーブのセグメント
   *
   * モーションカーブのセグメント。
   */
  export class CubismMotionSegment {

    public evaluate: csmMotionSegmentEvaluationFunction; // 使用する評価関数
    public basePointIndex: number; // 最初のセグメントへのインデックス
    public segmentType: number; // セグメントの種類
    /**
     * @brief コンストラクタ
     *
     * コンストラクタ。
     */
    public constructor() {
      this.evaluate = null;
      this.basePointIndex = 0;
      this.segmentType = 0;
    }
  }

  /**
   * @brief モーションカーブ
   *
   * モーションカーブ。
   */
  export class CubismMotionCurve {

    public type: CubismMotionCurveTarget; // カーブの種類
    public id: CubismIdHandle; // カーブのID
    public segmentCount: number; // セグメントの個数
    public baseSegmentIndex: number; // 最初のセグメントのインデックス
    public fadeInTime: number; // フェードインにかかる時間[秒]
    public fadeOutTime: number; // フェードアウトにかかる時間[秒]
    public constructor() {
      this.type = CubismMotionCurveTarget.CubismMotionCurveTarget_Model;
      this.segmentCount = 0;
      this.baseSegmentIndex = 0;
      this.fadeInTime = 0.0;
      this.fadeOutTime = 0.0;
    }
  }

  /**
   * イベント。
   */
  export class CubismMotionEvent {
    public fireTime = 0.0;
    public value: csmString;
  }

  /**
   * @brief モーションデータ
   *
   * モーションデータ。
   */
  export class CubismMotionData {

    public duration: number; // モーションの長さ[秒]
    public loop: boolean; // ループするかどうか
    public curveCount: number; // カーブの個数
    public eventCount: number; // UserDataの個数
    public fps: number; // フレームレート
    public curves: csmVector<CubismMotionCurve>; // カーブのリスト
    public segments: csmVector<CubismMotionSegment>; // セグメントのリスト
    public points: csmVector<CubismMotionPoint>; // ポイントのリスト
    public events: csmVector<CubismMotionEvent>; // イベントのリスト
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
