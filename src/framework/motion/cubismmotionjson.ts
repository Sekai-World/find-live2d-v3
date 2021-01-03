/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismjson } from '../utils/cubismjson';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import csmString = csmstring.csmString;
import CubismFramework = cubismframework.CubismFramework;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismJson = cubismjson.CubismJson;

export namespace Live2DCubismFramework {
  // JSON keys
  const Meta: string = 'Meta';
  const Duration: string = 'Duration';
  const Loop: string = 'Loop';
  const CurveCount: string = 'CurveCount';
  const Fps: string = 'Fps';
  const TotalSegmentCount: string = 'TotalSegmentCount';
  const TotalPointCount: string = 'TotalPointCount';
  const Curves: string = 'Curves';
  const Target: string = 'Target';
  const Id: string = 'Id';
  const FadeInTime: string = 'FadeInTime';
  const FadeOutTime: string = 'FadeOutTime';
  const Segments: string = 'Segments';
  const UserData: string = 'UserData';
  const UserDataCount: string = 'UserDataCount';
  const TotalUserDataSize: string = 'TotalUserDataSize';
  const Time: string = 'Time';
  const Value: string = 'Value';

  /**
   * motion3.json的容器。
   */
  export class CubismMotionJson {

    public _json: CubismJson;  // motion3.json数据
    /**
     * 构造函数
     * @param buffer 缓冲区，其中加载了motion3.json
     * @param size 缓冲区大小
     */
    public constructor(buffer: ArrayBuffer, size: number) {
      this._json = CubismJson.create(buffer, size) as any;
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      CubismJson.delete(this._json);
    }

    /**
     * 得到动作的长度
     * @return 动作长度[秒]
     */
    public getMotionDuration(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(Duration).toFloat();
    }

    /**
     * 获取运动循环信息
     * @return true 循環
     * @return false 不循環
     */
    public isMotionLoop(): boolean {
      return this._json.getRoot().getValueByString(Meta).getValueByString(Loop).toBoolean();
    }

    /**
     * 获取运动曲线的数量
     * @return 运动曲线数量
     */
    public getMotionCurveCount(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(CurveCount).toInt();
    }

    /**
     * 获取帧速率
     * @return 帧率[FPS]
     */
    public getMotionFps(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(Fps).toFloat();
    }

    /**
     * 获得动作片段的总计
     * @return 得到一段动作
     */
    public getMotionTotalSegmentCount(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(TotalSegmentCount).toInt();
    }

    /**
     * 获得运动曲线的控制点总数
     * @return 运动曲线的控制点总数
     */
    public getMotionTotalPointCount(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(TotalPointCount).toInt();
    }

    /**
     * 运动淡入时间的存在
     * @return true 存在
     * @return false 不存在
     */
    public isExistMotionFadeInTime(): boolean {
      return !this._json.getRoot().getValueByString(Meta).getValueByString(FadeInTime).isNull();
    }

    /**
     * 运动淡出时间的存在
     * @return true 存在
     * @return false 不存在
     */
    public isExistMotionFadeOutTime(): boolean {
      return !this._json.getRoot().getValueByString(Meta).getValueByString(FadeOutTime).isNull();
    }

    /**
     * 获取动画淡入时间
     * @return 淡入时间[秒]
     */
    public getMotionFadeInTime(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(FadeInTime).toFloat();
    }

    /**
     * 获得动作淡出时间
     * @return 淡出时间[秒]
     */
    public getMotionFadeOutTime(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(FadeOutTime).toFloat();
    }

    /**
     * 获取运动曲线类型
     * @param curveIndex 曲线指数
     * @return 曲线类型
     */
    public getMotionCurveTarget(curveIndex: number): string {
      return this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(Target).getRawString();
    }

    /**
     * 获取运动曲线ID
     * @param curveIndex 曲线索引
     * @return 曲线的ID
     */
    public getMotionCurveId(curveIndex: number): CubismIdHandle {
      return CubismFramework.getIdManager().getId(this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(Id).getRawString());
    }

    /**
     * 存在运动曲线淡入时间
     * @param curveIndex 曲线索引
     * @return true 存在
     * @return false 不存在
     */
    public isExistMotionCurveFadeInTime(curveIndex: number): boolean {
      return !this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(FadeInTime).isNull();
    }

    /**
     * 存在运动曲线淡出时间
     * @param curveIndex 曲线索引
     * @return true 存在
     * @return false 不存在
     */
    public isExistMotionCurveFadeOutTime(curveIndex: number): boolean {
      return !this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(FadeOutTime).isNull();
    }

    /**
     * 获得运动曲线的淡入时间
     * @param curveIndex 曲线索引
     * @return 淡入时间[秒]
     */
    public getMotionCurveFadeInTime(curveIndex: number): number {
      return this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(FadeInTime).toFloat();
    }

    /**
     * 获得运动曲线的淡出时间
     * @param curveIndex 曲线索引
     * @return 淡出时间[秒]
     */
    public getMotionCurveFadeOutTime(curveIndex: number): number {
      return this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(FadeOutTime).toFloat();
    }

    /**
     * 获取运动曲线的分段数
     * @param curveIndex 曲线索引
     * @return 运动曲线段数
     */
    public getMotionCurveSegmentCount(curveIndex: number): number {
      return this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(Segments).getVector().getSize();
    }

    /**
     * 获取运动曲线的分段值
     * @param curveIndex 曲线索引
     * @param segmentIndex 细分指数
     * @return 细分值
     */
    public getMotionCurveSegment(curveIndex: number, segmentIndex: number): number {
      return this._json.getRoot().getValueByString(Curves).getValueByIndex(curveIndex).getValueByString(Segments).getValueByIndex(segmentIndex).toFloat();
    }

    /**
     * 获取事件数量
     * @return 事件数量
     */
    public getEventCount(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(UserDataCount).toInt();
    }

    /**
     *  获取活动的总字符数
     * @return 事件中的字符总数
     */
    public getTotalEventValueSize(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(TotalUserDataSize).toInt();
    }

    /**
     * 获取活动时间
     * @param userDataIndex 事件索引
     * @return 活动时间[秒]
     */
    public getEventTime(userDataIndex: number): number {
      return this._json.getRoot().getValueByString(UserData).getValueByIndex(userDataIndex).getValueByString(Time).toInt();
    }

    /**
     * 获得活动
     * @param userDataIndex 事件索引
     * @return 事件字符串
     */
    public getEventValue(userDataIndex: number): csmString {
      return new csmString(this._json.getRoot().getValueByString(UserData).getValueByIndex(userDataIndex).getValueByString(Value).getRawString());
    }
  }
}
