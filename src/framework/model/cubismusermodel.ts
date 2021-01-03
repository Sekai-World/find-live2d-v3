/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import { Live2DCubismFramework as cubismmotionmanager } from '../motion/cubismmotionmanager';
import { Live2DCubismFramework as cubismtargetpoint } from '../math/cubismtargetpoint';
import { Live2DCubismFramework as cubismmodelmatrix } from '../math/cubismmodelmatrix';
import { Live2DCubismFramework as cubismmoc } from './cubismmoc';
import { Live2DCubismFramework as cubismmodel } from './cubismmodel';
import { Live2DCubismFramework as acubismmotion } from '../motion/acubismmotion';
import { Live2DCubismFramework as cubismmotion } from '../motion/cubismmotion';
import { Live2DCubismFramework as cubismexpressionmotion } from '../motion/cubismexpressionmotion';
import { Live2DCubismFramework as cubismpose } from '../effect/cubismpose';
import { Live2DCubismFramework as cubismmodeluserdata } from './cubismmodeluserdata';
import { Live2DCubismFramework as cubismphysics } from '../physics/cubismphysics';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { Live2DCubismFramework as userMotionParam } from '../type/userMotionParam';
import { Live2DCubismFramework as cubismmotionqueuemanager } from '../motion/cubismmotionqueuemanager';
import { Live2DCubismFramework as cubismbreath } from '../effect/cubismbreath';
import { Live2DCubismFramework as cubismeyeblink } from '../effect/cubismeyeblink';
import { Live2DCubismFramework as cubismrenderer_webgl } from '../rendering/cubismrenderer_WebGL';
import { CubismLogError, CubismLogInfo } from '../utils/cubismdebug';
import CubismRenderer_WebGL = cubismrenderer_webgl.CubismRenderer_WebGL;
import CubismEyeBlink = cubismeyeblink.CubismEyeBlink;
import CubismBreath = cubismbreath.CubismBreath;
import CubismMotionQueueManager = cubismmotionqueuemanager.CubismMotionQueueManager;
import csmString = csmstring.csmString;
import Constant = cubismframework.Constant;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismPhysics = cubismphysics.CubismPhysics;
import CubismModelUserData = cubismmodeluserdata.CubismModelUserData;
import CubismPose = cubismpose.CubismPose;
import CubismExpressionMotion = cubismexpressionmotion.CubismExpressionMotion;
import CubismMotion = cubismmotion.CubismMotion;
import ACubismMotion = acubismmotion.ACubismMotion;
import CubismModel = cubismmodel.CubismModel;
import CubismMoc = cubismmoc.CubismMoc;
import CubismModelMatrix = cubismmodelmatrix.CubismModelMatrix;
import CubismTargetPoint = cubismtargetpoint.CubismTargetPoint;
import CubismMotionManager = cubismmotionmanager.CubismMotionManager;
import CubismMotionParam = userMotionParam.CubismMotionParam;
import { LAppDefine } from '../../lappdefine';

export namespace Live2DCubismFramework {
  /**
   * 用户实际使用的模型
   *
   * 用户实际使用的模型的基类。 这是由用户继承和实现的。
   */
  export class CubismUserModel {

    /**
     * 事件回调
     *
     * 回调以在CubismMotionQueueManager中注册事件。
     * 调用EventFired，CubismUserModel的继承目的地。
     *
     * @param caller 管理已触发事件的运动管理器，以进行比较
     * @param eventValue 已触发事件的字符串数据
     * @param customData 假设一个实例继承了CubismUserModel
     */
    public static cubismDefaultMotionEventCallback(caller: CubismMotionQueueManager, eventValue: csmString, customData: CubismUserModel): void {
      const model: CubismUserModel = customData;

      if (model != null) {
        model.motionEventFired(eventValue);
      }
    }
    public _modelName: string;        // 模型名称
    public _motionIdleName: string; // 默认发呆的动作名称

    protected _moc: CubismMoc;        // Moc数据
    protected _model: CubismModel;    // 模型实例
    protected _modelClear: boolean;   // 清除画布 不显示模型

    protected _motionManager: CubismMotionManager;    // 运动管理
    protected _motionQueue: CubismMotionParam[]; // 动作队列
    protected _expressionManager: CubismMotionManager;    // 面部表情管理
    protected _eyeBlink: CubismEyeBlink;         // 自动闪烁
    protected _breath: CubismBreath;           // 呼吸
    protected _modelMatrix: CubismModelMatrix;      // 模型矩阵
    protected _pose: CubismPose;             // 暂停管理
    protected _dragManager: CubismTargetPoint;      // 鼠标拖动
    protected _physics: CubismPhysics;          // 物理演算
    protected _modelUserData: CubismModelUserData;    // 用户数据

