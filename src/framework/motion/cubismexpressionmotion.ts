/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as acubismmotion } from './acubismmotion';
import { Live2DCubismFramework as cubismjson } from '../utils/cubismjson';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubismmotionqueueentry } from './cubismmotionqueueentry';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import JsonFloat = cubismjson.JsonFloat;
import csmVector = csmvector.csmVector;
import CubismMotionQueueEntry = cubismmotionqueueentry.CubismMotionQueueEntry;
import CubismModel = cubismmodel.CubismModel;
import CubismFramework = cubismframework.CubismFramework;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismJson = cubismjson.CubismJson;
import Value = cubismjson.Value;
import ACubismMotion = acubismmotion.ACubismMotion;

export namespace Live2DCubismFramework {
  // exp3.json键和默认值
  const ExpressionKeyFadeIn: string = 'FadeInTime';
  const ExpressionKeyFadeOut: string = 'FadeOutTime';
  const ExpressionKeyParameters: string = 'Parameters';
  const ExpressionKeyId: string = 'Id';
  const ExpressionKeyValue: string = 'Value';
  const ExpressionKeyBlend: string = 'Blend';
  const BlendValueAdd: string = 'Add';
  const BlendValueMultiply: string = 'Multiply';
  const BlendValueOverwrite: string = 'Overwrite';
  const DefaultFadeTime: number = 1.0;

  /**
   * 面部运动
   *
   * 面部运动类
   */
  export class CubismExpressionMotion extends ACubismMotion {
    /**
     * 创建一个实例。
     * @param buffer 读取exp文件的缓冲区
     * @param size 缓冲区大小
     * @return 创建的实例
     */
    public static create(buffer: ArrayBuffer, size: number): CubismExpressionMotion {
      const expression: CubismExpressionMotion = new CubismExpressionMotion();

      const json: CubismJson = CubismJson.create(buffer, size) as any;
      const root: Value = json.getRoot();

      expression.setFadeInTime(root.getValueByString(ExpressionKeyFadeIn).toFloat(DefaultFadeTime));  // 淡入
      expression.setFadeOutTime(root.getValueByString(ExpressionKeyFadeOut).toFloat(DefaultFadeTime)); // 淡出

      // 关于每个参数
      const parameterCount = root.getValueByString(ExpressionKeyParameters).getSize();
      expression._parameters.prepareCapacity(parameterCount);

      for (let i: number = 0; i < parameterCount; ++i) {
        const param: Value = root.getValueByString(ExpressionKeyParameters).getValueByIndex(i);
        const parameterId: CubismIdHandle = CubismFramework.getIdManager().getId(param.getValueByString(ExpressionKeyId).getRawString());  // 参数ID

        const value: number = param.getValueByString(ExpressionKeyValue).toFloat(); // 値

        // 设定计算方法
        let blendType: ExpressionBlendType;

        if (param.getValueByString(ExpressionKeyBlend).isNull() || param.getValueByString(ExpressionKeyBlend).getString() == BlendValueAdd) {
          blendType = ExpressionBlendType.ExpressionBlendType_Add;
        } else if (param.getValueByString(ExpressionKeyBlend).getString() == BlendValueMultiply) {
          blendType = ExpressionBlendType.ExpressionBlendType_Multiply;
        } else if (param.getValueByString(ExpressionKeyBlend).getString() == BlendValueOverwrite) {
          blendType = ExpressionBlendType.ExpressionBlendType_Overwrite;
        } else {
          // 其他当设置了不在规格中的值时，可以通过设置添加模式来恢复
          blendType = ExpressionBlendType.ExpressionBlendType_Add;
        }

        // 创建配置对象并将其添加到列表中
        const item: ExpressionParameter = new ExpressionParameter();

        item.parameterId = parameterId;
        item.blendType = blendType;
        item.value = value;

        expression._parameters.pushBack(item);
      }

      CubismJson.delete(json);    // 不再需要时删除JSON数据
      return expression;
    }

    public _parameters: csmVector<ExpressionParameter>;  // 面部表情的参数信息列表

    /**
     * 构造函数
     */
    constructor() {
      super();

      this._parameters = new csmVector<ExpressionParameter>();
    }

    /**
     * 执行模型参数更新
     * @param model 目标模型
     * @param userTimeSeconds 增量时间的综合值[秒]
     * @param weight 运动权重
     * @param motionQueueEntry 由CubismMotionQueueManager管理的动作
     */
    public doUpdateParameters(model: CubismModel, userTimeSeconds: number, weight: number, motionQueueEntry: CubismMotionQueueEntry): void {
      for (let i: number = 0; i < this._parameters.getSize(); ++i) {
        const parameter: ExpressionParameter = this._parameters.at(i);

        switch (parameter.blendType) {
          case ExpressionBlendType.ExpressionBlendType_Add: {
            model.addParameterValueById(parameter.parameterId, parameter.value, weight);
            break;
          }
          case ExpressionBlendType.ExpressionBlendType_Multiply: {
            model.multiplyParameterValueById(parameter.parameterId, parameter.value, weight);
            break;
          }
          case ExpressionBlendType.ExpressionBlendType_Overwrite: {
            model.setParameterValueById(parameter.parameterId, parameter.value, weight);
            break;
          }
          default:
            // 如果设置的值不在规格中，则表示您已处于加法模式。
            break;
        }
      }
    }
  }

  /**
   * 表达式参数值计算方法
   */
  export enum ExpressionBlendType {
    ExpressionBlendType_Add = 0,        // 加法
    ExpressionBlendType_Multiply = 1,   // 乘法
    ExpressionBlendType_Overwrite = 2,   // 覆盖
  }

  /**
   * 表达参数信息
   */
  export class ExpressionParameter {
    public parameterId: CubismIdHandle = undefined as any;          // 参数ID
    public blendType: ExpressionBlendType = undefined as any; // 参数计算类型
    public value: number = undefined as any;                  // 值
  }
}
