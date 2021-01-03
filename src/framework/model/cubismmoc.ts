/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/// <reference path="../../live2dcubismcore.d.ts" />
import { Live2DCubismFramework as cubismmodel } from './cubismmodel';
import CubismModel = cubismmodel.CubismModel;
import { CSM_ASSERT } from '../utils/cubismdebug';

export namespace Live2DCubismFramework {
  /**
   * 管理Moc数据
   *
   * 管理Moc数据的类。
   */
  export class CubismMoc {
    /**
     * 创建Moc数据
     */
    public static create(mocBytes: ArrayBuffer): CubismMoc {
      let cubismMoc: CubismMoc = null as any;
      const moc: Live2DCubismCore.Moc = Live2DCubismCore.Moc.fromArrayBuffer(mocBytes);

      if (moc) {
        cubismMoc = new CubismMoc(moc);
      }

      return cubismMoc;
    }

    /**
     * 删除Moc数据
     *
     * 删除Moc数据
     */
    public static delete(moc: CubismMoc): void {
      moc._moc._release();
      moc._moc = null as any;
      moc = null as any;
    }

    public _moc: Live2DCubismCore.Moc; /// Moc数据
    public _modelCount: number;        /// < 从Moc数据制作的模型数量


    /**
     * 构造函数
     */
    private constructor(moc: Live2DCubismCore.Moc) {
      this._moc = moc;
      this._modelCount = 0;
    }

    /**
     * 创建一个模型
     *
     * @return 从Moc数据创建的模型
     */
    public createModel(): CubismModel {
      let cubismModel: CubismModel = null as any;

      const model: Live2DCubismCore.Model = Live2DCubismCore.Model.fromMoc(this._moc);

      if (model) {
        cubismModel = new CubismModel(model);
        cubismModel.initialize();

        ++this._modelCount;
      }

      return cubismModel;
    }

    /**
     * 删除模型
     */
    public deleteModel(model: CubismModel): void {
      if (model != null) {
        model.release();
        model = null as any;
        --this._modelCount;
      }
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      CSM_ASSERT(this._modelCount == 0);

      this._moc._release();
      this._moc = null as any;
    }
  }
}