    protected _initialized: boolean;    // 是否已初始化
    protected _updating: boolean;    // 是否更新
    protected _opacity: number;     // 不透明度
    protected _lipsync: boolean;    // 是否唇同步
    protected _lastLipSyncValue: number;     // 最后唇同步控制位置
    protected _lipsyncTrend: string; // 唇形变化趋势
    protected _dragX: number;     // 鼠标拖动X位置
    protected _dragY: number;     // 鼠标拖动Y位置
    protected _accelerationX: number;     // X轴加速度
    protected _accelerationY: number;     // Y轴加速度
    protected _accelerationZ: number;     // Z轴方向的加速度

    private _renderer: CubismRenderer_WebGL;                  // 渲染

    /**
     * 构造函数
     */
    public constructor() {
      // 初始化每个变量
      this._moc = null as any;
      this._model = null as any;
      this._motionManager = null as any;
      this._expressionManager = null as any;
      this._eyeBlink = null as any;
      this._breath = null as any;
      this._modelMatrix = null as any;
      this._pose = null as any;
      this._dragManager = null as any;
      this._physics = null as any;
      this._modelUserData = null as any;
      this._initialized = false;
      this._updating = false;
      this._opacity = 1.0;
      this._lipsync = true;
      this._lastLipSyncValue = 0.0;
      this._lipsyncTrend = 'increase';
      this._dragX = 0.0;
      this._dragY = 0.0;
      this._accelerationX = 0.0;
      this._accelerationY = 0.0;
      this._accelerationZ = 0.0;
      this._renderer = null as any;
      this._motionQueue = [];
      this._motionIdleName = LAppDefine.MotionGroupIdle;
      this._modelClear = true;
      this._modelName = '';

      // 创建一个运动管理器
      this._motionManager = new CubismMotionManager();
      this._motionManager.setEventCallback(CubismUserModel.cubismDefaultMotionEventCallback, this);

      // 创建面部表情经理
      this._expressionManager = new CubismMotionManager();

      // 拖动动画
      this._dragManager = new CubismTargetPoint();
    }
    /**
     * 获取初始化状态
     *
     * 它被初始化了吗？
     *
     * @return true     已初始化
     * @return false    未初始化
     */
    public isInitialized(): boolean {
      return this._initialized;
    }

    /**
     * 设置初始化状态
     *
     * 设置初始化状态
     *
     * @param v 初始化状态
     */
    public setInitialized(v: boolean): void {
      this._initialized = v;
    }

    /**
     * 获取更新状态
     *
     * 它更新了吗？
     *
     * @return true     已更新
     * @return false    未更新
     */
    public isUpdating(): boolean {
      return this._updating;
    }

    /**
     * 设置更新状态
     *
     * 设置更新状态
     *
     * @param v 更新状态
     */
    public setUpdating(v: boolean): void {
      this._updating = v;
    }

    /**
     * 鼠标拖动信息设置
     * @param 拖动光标的X位置
     * @param 拖动光标的Y位置
     */
    public setDragging(x: number, y: number): void {
      this._dragManager.set(x, y);
    }

    /**
     * 设置加速度信息
     * @param x X轴加速度
     * @param y Y轴加速度
     * @param z Z轴加速度
     */
    public setAcceleration(x: number, y: number, z: number): void {
      this._accelerationX = x;
      this._accelerationY = y;
      this._accelerationZ = z;
    }

    /**
     * 获取模型矩阵
     * @return 模型矩阵
     */
    public getModelMatrix(): CubismModelMatrix {
      return this._modelMatrix;
    }

    /**
     * 设置不透明度
     * @param a 不透明度
     */
    public setOpacity(a: number): void {
      this._opacity = a;
    }

    /**
     * 获得不透明度
     * @return 不透明度
     */
    public getOpacity(): number {
      return this._opacity;
    }

    /**
     * 加载模型数据
     *
     * @param buffer    读取moc3文件的缓冲区
     */
    public loadModel(buffer: ArrayBuffer) {
      this._moc = CubismMoc.create(buffer);
      this._model = this._moc.createModel();
      this._model.saveParameters();

      if ((this._moc == null) || (this._model == null)) {
        CubismLogError('Failed to CreateModel().');
        return;
      }

      this._modelMatrix = new CubismModelMatrix(this._model.getCanvasWidth(), this._model.getCanvasHeight());
    }

