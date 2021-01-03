/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/// <reference path="../../live2dcubismcore.d.ts" />
import { Live2DCubismFramework as cubismrenderer } from '../rendering/cubismrenderer';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import { Live2DCubismFramework as csmmap } from '../type/csmmap';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { CSM_ASSERT } from '../utils/cubismdebug';
import CubismFramework = cubismframework.CubismFramework;
import CubismBlendMode = cubismrenderer.CubismBlendMode;
import csmVector = csmvector.csmVector;
import csmMap = csmmap.csmMap;
import CubismIdHandle = cubismid.CubismIdHandle;

export namespace Live2DCubismFramework {
  /**
   * 模型
   *
   * 从Moc数据生成的模型类。
   */
  export class CubismModel {

    private _notExistPartOpacities: csmMap<number, number>; // 不存在的零件的不透明度列表
    private _notExistPartId: csmMap<CubismIdHandle, number>;  // 不存在的部件ID列表

    private _notExistParameterValues: csmMap<number, number>;   // 不存在的参数值列表
    private _notExistParameterId: csmMap<CubismIdHandle, number>; // 不存在的参数ID列表

    private _savedParameters: csmVector<number>;            // 保存的参数

    private _model: Live2DCubismCore.Model;             // 模型

    private _parameterValues: Float32Array;            // 参数值列表
    private _parameterMaximumValues: Float32Array;     // 最大参数值列表
    private _parameterMinimumValues: Float32Array;     // 参数的最小值列表

    private _partOpacities: Float32Array;                     // 零件不透明度列表

    private _parameterIds: csmVector<CubismIdHandle>;
    private _partIds: csmVector<CubismIdHandle>;
    private _drawableIds: csmVector<CubismIdHandle>;

    /**
     * 构造函数
     * @param model 模型
     */
    public constructor(model: Live2DCubismCore.Model) {
      this._model = model;
      this._parameterValues = null as any;
      this._parameterMaximumValues = null as any;
      this._parameterMinimumValues = null as any;
      this._partOpacities = null as any;
      this._savedParameters = new csmVector<number>();
      this._parameterIds = new csmVector<CubismIdHandle>();
      this._drawableIds = new csmVector<CubismIdHandle>();
      this._partIds = new csmVector<CubismIdHandle>();

      this._notExistPartId = new csmMap<CubismIdHandle, number>();
      this._notExistParameterId = new csmMap<CubismIdHandle, number>();
      this._notExistParameterValues = new csmMap<number, number>();
      this._notExistPartOpacities = new csmMap<number, number>();
    }
    /**
     * 更新模型参数
     */
    public update(): void {
      // Update model
      this._model.update();

      this._model.drawables.resetDynamicFlags();
    }

    /**
     * 获取画布的宽度
     */
    public getCanvasWidth(): number {
      if (this._model == null) {
        return 0.0;
      }

      return this._model.canvasinfo.CanvasWidth / this._model.canvasinfo.PixelsPerUnit;
    }

    /**
     * 获得画布的高度
     */
    public getCanvasHeight(): number {
      if (this._model == null) {
        return 0.0;
      }

      return this._model.canvasinfo.CanvasHeight / this._model.canvasinfo.PixelsPerUnit;
    }

    /**
     * 保存参数
     */
    public saveParameters(): void {
      const parameterCount: number = this._model.parameters.count;
      const savedParameterCount: number = this._savedParameters.getSize();

      for (let i: number = 0; i < parameterCount; ++i) {
        if (i < savedParameterCount) {
          this._savedParameters.set(i, this._parameterValues[i]);
        } else {
          this._savedParameters.pushBack(this._parameterValues[i]);
        }
      }
    }

    /**
     * 获得模型
     */
    public getModel(): Live2DCubismCore.Model {
      return this._model;
    }

