/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

import { Live2DCubismFramework as cubismMatrix44 } from './framework/math/cubismmatrix44';
import { Live2DCubismFramework as cubismviewmatrix } from './framework/math/cubismviewmatrix';
import Csm_CubismViewMatrix = cubismviewmatrix.CubismViewMatrix;
import Csm_CubismMatrix44 = cubismMatrix44.CubismMatrix44;
import { TouchManager } from './touchmanager';
import { LAppDefine } from './lappdefine';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppDelegate, canvas, gl } from './lappdelegate';
import { LAppSprite } from './lappsprite';
import { TextureInfo } from './lapptexturemanager';
import { LAppPal } from './lapppal';

/**
 * 页面视图。
 */
export class LAppView {

  public _touchManager: TouchManager;            // 触摸管理器
  public _deviceToScreen: Csm_CubismMatrix44;    // 设备坐标转换为屏幕坐标的矩阵
  public _viewMatrix: Csm_CubismViewMatrix;      // 用于缩放屏幕显示和转换运动的矩阵
  public _programId: WebGLProgram;               // 着色器ID
  public _back: LAppSprite;                      // 背景图像
  public _gear: LAppSprite;                      // 齿轮图像
  public _changeModel: boolean = false;                  // 模型切换标志
  public _isClick: boolean = false;                      // 点击
  /**
   * 构造函数
   */
  constructor() {
    this._programId = null as any;
    this._back = null as any;
    this._gear = null as any;

    // 与触摸相关的事件管理
    this._touchManager = new TouchManager();

    // 用于从设备坐标转换为屏幕坐标
    this._deviceToScreen = new Csm_CubismMatrix44();

    // 用于缩放屏幕显示和转换运动的矩阵
    this._viewMatrix = new Csm_CubismViewMatrix();
  }

  /**
   * 初始化。
   */
  public initialize(): void {
    let width: number, height: number;
    width = canvas.width;
    height = canvas.height;

    const ratio: number = height / width;
    const left: number = LAppDefine.ViewLogicalLeft;
    const right: number = LAppDefine.ViewLogicalRight;
    const bottom: number = -ratio;
    const top: number = ratio;

    this._viewMatrix.setScreenRect(left, right, bottom, top);   // 与设备对应的屏幕范围。 X左边缘，X右边缘，Y底边缘，Y顶边缘

    const screenW: number = Math.abs(left - right);
    this._deviceToScreen.scaleRelative(screenW / width, -screenW / width);
    this._deviceToScreen.translateRelative(-width * 0.5, -height * 0.5);

    // 设置显示范围
    this._viewMatrix.setMaxScale(LAppDefine.ViewMaxScale); // 最大缩放
    this._viewMatrix.setMinScale(LAppDefine.ViewMinScale); // 最小缩放

    // 可显示的最大范围
    this._viewMatrix.setMaxScreenRect(
      LAppDefine.ViewLogicalMaxLeft,
      LAppDefine.ViewLogicalMaxRight,
      LAppDefine.ViewLogicalMaxBottom,
      LAppDefine.ViewLogicalMaxTop,
    );
  }

  /**
   * 释放
   */
  public release(): void {
    this._viewMatrix = null as any;
    this._touchManager = null as any;
    this._deviceToScreen = null as any;

    this._gear.release();
    this._gear = null as any;

    this._back.release();
    this._back = null as any;

    gl.deleteProgram(this._programId);
    this._programId = null as any;
  }

  /**
   * 绘制。
   */
  public render(): void {
    gl.useProgram(this._programId);
    // 背景图像
    // if (this._back) {
    //   this._back.render(this._programId);
    // }
    // 齿轮
    // if (this._gear) {
    //   this._gear.render(this._programId);
    // }

    gl.flush();

    const live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();

    live2DManager.onUpdate();
  }

