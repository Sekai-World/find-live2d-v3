/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

export class TouchManager {


  public _startY: number;            // 触摸开始时的X值
  public _startX: number;            // 触摸开始时的Y值
  public _lastX: number;             // 单触的X值
  public _lastY: number;             // 单触的Y值
  public _lastX1: number;            // 双触摸时的第一个x值
  public _lastY1: number;            // 双触摸时的第一个y值
  public _lastX2: number;            // 双触后的第二个x值
  public _lastY2: number;            // 双触后的第二个y值
  public _lastTouchDistance: number; // 用两个或更多个触摸时的手指距离
  public _deltaX: number;            // 从前一个值到当前值的x行程距离。
  public _deltaY: number;            // 从前一个值到当前值的y行程距离。
  public _scale: number;             // 放大倍数乘以此值。 除了缩放操作时都是1。
  public _touchSingle: boolean;      // 是否单点触控
  public _flipAvailable: boolean;    // 是否启用翻转
  /**
   * 构造函数
   */
  constructor() {
    this._startX = 0.0;
    this._startY = 0.0;
    this._lastX = 0.0;
    this._lastY = 0.0;
    this._lastX1 = 0.0;
    this._lastY1 = 0.0;
    this._lastX2 = 0.0;
    this._lastY2 = 0.0;
    this._lastTouchDistance = 0.0;
    this._deltaX = 0.0;
    this._deltaY = 0.0;
    this._scale = 1.0;
    this._touchSingle = false;
    this._flipAvailable = false;
  }

  public getCenterX(): number {
    return this._lastX;
  }

  public getCenterY(): number {
    return this._lastY;
  }

  public getDeltaX(): number {
    return this._deltaX;
  }

  public getDeltaY(): number {
    return this._deltaY;
  }

  public getStartX(): number {
    return this._startX;
  }

  public getStartY(): number {
    return this._startY;
  }

  public getScale(): number {
    return this._scale;
  }

  public getX(): number {
    return this._lastX;
  }

  public getY(): number {
    return this._lastY;
  }

  public getX1(): number {
    return this._lastX1;
  }

  public getY1(): number {
    return this._lastY1;
  }

  public getX2(): number {
    return this._lastX2;
  }

  public getY2(): number {
    return this._lastY2;
  }

  public isSingleTouch(): boolean {
    return this._touchSingle;
  }

  public isFlickAvailable(): boolean {
    return this._flipAvailable;
  }

  public disableFlick(): void {
    this._flipAvailable = false;
  }

  /**
   * 触摸开始事件
   * @param deviceX 触摸屏幕的X值
   * @param deviceY 触摸屏幕的Y值
   */
  public touchesBegan(deviceX: number, deviceY: number): void {
    this._lastX = deviceX;
    this._lastY = deviceY;
    this._startX = deviceX;
    this._startY = deviceY;
    this._lastTouchDistance = -1.0;
    this._flipAvailable = true;
    this._touchSingle = true;
  }

  /**
   * 拖动事件
   * @param deviceX 触摸屏幕的X值
   * @param deviceY 触摸屏幕的Y值
   */
  public touchesMoved(deviceX: number, deviceY: number): void {
    this._lastX = deviceX;
    this._lastY = deviceY;
    this._lastTouchDistance = -1.0;
    this._touchSingle = true;
  }

  /**
   * 距离计算
   * @return 移动距离
   */
  public getFlickDistance(): number {
    return this.calculateDistance(this._startX, this._startY, this._lastX, this._lastY);
  }

  /**
   * 找到从第1点到第2点的距离
   *
   * @param x1 第一个触摸屏幕的X值
   * @param y1 第一个触摸屏幕的Y值
   * @param x2 第二个触摸屏的X值
   * @param y2 第二个触摸屏的Y值
   */
  public calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  /**
   * 从第二值获得移动量。
   * 如果方向不同，则移动量为0。 如果方向相同，请参考具有较小绝对值的值。。
   *
   * @param v1 第一次移动量
   * @param v2 第二次移动量
   *
   * @return 较小的移动量
   */
  public calculateMovingAmount(v1: number, v2: number): number {
    if ((v1 > 0.0) != (v2 > 0.0)) {
      return 0.0;
    }

    const sign: number = v1 > 0.0 ? 1.0 : -1.0;
    const absoluteValue1 = Math.abs(v1);
    const absoluteValue2 = Math.abs(v2);
    return sign * ((absoluteValue1 < absoluteValue2) ? absoluteValue1 : absoluteValue2);
  }
}