    /**
     * 获取部件索引
     * @param partId 部件ID
     * @return 部件索引
     */
    public getPartIndex(partId: CubismIdHandle): number {
      let partIndex: number;
      const partCount: number = this._model.parts.count;

      for (partIndex = 0; partIndex < partCount; ++partIndex) {
        if (partId == this._partIds.at(partIndex)) {
          return partIndex;
        }
      }

      // 如果模型中不存在，则在不存在的零件ID列表中搜索它并返回其索引
      if (this._notExistPartId.isExist(partId)) {
        return this._notExistPartId.getValue(partId);
      }

      // 如果不存在于不存在的零件ID列表中，则添加新元素
      partIndex = partCount + this._notExistPartId.getSize();
      this._notExistPartId.setValue(partId, partIndex);
      this._notExistPartOpacities.appendKey(partIndex);

      return partIndex;
    }

    /**
     * 获取零件数量
     * @return 零件数量
     */
    public getPartCount(): number {
      const partCount: number = this._model.parts.count;
      return partCount;
    }

    /**
     * 设置零件的不透明度（索引）
     * @param partIndex 部分索引
     * @param opacity 不透明度
     */
    public setPartOpacityByIndex(partIndex: number, opacity: number): void {
      if (this._notExistPartOpacities.isExist(partIndex)) {
        this._notExistPartOpacities.setValue(partIndex, opacity);
        return;
      }

      // 索引范围检测
      CSM_ASSERT(0 <= partIndex && partIndex < this.getPartCount());

      this._partOpacities[partIndex] = opacity;
    }

    /**
     * 设置零件的不透明度（Id）
     * @param partId 部件ID
     * @param opacity 部件的不透明度
     */
    public setPartOpacityById(partId: CubismIdHandle, opacity: number): void {
      // 虽然它是一种可以获取PartIndex以加速的机制，但是因为从外部设置时呼叫频率低所以没有必要
      const index: number = this.getPartIndex(partId);

      if (index < 0) {
        return; // 跳过，因为没有任何部件
      }

      this.setPartOpacityByIndex(index, opacity);
    }

    /**
     * 获得部分不透明度（指数）
     * @param partIndex 部分索引
     * @return 零件的不透明度
     */
    public getPartOpacityByIndex(partIndex: number): number {
      if (this._notExistPartOpacities.isExist(partIndex)) {
        // 对于模型中不存在的零件ID，从不存在的零件清单返回不透明度。
        return this._notExistPartOpacities.getValue(partIndex);
      }

      // 索引范围检测
      CSM_ASSERT(0 <= partIndex && partIndex < this.getPartCount());

      return this._partOpacities[partIndex];
    }

    /**
     * 获得部分不透明度（id）
     * @param partId 部分ID
     * @return 零件的不透明度
     */
    public getPartOpacityById(partId: CubismIdHandle): number {
      // 虽然它是一种可以获取PartIndex以加速的机制，但是因为从外部设置时呼叫频率低所以没有必要
      const index: number = this.getPartIndex(partId);

      if (index < 0) {
        return 0;   // 跳过，因为没有任何部分
      }

      return this.getPartOpacityByIndex(index);
    }

    /**
     * 获取参数索引
     * @param 参数ID
     * @return 参数索引
     */
    public getParameterIndex(parameterId: CubismIdHandle): number {
      let parameterIndex: number;
      const idCount: number = this._model.parameters.count;

      for (parameterIndex = 0; parameterIndex < idCount; ++parameterIndex) {
        if (parameterId != this._parameterIds.at(parameterIndex)) {
          continue;
        }

        return parameterIndex;
      }

      // 如果模型中不存在，则搜索不存在的参数ID列表并返回其索引
      if (this._notExistParameterId.isExist(parameterId)) {
        return this._notExistParameterId.getValue(parameterId);
      }

      // 如果不存在于不存在的参数ID列表中，则添加新元素
      parameterIndex = this._model.parameters.count + this._notExistParameterId.getSize();

      this._notExistParameterId.setValue(parameterId, parameterIndex);
      this._notExistParameterValues.appendKey(parameterIndex);

      return parameterIndex;
    }

