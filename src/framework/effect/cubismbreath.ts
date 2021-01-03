/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismModel = cubismmodel.CubismModel;
import csmVector = csmvector.csmVector;


export namespace Live2DCubismFramework {
  /**
   * 呼吸功能
   *
   * 提供呼吸功能。
   */
  export class CubismBreath {

    /**
     * 创建实例
     */
    public static create(): CubismBreath {
      return new CubismBreath();
    }

    /**
     * 销毁实例
     * @param instance CubismBreath目标
     */
    public static delete(instance: CubismBreath): void {
      if (instance != null) {
        instance = null as any;
      }
    }

    public _breathParameters: csmVector<BreathParameterData> = undefined as any; // 与呼吸相关的参数列表
    public _currentTime: number;  // 积分时间[秒]


    /**
     * 构造函数
     */
    public constructor() {
      this._currentTime = 0.0;
    }

    /**
     * 连接呼吸参数
     * @param breathParameters 与呼吸相关的参数列表
     */
    public setParameters(breathParameters: csmVector<BreathParameterData>): void {
      this._breathParameters = breathParameters;
    }

    /**
     * 获取与呼吸相关的参数
     * @return 与呼吸相关的参数列表
     */
    public getParameters(): csmVector<BreathParameterData> {
      return this._breathParameters;
    }

    /**
     * 更新模型参数
     * @param model 目标模型
     * @param deltaTimeSeconds 达美时间[秒]
     */
    public updateParameters(model: CubismModel, deltaTimeSeconds: number): void {
      this._currentTime += deltaTimeSeconds;

      const t: number = this._currentTime * 2.0 * 3.14159;

      for (let i: number = 0; i < this._breathParameters.getSize(); ++i) {
        const data: BreathParameterData = this._breathParameters.at(i);

        model.addParameterValueById(
          data.parameterId,
          data.offset + (data.peak * Math.sin(t / data.cycle)),
          data.weight,
        );
      }
    }
  }

  /**
   * 呼吸参数信息
   */
  export class BreathParameterData {

    public parameterId: CubismIdHandle;  // 用于关联呼吸的参数ID
    public offset: number;         // 呼吸时的波浪偏移是正弦波
    public peak: number;           // 呼吸时的波高是正弦波
    public cycle: number;          // 呼吸时的波浪期是正弦波
    public weight: number;         // 参数的权重
    /**
     * 构造函数
     * @param parameterId   与呼吸相关的参数ID
     * @param offset        呼吸时的波浪偏移是正弦波
     * @param peak          呼吸时的波高是正弦波
     * @param cycle         呼吸时的波浪期是正弦波
     * @param weight        参数的权重
     */
    constructor(parameterId?: CubismIdHandle, offset?: number, peak?: number, cycle?: number, weight?: number) {
      this.parameterId = (parameterId == undefined)
        ? null as any
        : parameterId;
      this.offset = (offset == undefined)
        ? 0.0
        : offset;
      this.peak = (peak == undefined)
        ? 0.0
        : peak;
      this.cycle = (cycle == undefined)
        ? 0.0
        : cycle;
      this.weight = (weight == undefined)
        ? 0.0
        : weight;
    }
  }
}