    /**
     * 加载运动数据
     * @param buffer 读取motion3.json文件的缓冲区
     * @param size 缓冲区大小
     * @param name 动议的名称
     * @return 运动课
     */
    public loadMotion(buffer: ArrayBuffer, size: number, name: string, priority: number): ACubismMotion {
      return CubismMotion.create(buffer, size, name, priority);
    }

    /**
     * 加载面部表情数据
     * @param buffer 读取exp文件的缓冲区
     * @param size 缓冲区大小
     * @param name 面部表情名称
     */
    public loadExpression(buffer: ArrayBuffer, size: number, name: string): ACubismMotion {
      return CubismExpressionMotion.create(buffer, size);
    }

    /**
     * 读取pose数据
     * @param buffer 加载pose3.json的缓冲区
     * @param size 缓冲区大小
     */
    public loadPose(buffer: ArrayBuffer, size: number): void {
      this._pose = CubismPose.create(buffer, size);
    }

    /**
     * 加载附加到模型的用户数据
     * @param buffer 读取userdata3.json的缓冲区
     * @param size 缓冲区大小
     */
    public loadUserData(buffer: ArrayBuffer, size: number): void {
      this._modelUserData = CubismModelUserData.create(buffer, size);
    }

    /**
     * 读物理数据
     * @param buffer  加载physics3.json的缓冲区
     * @param size    缓冲区大小
     */
    public loadPhysics(buffer: ArrayBuffer, size: number): void {
      this._physics = CubismPhysics.create(buffer, size);
    }

    /**
     * 得到命中判断
     * @param drawableId 要验证的Drawable的ID
     * @param pointX X位置
     * @param pointY Y位置
     * @return true 它已被打
     * @return false 没打
     */
    public isHit(drawableId: CubismIdHandle, pointX: number, pointY: number): boolean {
      const drawIndex: number = this._model.getDrawableIndex(drawableId);
      if (drawIndex < 0) {
        return false; // 如果不存在则为false
      }

      const count: number = this._model.getDrawableVertexCount(drawIndex);
      const vertices: Float32Array = this._model.getDrawableVertices(drawIndex);

      let left: number = vertices[0];
      let right: number = vertices[0];
      let top: number = vertices[1];
      let bottom: number = vertices[1];

      for (let j: number = 1; j < count; ++j) {
        const x = vertices[Constant.vertexOffset + j * Constant.vertexStep];
        const y = vertices[Constant.vertexOffset + j * Constant.vertexStep + 1];

        if (x < left) {
          left = x; // Min x
        }

        if (x > right) {
          right = x; // Max x
        }

        if (y < top) {
          top = y; // Min y
        }

        if (y > bottom) {
          bottom = y; // Max y
        }
      }

      const tx: number = this._modelMatrix.invertTransformX(pointX);
      const ty: number = this._modelMatrix.invertTransformY(pointY);

      return ((left <= tx) && (tx <= right) && (top <= ty) && (ty <= bottom));
    }

    /**
     * 获得模型
     * @return 模型
     */
    public getModel(): CubismModel {
      return this._model;
    }

    /**
     * 获取渲染器
     * @return 渲染器
     */
    public getRenderer(): CubismRenderer_WebGL {
      return this._renderer;
    }

    /**
     * 创建渲染器并执行初始化
     */
    public createRenderer(): void {
      if (this._renderer) {
        this.deleteRenderer();
      }

      this._renderer = new CubismRenderer_WebGL();
      this._renderer.initialize(this._model);
    }

    /**
     * 渲染器释放
     */
    public deleteRenderer(): void {
      if (this._renderer != null) {
        this._renderer.release();
        this._renderer = null as any;
      }
    }

    /**
     * 事件发射时的标准处理
     *
     * 在播放处理期间发生事件时的处理。
     * 假设它被继承覆盖。
     * 如果未覆盖则记录输出。
     *
     * @param eventValue 已触发事件的字符串数据
     */
    public motionEventFired(eventValue: csmString): void {
      CubismLogInfo('{0}', eventValue.s);
    }

    /**
     * 处理等同于析构函数
     */
    public release() {
      if (this._motionManager != null) {
        this._motionManager.release();
        this._motionManager = null as any;
      }

      if (this._expressionManager != null) {
        this._expressionManager.release();
        this._expressionManager = null as any;
      }

      if (this._moc != null) {
        this._moc.deleteModel(this._model);
        this._moc.release();
        this._moc = null as any;
      }

      this._modelMatrix = null as any;

      CubismPose.delete(this._pose);
      CubismEyeBlink.delete(this._eyeBlink);
      CubismBreath.delete(this._breath);

      this._dragManager = null as any;

      CubismPhysics.delete(this._physics);
      CubismModelUserData.delete(this._modelUserData);

      this.deleteRenderer();
    }
  }

}