    /**
     * 获取参数数量
     * @return 参数数量
     */
    public getParameterCount(): number {
      return this._model.parameters.count;
    }

    /**
     * 获取参数的最大值
     * @param parameterIndex 参数索引
     * @return 参数的最大值
     */
    public getParameterMaximumValue(parameterIndex: number): number {
      return this._model.parameters.maximumValues[parameterIndex];
    }

    /**
     * 获取参数的最小值
     * @param parameterIndex 参数索引
     * @return 参数的最小值
     */
    public getParameterMinimumValue(parameterIndex: number): number {
      return this._model.parameters.minimumValues[parameterIndex];
    }

    /**
     * 获取参数默认值
     * @param parameterIndex 参数索引
     * @return 参数默认值
     */
    public getParameterDefaultValue(parameterIndex: number): number {
      return this._model.parameters.defaultValues[parameterIndex];
    }

    /**
     * 获取参数值
     * @param parameterIndex    参数索引
     * @return 参数的值
     */
    public getParameterValueByIndex(parameterIndex: number): number {
      if (this._notExistParameterValues.isExist(parameterIndex)) {
        return this._notExistParameterValues.getValue(parameterIndex);
      }

      // 索引范围检测
      CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());

      return this._parameterValues[parameterIndex];
    }

    /**
     * 获取参数值
     * @param parameterId    参数ID
     * @return 参数的值
     */
    public getParameterValueById(parameterId: CubismIdHandle): number {
      // 高速化のためにparameterIndexを取得できる機構になっているが、外部からの設定の時は呼び出し頻度が低いため不要
      const parameterIndex: number = this.getParameterIndex(parameterId);
      return this.getParameterValueByIndex(parameterIndex);
    }

    /**
     * 设置参数值
     * @param parameterIndex 参数索引
     * @param value 参数的值
     * @param weight 权重
     */
    public setParameterValueByIndex(parameterIndex: number, value: number, weight: number = 1.0): void {
      if (this._notExistParameterValues.isExist(parameterIndex)) {
        this._notExistParameterValues.setValue(
          parameterIndex,
          (weight == 1)
            ? value
            : (this._notExistParameterValues.getValue(parameterIndex) * (1 - weight)) + (value * weight),
        );

        return;
      }

      // 索引范围检测
      CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());

      if (this._model.parameters.maximumValues[parameterIndex] < value) {
        value = this._model.parameters.maximumValues[parameterIndex];
      }
      if (this._model.parameters.minimumValues[parameterIndex] > value) {
        value = this._model.parameters.minimumValues[parameterIndex];
      }