  /**
   * 执行图像初始化。
   */
  public initializeSprite(): void {
    const width: number = canvas.width;
    const height: number = canvas.height;

    const textureManager = LAppDelegate.getInstance().getTextureManager();
    const resourcesPath = LAppDefine.ResourcesPath;

    let imageName: string = '';

    // 背景图像初始化
    // imageName = LAppDefine.BackImageName;

    // // 创建一个回调函数，因为它是异步的
    // const initBackGroundTexture = (textureInfo: TextureInfo): void => {
    //   const x: number = width * 0.5;
    //   const y: number = height * 0.5;

    //   const fwidth = textureInfo.width * 2.0;
    //   const fheight = height * 0.95;
    //   this._back = new LAppSprite(x, y, fwidth, fheight, textureInfo.id);
    // };

    // textureManager.createTextureFromPngFile(resourcesPath + imageName, false, initBackGroundTexture);

    // // 齿轮图像初始化
    // imageName = LAppDefine.GearImageName;
    // const initGearTexture = (textureInfo: TextureInfo): void => {
    //   const x = width - textureInfo.width * 0.5;
    //   const y = height - textureInfo.height * 0.5;
    //   const fwidth = textureInfo.width;
    //   const fheight = textureInfo.height;
    //   this._gear = new LAppSprite(x, y, fwidth, fheight, textureInfo.id);
    // };

    // textureManager.createTextureFromPngFile(resourcesPath + imageName, false, initGearTexture);

    // 创建着色器
    if (this._programId == null) {
      this._programId = LAppDelegate.getInstance().createShader();
    }
  }

  /**
   * 触摸时调用。
   *
   * @param pointX 屏幕X坐标
   * @param pointY 屏幕Y坐标
   */
  public onTouchesBegan(pointX: number, pointY: number): void {
    this._touchManager.touchesBegan(pointX, pointY);
  }

  /**
   * 触摸移动时调用。
   *
   * @param pointX 屏幕X坐标
   * @param pointY 屏幕Y坐标
   */
  public onTouchesMoved(pointX: number, pointY: number): void {
    const viewX: number = this.transformViewX(this._touchManager.getX());
    const viewY: number = this.transformViewY(this._touchManager.getY());
    this._touchManager.touchesMoved(pointX, pointY);
    const live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();
    live2DManager.onDrag(viewX, viewY);
  }

  /**
   * 触摸完成后调用。
   *
   * @param pointX 屏幕X坐标
   * @param pointY 屏幕Y坐标
   */
  public onTouchesEnded(pointX: number, pointY: number): void {
    // 触摸结束
    const live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();
    live2DManager.onDrag(0.0, 0.0);

    {
      // 单击
      const x: number = this._deviceToScreen.transformX(this._touchManager.getX()); // 获取逻辑坐标变换坐标。
      const y: number = this._deviceToScreen.transformY(this._touchManager.getY()); // 获取逻辑坐标变换坐标。

      if (LAppDefine.DebugTouchLogEnable) {
        LAppPal.printLog('[APP]touchesEnded x: {0} y: {1}', x, y);
      }
      live2DManager.onTap(x, y);

      // 敲击齿轮
      if (this._gear && this._gear.isHit(pointX, pointY)) {
        LAppPal.printLog('[APP]click gear x: {0} y: {1}', pointX, pointY);
        // live2DManager.nextScene();
      }
    }
  }

  /**
   * 将X坐标转换为View坐标。
   *
   * @param deviceX 设备X坐标
   */
  public transformViewX(deviceX: number): number {
    const screenX: number = this._deviceToScreen.transformX(deviceX); // 获取逻辑坐标变换坐标。
    return this._viewMatrix.invertTransformX(screenX);  // 放大，缩小和移动后的值
  }

  /**
   * 将Y坐标转换为View坐标。
   *
   * @param deviceY 设备Y坐标
   */
  public transformViewY(deviceY: number): number {
    const screenY: number = this._deviceToScreen.transformY(deviceY); // 获取逻辑坐标变换坐标。
    return this._viewMatrix.invertTransformY(screenY);
  }

  /**
   * 将X坐标转换为屏幕坐标。
   * @param deviceX 设备X坐标
   */
  public transformScreenX(deviceX: number): number {
    return this._deviceToScreen.transformX(deviceX);
  }

  /**
   * 将Y坐标转换为屏幕坐标。
   *
   * @param deviceY 设备Y坐标
   */
  public transformScreenY(deviceY: number): number {
    return this._deviceToScreen.transformY(deviceY);
  }
}
