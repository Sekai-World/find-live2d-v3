/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismModel = cubismmodel.CubismModel;
import csmVector = csmvector.csmVector;

export namespace Live2DCubismFramework {
  /**
   * 呼吸機能
   *
   * 呼吸機能を提供する。
   */
  export class CubismBreath {
    /**
     * インスタンスの作成
     */
    public static create(): CubismBreath {
      return new CubismBreath();
    }

    /**
     * インスタンスの破棄
     * @param instance 対象のCubismBreath
     */
    public static delete(instance: CubismBreath): void {
      if (instance != null) {
        instance = null;
      }
    }

    public _breathParameters: csmVector<BreathParameterData>; // 呼吸にひもづいているパラメータのリスト
    public _currentTime: number; // 積算時間[秒]

    /**
     * コンストラクタ
     */
    public constructor() {
      this._currentTime = 0.0;
    }

    /**
     * 呼吸のパラメータの紐づけ
     * @param breathParameters 呼吸を紐づけたいパラメータのリスト
     */
    public setParameters(
      breathParameters: csmVector<BreathParameterData>,
    ): void {
      this._breathParameters = breathParameters;
    }

    /**
     * 呼吸に紐づいているパラメータの取得
     * @return 呼吸に紐づいているパラメータのリスト
     */
    public getParameters(): csmVector<BreathParameterData> {
      return this._breathParameters;
    }

    /**
     * モデルのパラメータの更新
     * @param model 対象のモデル
     * @param deltaTimeSeconds デルタ時間[秒]
     */
    public updateParameters(
      model: CubismModel,
      deltaTimeSeconds: number,
    ): void {
      this._currentTime += deltaTimeSeconds;

      const t: number = this._currentTime * 2.0 * 3.14159;

      for (let i = 0; i < this._breathParameters.getSize(); ++i) {
        const data: BreathParameterData = this._breathParameters.at(i);

        model.addParameterValueById(
          data.parameterId,
          data.offset + data.peak * Math.sin(t / data.cycle),
          data.weight,
        );
      }
    }
  }

  /**
   * 呼吸のパラメータ情報
   */
  export class BreathParameterData {

    public parameterId: CubismIdHandle; // 呼吸をひもづけるパラメータID\
    public offset: number; // 呼吸を正弦波としたときの、波のオフセット
    public peak: number; // 呼吸を正弦波としたときの、波の高さ
    public cycle: number; // 呼吸を正弦波としたときの、波の周期
    public weight: number; // パラメータへの重み
    /**
     * コンストラクタ
     * @param parameterId   呼吸をひもづけるパラメータID
     * @param offset        呼吸を正弦波としたときの、波のオフセット
     * @param peak          呼吸を正弦波としたときの、波の高さ
     * @param cycle         呼吸を正弦波としたときの、波の周期
     * @param weight        パラメータへの重み
     */
    constructor(
      parameterId?: CubismIdHandle,
      offset?: number,
      peak?: number,
      cycle?: number,
      weight?: number,
    ) {
      this.parameterId = parameterId == undefined ? null : parameterId;
      this.offset = offset == undefined ? 0.0 : offset;
      this.peak = peak == undefined ? 0.0 : peak;
      this.cycle = cycle == undefined ? 0.0 : cycle;
      this.weight = weight == undefined ? 0.0 : weight;
    }
  }
}