      this._parameterValues[parameterIndex] = (weight == 1)
        ? value
        : this._parameterValues[parameterIndex] = (this._parameterValues[parameterIndex] * (1 - weight)) + (value * weight);
    }

    /**
     * 设置参数值
     * @param parameterId 参数ID
     * @param value 参数的值
     * @param weight 权重
     */
    public setParameterValueById(parameterId: CubismIdHandle, value: number, weight: number = 1.0): void {
      const index: number = this.getParameterIndex(parameterId);
      this.setParameterValueByIndex(index, value, weight);
    }

    /**
     * 参数值加法（索引）
     * @param parameterIndex 参数索引
     * @param value 要添加的值
     * @param weight 权重
     */
    public addParameterValueByIndex(parameterIndex: number, value: number, weight: number = 1.0): void {
      this.setParameterValueByIndex(parameterIndex, (this.getParameterValueByIndex(parameterIndex) + (value * weight)));
    }

    /**
     * 添加参数值（id）
     * @param parameterId 参数ID
     * @param value 要添加的值
     * @param weight 权重
     */
    public addParameterValueById(parameterId: any, value: number, weight: number = 1.0): void {
      const index: number = this.getParameterIndex(parameterId);
      this.addParameterValueByIndex(index, value, weight);
    }

    /**
     * 乘以参数值
     * @param parameterId 参数ID
     * @param value 要乘的值
     * @param weight 权重
     */
    public multiplyParameterValueById(parameterId: CubismIdHandle, value: number, weight: number = 1.0): void {
      const index: number = this.getParameterIndex(parameterId);
      this.multiplyParameterValueByIndex(index, value, weight);
    }

    /**
     * 乘以参数值
     * @param parameterIndex 参数索引
     * @param value　要乘的值
     * @param weight 权重
     */
    public multiplyParameterValueByIndex(parameterIndex: number, value: number, weight: number = 1.0): void {
      this.setParameterValueByIndex(parameterIndex, (this.getParameterValueByIndex(parameterIndex) * (1.0 + (value - 1.0) * weight)));
    }


    /**
     * 获取Drawable索引
     * @param drawableId drawableId ID
     * @return Drawable索引
     */
    public getDrawableIndex(drawableId: CubismIdHandle): number {
      const drawableCount = this._model.drawables.count;

      for (let drawableIndex: number = 0; drawableIndex < drawableCount; ++drawableIndex) {
        if (this._drawableIds.at(drawableIndex) == drawableId) {
          return drawableIndex;
        }
      }

      return -1;
    }

    /**
     * 获得可绘制的数量
     * @return 可绘制的数量
     */
    public getDrawableCount(): number {
      const drawableCount = this._model.drawables.count;
      return drawableCount;
    }

    /**
     * 获取Drawable ID
     * @param drawableIndex Drawable索引
     * @return drawable ID
     */
    public getDrawableId(drawableIndex: number): CubismIdHandle {
      const parameterIds: string[] = this._model.drawables.ids;
      return CubismFramework.getIdManager().getId(parameterIds[drawableIndex]);
    }

    /**
     * 获取Drawable的绘图顺序列表
     * @return 可绘制的绘图顺序列表
     */
    public getDrawableRenderOrders(): Int32Array {
      const renderOrders: Int32Array = this._model.drawables.renderOrders;
      return renderOrders;
    }

    /**
     * 获取Drawable的纹理索引列表
     * @param drawableIndex Drawable索引
     * @return drawable的纹理索引列表
     */
    public getDrawableTextureIndices(drawableIndex: number): number {
      const textureIndices: Int32Array = this._model.drawables.textureIndices;
      return textureIndices[drawableIndex];
    }

    /**
     * 获取Drawable的VertexPositions的更改信息
     *
     * 获取最新的CubismModel.update函数中的Drawable顶点信息是否已更改。
     *
     * @param   drawableIndex   可绘制的索引
     * @retval  true    使用最新的CubismModel.update函数更改了可绘制的顶点信息
     * @retval  false   最新的CubismModel.update函数没有改变可绘制的顶点信息
     */
    public getDrawableDynamicFlagVertexPositionsDidChange(drawableIndex: number): boolean {
      const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
      return Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(dynamicFlags[drawableIndex]);
    }

    /**
     * 获取Drawable顶点索引的数量
     * @param drawableIndex 可绘制的索引
     * @return 可绘制的顶点索引数
     */
    public getDrawableVertexIndexCount(drawableIndex: number): number {
      const indexCounts: Int32Array = this._model.drawables.indexCounts;
      return indexCounts[drawableIndex];
    }

    /**
     * 获取Drawable的顶点数
     * @param drawableIndex 可绘制的索引
     * @return drawable中的顶点数
     */
    public getDrawableVertexCount(drawableIndex: number): number {
      const vertexCounts = this._model.drawables.vertexCounts;
      return vertexCounts[drawableIndex];
    }

    /**
     * 获取Drawable顶点列表
     * @param drawableIndex 可绘制的索引
     * @return drawable的顶点列表
     */
    public getDrawableVertices(drawableIndex: number): Float32Array {
      return this.getDrawableVertexPositions(drawableIndex);
    }

    /**
     * 获取Drawable的顶点索引列表
     * @param drarableIndex 可绘制的索引
     * @return drawable顶点索引列表
     */
    public getDrawableVertexIndices(drawableIndex: number): Uint16Array {
      const indicesArray: Uint16Array[] = this._model.drawables.indices;
      return indicesArray[drawableIndex];
    }

    /**
     * 获取Drawable顶点列表
     * @param drawableIndex 可绘制的索引
     * @return drawable的顶点列表
     */
    public getDrawableVertexPositions(drawableIndex: number): Float32Array {
      const verticesArray: Float32Array[] = this._model.drawables.vertexPositions;
      return verticesArray[drawableIndex];
    }

    /**
     * 获取可绘制顶点的UV列表
     * @param drawableIndex 可绘制的索引
     * @return 可绘制顶点UV列表
     */
    public getDrawableVertexUvs(drawableIndex: number): Float32Array {
      const uvsArray: Float32Array[] = this._model.drawables.vertexUvs;
      return uvsArray[drawableIndex];
    }

    /**
     * 获得Drawable的不透明度
     * @param drawableIndex 可绘制的索引
     * @return 可绘制的不透明度
     */
    public getDrawableOpacity(drawableIndex: number): number {
      const opacities: Float32Array = this._model.drawables.opacities;
      return opacities[drawableIndex];
    }

    /**
     * 可绘制的剔除信息获取
     * @param drawableIndex 可绘制的索引
     * @return 可绘制的剔除信息
     */
    public getDrawableCulling(drawableIndex: number): boolean {
      const constantFlags = this._model.drawables.constantFlags;

      return !Live2DCubismCore.Utils.hasIsDoubleSidedBit(constantFlags[drawableIndex]);
    }

    /**
     * 获得Drawable的混合模式
     * @param drawableIndex 可绘制的索引
     * @return 混合模式的drawable
     */
    public getDrawableBlendMode(drawableIndex: number): CubismBlendMode {
      const constantFlags = this._model.drawables.constantFlags;

      return (Live2DCubismCore.Utils.hasBlendAdditiveBit(constantFlags[drawableIndex]))
        ? CubismBlendMode.CubismBlendMode_Additive
        : (Live2DCubismCore.Utils.hasBlendMultiplicativeBit(constantFlags[drawableIndex]))
          ? CubismBlendMode.CubismBlendMode_Multiplicative
          : CubismBlendMode.CubismBlendMode_Normal;
    }

    /**
     * 获取Drawable的剪贴蒙版列表
     * @return 可绘制的剪贴蒙版列表
     */
    public getDrawableMasks(): Int32Array[] {
      const masks: Int32Array[] = this._model.drawables.masks;
      return masks;
    }

    /**
     * 获取可绘制剪切蒙版的数量列表
     * @return 可绘制剪切蒙版的数量列表
     */
    public getDrawableMaskCounts(): Int32Array {
      const maskCounts: Int32Array = this._model.drawables.maskCounts;
      return maskCounts;
    }

    /**
     * 剪贴蒙版使用状态
     *
     * @return true 使用剪贴蒙版
     * @return false 不使用剪贴蒙版
     */
    public isUsingMasking(): boolean {
      for (let d: number = 0; d < this._model.drawables.count; ++d) {
        if (this._model.drawables.maskCounts[d] <= 0) {
          continue;
        }
        return true;
      }
      return false;
    }

    /**
     * 获取Drawable显示信息
     *
     * @param drawableIndex 可绘制的索引
     * @return true 显示Drawable
     * @return false Drawable是隐藏的
     */
    public getDrawableDynamicFlagIsVisible(drawableIndex: number): boolean {
      const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
      return Live2DCubismCore.Utils.hasIsVisibleBit(dynamicFlags[drawableIndex]);
    }

    /**
     * 获取Drawable的DrawOrder的更改信息
     *
     * 获取最新的CubismModel.update函数中drawable的drawOrder是否已更改。
     * drawOrder是artMesh上指定的0到1000个信息
     * @param drawableIndex 可绘制的索引
     * @return true drawable的不透明度随最新的CubismModel.update函数而改变
     * @return false drawable的不透明度随着最新的CubismModel.update函数而改变
     */
    public getDrawableDynamicFlagVisibilityDidChange(drawableIndex: number): boolean {
      const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
      return Live2DCubismCore.Utils.hasVisibilityDidChangeBit(dynamicFlags[drawableIndex]);
    }

    /**
     * 获取Drawable不透明度的变化信息
     *
     * 获取是否使用最新的CubismModel.update函数更改了可绘制的不透明度
     *
     * @param drawableIndex 可绘制的索引
     * @return true drawable的不透明度随最新的CubismModel.update函数而改变
     * @return false 最新的CubismModel.update函数没有改变可绘制的不透明度
     */
    public getDrawableDynamicFlagOpacityDidChange(drawableIndex: number): boolean {
      const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
      return Live2DCubismCore.Utils.hasOpacityDidChangeBit(dynamicFlags[drawableIndex]);
    }

    /**
     * 获取Drawable的图纸订单变更信息
     *
     * 使用最新的CubismModel.update函数获取Drawable的绘制顺序是否已更改。
     *
     * @param drawableIndex 可绘制的索引
     * @return true Drawable的绘制顺序随最新的CubismModel.update函数而改变
     * @return false Drawable的绘制顺序没有随最新的CubismModel.update函数而改变
     */
    public getDrawableDynamicFlagRenderOrderDidChange(drawableIndex: number): boolean {
      const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
      return Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(dynamicFlags[drawableIndex]);
    }

    /**
     * 加载保存的参数
     */
    public loadParameters(): void {
      let parameterCount: number = this._model.parameters.count;
      const savedParameterCount: number = this._savedParameters.getSize();

      if (parameterCount > savedParameterCount) {
        parameterCount = savedParameterCount;
      }

      for (let i: number = 0; i < parameterCount; ++i) {
        this._parameterValues[i] = this._savedParameters.at(i);
      }
    }

    /**
     * 初始化
     */
    public initialize(): void {
      CSM_ASSERT(this._model);

      this._parameterValues = this._model.parameters.values;
      this._partOpacities = this._model.parts.opacities;
      this._parameterMaximumValues = this._model.parameters.maximumValues;
      this._parameterMinimumValues = this._model.parameters.minimumValues;

      {
        const parameterIds: string[] = this._model.parameters.ids;
        const parameterCount: number = this._model.parameters.count;

        this._parameterIds.prepareCapacity(parameterCount);
        for (let i: number = 0; i < parameterCount; ++i) {
          this._parameterIds.pushBack(CubismFramework.getIdManager().getId(parameterIds[i]));
        }
      }

      {
        const partIds: string[] = this._model.parts.ids;
        const partCount: number = this._model.parts.count;

        this._partIds.prepareCapacity(partCount);
        for (let i: number = 0; i < partCount; ++i) {
          this._partIds.pushBack(CubismFramework.getIdManager().getId(partIds[i]));
        }
      }

      {
        const drawableIds: string[] = this._model.drawables.ids;
        const drawableCount: number = this._model.drawables.count;

        this._drawableIds.prepareCapacity(drawableCount);
        for (let i: number = 0; i < drawableCount; ++i) {
          this._drawableIds.pushBack(CubismFramework.getIdManager().getId(drawableIds[i]));
        }
      }
    }

    /**
     * 析构函数
     */
    public release(): void {
      this._model.release();
      this._model = null as any;
    }
  }
}
