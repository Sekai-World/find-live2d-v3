/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

import { Live2DCubismFramework as cubismmatrix44 } from './framework/math/cubismmatrix44';
import { Live2DCubismFramework as csmvector } from './framework/type/csmvector';
import Csm_csmVector = csmvector.csmVector;
import iterator = csmvector.iterator;
import Csm_CubismMatrix44 = cubismmatrix44.CubismMatrix44;

import { LAppModel } from './lappmodel';
import { LAppDefine } from './lappdefine';
import { LAppPal } from './lapppal';
import { canvas, LAppDelegate } from './lappdelegate';


export let s_instance: LAppLive2DManager = null as any;

/**
 * 在示例应用程序中管理CubismModel的类
 * 模型生成和销毁，点击事件处理，模型切换。
 */
export class LAppLive2DManager {
  /**
   * 返回类的实例（单例）。
   * 如果尚未创建实例，则会在内部创建实例。
   *
   * @return 一个类的实例
   */
  public static getInstance(): LAppLive2DManager {
    if (s_instance == null) {
      s_instance = new LAppLive2DManager();
    }

    return s_instance;
  }

  /**
   * 释放一个类的实例（单例）。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance = void 0 as any;
    }

    s_instance = null as any;
  }

  public _viewMatrix: Csm_CubismMatrix44;    // 用于模型绘制的视图矩阵
  public _models: Csm_csmVector<LAppModel>;  // 模型实例容器
  public _userModels: LAppModel[]; // 外部使用的model数组
  public delegate: LAppDelegate;

  /**
   * 构造函数
   */
  constructor() {
    this._viewMatrix = new Csm_CubismMatrix44();
    this._models = new Csm_csmVector<LAppModel>();
    this._userModels = [];
    this.delegate = LAppDelegate.getInstance();
  }

  public initDelegate(renderConfig?: { efficient: boolean, fps?: number }): boolean {
    if (this.delegate.initialize() == false) {
      return false;
    }
    this.delegate.startRender(renderConfig);
    return true;
  }

  /**
   * 返回当前场景中保存的模型。
   *
   * @param no 模型列表索引值
   * @return 返回模型的实例。 如果索引值超出范围，则返回NULL。
   */
  public getModel(nameOrIndex: string | number): LAppModel {
    if (typeof (nameOrIndex) === 'number' && nameOrIndex < this._models.getSize()) {
      return this._models.at(nameOrIndex);
    } else {
      for (let i: number = 0; i < this._models.getSize(); i++) {
        if (this._models.at(i)._modelName === nameOrIndex) {
          return this._models.at(i);
        }
      }
    }

    return null as any;
  }

  /**
   * 释放当前场景中保存的所有模型
   */
  public releaseAllModel(): Promise<void> {
    return new Promise((resolve) => {
      for (let i: number = 0; i < this._models.getSize(); i++) {
        this._models.at(i).release();
        this._models.set(i, null as any);
      }
      this._models.clear();
      resolve();
    });
  }

  /**
   * 释放指定模型
   */
  public releaseModel(modelName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!modelName) {
        reject('model [' + modelName + '] not found');
        return;
      }
      for (let ite: iterator<LAppModel> = this._models.begin(); ite.notEqual(this._models.end());) {
        if (ite.ptr()._modelName === modelName) {
          ite.ptr().release();
          ite = this._models.erase(ite);
          continue;
        }
        ite.preIncrement();
      }
      resolve(modelName);
    });
  }

  /**
   * 拖动屏幕的时候
   *
   * @param x 屏幕的X坐标
   * @param y 屏幕的Y坐标
   */
  public onDrag(x: number, y: number): void {
    for (let i: number = 0; i < this._models.getSize(); i++) {
      const model: LAppModel = this.getModel(i);
      if (model) {
        model.setDragging(x, y);
      }
    }
  }

  /**
   * 点按屏幕的时候
   *
   * @param x 屏幕的X坐标
   * @param y 屏幕的Y坐标
   */
  public onTap(x: number, y: number): void {
    if (LAppDefine.DebugLogEnable) {
      LAppPal.printLog('[APP]tap point: {x: {0} y: {1}}', x.toFixed(2), y.toFixed(2));
    }

    for (let i: number = 0; i < this._models.getSize(); i++) {
      if (this._models.at(i).hitTest(LAppDefine.HitAreaNameNose, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printLog('[APP]hit area: [{0}]', LAppDefine.HitAreaNameNose);
        }
        this._models.at(i).startRandomMotion(LAppDefine.MotionGroupTapNose, LAppDefine.PriorityNormal);
      } else if (this._models.at(i).hitTest(LAppDefine.HitAreaNameGem, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printLog('[APP]hit area: [{0}]', LAppDefine.HitAreaNameGem);
        }
        this._models.at(i).startRandomMotion(LAppDefine.MotionGroupTapGem, LAppDefine.PriorityNormal);
      } else if (this._models.at(i).hitTest(LAppDefine.HitAreaNameHead, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printLog('[APP]hit area: [{0}]', LAppDefine.HitAreaNameHead);
        }
        this._models.at(i).setRandomExpression();
      } else if (this._models.at(i).hitTest(LAppDefine.HitAreaNameBody, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printLog('[APP]hit area: [{0}]', LAppDefine.HitAreaNameBody);
        }
        this._models.at(i).startRandomMotion(LAppDefine.MotionGroupTapBody, LAppDefine.PriorityNormal);
      }
    }
  }

  /**
   * 更新屏幕时进行处理
   * 执行模型更新处理和绘图处理
   */
  public onUpdate(): void {
    let projection: Csm_CubismMatrix44 = new Csm_CubismMatrix44();

    if (this._viewMatrix != null) {
      projection.multiplyByMatrix(this._viewMatrix);
    }

    const saveProjection: Csm_CubismMatrix44 = projection.clone();
    const modelCount: number = this._models.getSize();

    for (let i: number = 0; i < modelCount; ++i) {
      const model: LAppModel = this.getModel(i);
      projection = saveProjection.clone();
      model.update();
      model.draw(projection); // 投影更改，因为它是通过引用传递的。
    }
  }

  /**
   * 切换场景
   * 在示例应用程序中，切换模型集。
   */
  public addModel(resource: { path: string, fileName: string, modelName: string, modelSize: number, textures: string[] }, batchLoad?: boolean): Promise<LAppModel | null> {
    return new Promise((resolve) => {
      if (LAppDefine.DebugLogEnable) {
        LAppPal.printLog('[APP]model {0}', resource.modelName);
      }
      let modelFileName = resource.fileName + '.model3.json';

      // this.releaseAllModel();
      let mdl = this.getModel(resource.modelName);
      if (mdl) {
        resolve(mdl);
      }
      let newModel = new LAppModel(resource, this.delegate);
      this._models.pushBack(newModel);
      newModel._batchLoad = (typeof (batchLoad) === 'boolean') ? batchLoad : false;
      newModel.loadAssets(resource.path, modelFileName, resource.modelName, resource.textures).then(() => {
        resolve(newModel);
      }).catch(() => {
        resolve(null);
      });
    });
  }

  public setDebugMode(mode: boolean) {
    LAppDefine.DebugMode = mode;
  }
}
