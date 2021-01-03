/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismmath } from './cubismmath';
import CubismMath = cubismmath.CubismMath;


export namespace Live2DCubismFramework {
  const FrameRate: number = 30;
  const Epsilon: number = 0.01;

  /**
   * 面部定向控制功能
   *
   * 提供面部方向控制功能的类
   */
  export class CubismTargetPoint {


    private _faceTargetX: number;       // 面部方向的X目标值（接近此值）
    private _faceTargetY: number;       // 面部方向的Y目标值（接近此值）
    private _faceX: number;             // 面朝X（-1.0到1.0）
    private _faceY: number;             // 面朝Y（-1.0到1.0）
    private _faceVX: number;            // 面部方向改变速度X.
    private _faceVY: number;            // 面部方向改变速度Y.
    private _lastTimeSeconds: number;   // 上次执行时间[秒]
    private _userTimeSeconds: number;   // 增量时间的综合值[秒]
    /**
     * 构造函数
     */
    public constructor() {
      this._faceTargetX = 0.0;
      this._faceTargetY = 0.0;
      this._faceX = 0.0;
      this._faceY = 0.0;
      this._faceVX = 0.0;
      this._faceVY = 0.0;
      this._lastTimeSeconds = 0.0;
      this._userTimeSeconds = 0.0;
    }

    /**
     * 更新过程
     */
    public update(deltaTimeSeconds: number): void {
      // 添加增量时间
      this._userTimeSeconds += deltaTimeSeconds;

      // 从一侧到另一侧摆动颈部时的平均速度是第二速度。 考虑加速度和减速度，使最大速度加倍
      // 从中心（0.0）左右摆动（+ -1.0)
      const faceParamMaxV: number = 40.0 / 10.0;              // 在7.5秒内移动40分钟（5.3 / sc）
      const maxV: number = faceParamMaxV * 1.0 / FrameRate;   // 每帧可以更改的最大速度

      if (this._lastTimeSeconds == 0.0) {
        this._lastTimeSeconds = this._userTimeSeconds;
        return;
      }

      const deltaTimeWeight: number = (this._userTimeSeconds - this._lastTimeSeconds) * FrameRate;
      this._lastTimeSeconds = this._userTimeSeconds;

      // 是时候达到最高速度了
      const timeToMaxSpeed: number = 0.15;
      const frameToMaxSpeed: number = timeToMaxSpeed * FrameRate;     // sec * frame/sec
      const maxA: number = deltaTimeWeight * maxV / frameToMaxSpeed;  // 每帧加速度

      // 目标方向是（dx，dy）方向的矢量
      const dx: number = this._faceTargetX - this._faceX;
      const dy: number = this._faceTargetY - this._faceY;

      if (CubismMath.abs(dx) <= Epsilon && CubismMath.abs(dy) <= Epsilon) {
        return; // 没有变化
      }

      // 如果大于最大速度，则降低速度
      const d: number = CubismMath.sqrt((dx * dx) + (dy * dy));

      // 行进方向上的最大速度矢量
      const vx: number = maxV * dx / d;
      const vy: number = maxV * dy / d;

      // 找到从当前速度到新速度的变化（加速度）
      let ax: number = vx - this._faceVX;
      let ay: number = vy - this._faceVY;

      const a: number = CubismMath.sqrt((ax * ax) + (ay * ay));

      // 加速时
      if (a < -maxA || a > maxA) {
        ax *= maxA / a;
        ay *= maxA / a;
      }

      // 将加速度添加到原始速度以获得新速度
      this._faceVX += ax;
      this._faceVY += ay;

      // 处理在接近目标方向时平滑减速
      // 从距离和速度之间的关系可以停止在设定的加速度
      // 计算现在可以采取的最大速度，并在超过该速度时降低速度
      // ※最初，人类可以通过肌肉力量调整力（加速度），因此它们具有更高的自由度，但是简单的处理就足够了。
      {
        // 加速度，速度和距离的关系表达式
        //            2  6           2               3
        //      sqrt(a  t  + 16 a h t  - 8 a h) - a t
        // v = --------------------------------------
        //                    2
        //                 4 t  - 2
        // (t=1)
        // 	在时间t，加速度和速度被预先设置为1/60（帧速率，无单位）。
        // 	我们认为，可以删除t = 1（*未经验证）

        const maxV: number = 0.5 * (CubismMath.sqrt((maxA * maxA) + 16.0 * maxA * d - 8.0 * maxA * d) - maxA);
        const curV: number = CubismMath.sqrt((this._faceVX * this._faceVX) + (this._faceVY * this._faceVY));

        if (curV > maxV) {
          // 如果当前速度>最大速度，则减速到最大速度
          this._faceVX *= maxV / curV;
          this._faceVY *= maxV / curV;
        }
      }

      this._faceX += this._faceVX;
      this._faceY += this._faceVY;
    }

    /**
     * 在X轴上获取面部方向值
     *
     * @return X轴面定向值（-1.0到1.0）
     */
    public getX(): number {
      return this._faceX;
    }

    /**
     * 在Y轴上获取面部方向值
     *
     * @return Y轴面定向值（-1.0到1.0)
     */
    public getY(): number {
      return this._faceY;
    }

    /**
     * 设置面部方向的目标值
     *
     * @param x X轴面定向值（-1.0到1.0）
     * @param y Y轴面定向值（-1.0到1.0）
     */
    public set(x: number, y: number): void {
      this._faceTargetX = x;
      this._faceTargetY = y;
    }

  }
}
