/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismframework } from './live2dcubismframework';
import { Live2DCubismFramework as icubismmodelsetting } from './icubismmodelsetting';
import { Live2DCubismFramework as cubismid } from './id/cubismid';
import { Live2DCubismFramework as cubismjson } from './utils/cubismjson';
import { Live2DCubismFramework as csmmap } from './type/csmmap';
import { Live2DCubismFramework as csmvector } from './type/csmvector';
import csmVector = csmvector.csmVector;
import csmMap = csmmap.csmMap;
import iterator = csmmap.iterator;
import CubismFramework = cubismframework.CubismFramework;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismJson = cubismjson.CubismJson;
import Value = cubismjson.Value;
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;


export namespace Live2DCubismFramework {
  /**
   * Model3Json键字符串
   */

  // JSON Keys
  const Version: string = 'Version';
  const FileReferences: string = 'FileReferences';
  const Groups: string = 'Groups';
  const Layout: string = 'Layout';
  const HitAreas: string = 'HitAreas';

  const Moc: string = 'Moc';
  const Textures: string = 'Textures';
  const Physics: string = 'Physics';
  const Pose: string = 'Pose';
  const Expressions: string = 'Expressions';
  const Motions: string = 'Motions';

  const UserData: string = 'UserData';
  const Name: string = 'Name';
  const FilePath: string = 'File';
  const Id: string = 'Id';
  const Ids: string = 'Ids';
  const Target: string = 'Target';

  // Motions
  const Idle: string = 'Idle';
  const TapBody: string = 'TapBody';
  const PinchIn: string = 'PinchIn';
  const PinchOut: string = 'PinchOut';
  const Shake: string = 'Shake';
  const FlickHead: string = 'FlickHead';
  const Parameter: string = 'Parameter';

  const SoundPath: string = 'Sound';
  const FadeInTime: string = 'FadeInTime';
  const FadeOutTime: string = 'FadeOutTime';

  // Layout
  const CenterX: string = 'CenterX';
  const CenterY: string = 'CenterY';
  const X: string = 'X';
  const Y: string = 'Y';
  const Width: string = 'Width';
  const Height: string = 'Height';

  const LipSync: string = 'LipSync';
  const EyeBlink: string = 'EyeBlink';

  const InitParameter: string = 'init_param';
  const InitPartsVisible: string = 'init_parts_visible';
  const Val: string = 'val';

  enum FrequestNode {
    FrequestNode_Groups,       // getRoot().getValueByString(Groups)
    FrequestNode_Moc,          // getRoot().getValueByString(FileReferences).getValueByString(Moc)
    FrequestNode_Motions,      // getRoot().getValueByString(FileReferences).getValueByString(Motions)
    FrequestNode_Expressions,  // getRoot().getValueByString(FileReferences).getValueByString(Expressions)
    FrequestNode_Textures,     // getRoot().getValueByString(FileReferences).getValueByString(Textures)
    FrequestNode_Physics,      // getRoot().getValueByString(FileReferences).getValueByString(Physics)
    FrequestNode_Pose,         // getRoot().getValueByString(FileReferences).getValueByString(Pose)
    FrequestNode_HitAreas,      // getRoot().getValueByString(HitAreas)
  }


  /**
   * Model3Json分析器
   *
   * 解析model3.json文件并获取值
   */
  export class CubismModelSettingJson extends ICubismModelSetting {


    private _json: CubismJson;
    private _jsonValue: csmVector<Value> = undefined as any;
    /**
     * 带参数的构造函数
     *
     * @param buffer    将Model3Json读取为字节数组的数据缓冲区
     * @param size      Model3Json的数据大小
     */
    public constructor(buffer: ArrayBuffer, size: number) {
      super();
      this._json = CubismJson.create(buffer, size) as any;

      if (this._json) {
        this._jsonValue = new csmVector<Value>();

        // 该顺序应与enum FrequestNode匹配
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(Groups));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(FileReferences).getValueByString(Moc));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(FileReferences).getValueByString(Motions));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(FileReferences).getValueByString(Expressions));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(FileReferences).getValueByString(Textures));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(FileReferences).getValueByString(Physics));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(FileReferences).getValueByString(Pose));
        this._jsonValue.pushBack(this._json.getRoot().getValueByString(HitAreas));
      }
    }

    /**
     * 释放
     */
    public release(): void {
      CubismJson.delete(this._json);

      this._jsonValue = null as any;
    }

    /**
     * 获取CubismJson对象
     *
     * @return CubismJson
     */
    public GetJson(): CubismJson {
      return this._json;
    }

    /**
     * 获取Moc文件的名称
     * @return Moc文件的名称
     */
    public getModelFileName(): string {
      if (!this.isExistModelFile()) {
        return '';
      }
      return this._jsonValue.at(FrequestNode.FrequestNode_Moc).getRawString();
    }

    /**
     * 获取模型使用的纹理数
     * @return 纹理数量
     */
    public getTextureCount(): number {
      if (!this.isExistTextureFiles()) {
        return 0;
      }
      return this._jsonValue.at(FrequestNode.FrequestNode_Textures).getSize();
    }

    /**
     * 获取纹理所在目录的名称
     * @return 纹理所在目录的名称
     */
    public getTextureDirectory(): string {
      return this._jsonValue.at(FrequestNode.FrequestNode_Textures).getRawString();
    }

    /**
     * 获取模型使用的纹理的名称
     * @param index 数组索引值
     * @return 纹理的名称
     */
    public getTextureFileName(index: number): string {
      return this._jsonValue.at(FrequestNode.FrequestNode_Textures).getValueByIndex(index).getRawString();
    }

    /**
     * 获取为模型设置的命中判断次数
     * @return 为模型设置的命中判断数
     */
    public getHitAreasCount(): number {
      if (!this.isExistHitAreas()) {
        return 0;
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_HitAreas).getSize();
    }

    /**
     * 获取为命中判断设置的ID
     *
     * @param index 数组索引
     * @return 为命中判断设置的ID
     */
    public getHitAreaId(index: number): CubismIdHandle {
      return CubismFramework.getIdManager().getId(this._jsonValue.at(FrequestNode.FrequestNode_HitAreas).getValueByIndex(index).getValueByString(Id).getRawString());
    }

    /**
     * 获取为命中判断设置的名称
     * @param index 数组索引值
     * @return 为命中判断设置的名称
     */
    public getHitAreaName(index: number): string {
      return this._jsonValue.at(FrequestNode.FrequestNode_HitAreas).getValueByIndex(index).getValueByString(Name).getRawString();
    }

    /**
     * 获取物理计算设置文件的名称
     * @return 物理计算设定文件的名称
     */
    public getPhysicsFileName(): string {
      if (!this.isExistPhysicsFile()) {
        return '';
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Physics).getRawString();
    }

    /**
     * 获取部件切换设置文件的名称
     * @return 部件切换设置文件的名称
     */
    public getPoseFileName(): string {
      if (!this.isExistPoseFile()) {
        return '';
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Pose).getRawString();
    }

    /**
     * 获取面部表情设置文件的数量
     * @return 面部表情设置文件的数量
     */
    public getExpressionCount(): number {
      if (!this.isExistExpressionFile()) {
        return 0;
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Expressions).getSize();
    }

    /**
     * 获取标识面部表情设置文件的名称（别名）
     * @param index 数组索引值
     * @return 面部表情名称
     */
    public getExpressionName(index: number): string {
      return this._jsonValue.at(FrequestNode.FrequestNode_Expressions).getValueByIndex(index).getValueByString(Name).getRawString();
    }

    /**
     * 获取面部表情设置文件的名称
     * @param index 数组索引值
     * @return 面部表情设置文件的名称
     */
    public getExpressionFileName(index: number): string {
      return this._jsonValue.at(FrequestNode.FrequestNode_Expressions).getValueByIndex(index).getValueByString(FilePath).getRawString();
    }

    /**
     * 获取运动组的数量
     * @return 运动组数量
     */
    public getMotionGroupCount(): number {
      if (!this.isExistMotionGroups()) {
        return 0;
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getKeys().getSize();
    }

    /**
     * 获取运动组的名称
     * @param index 数组索引值
     * @return 运动组的名称
     */
    public getMotionGroupName(index: number): string {
      if (!this.isExistMotionGroups()) {
        return null as any;
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getKeys().at(index);
    }

    /**
     * 获取运动组中的运动次数
     * @param groupName 运动组的名称
     * @return 运动组数量
     */
    public getMotionCount(groupName: string): number {
      if (!this.isExistMotionGroupName(groupName)) {
        return 0;
      }
      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getSize();
    }

    /**
     * 从组名和索引值中获取动作文件名
     * @param groupName 运动组的名称
     * @param index     数组索引值
     * @return 动画文件的名称
     */
    public getMotionFileName(groupName: string, index: number): string {
      if (!this.isExistMotionGroupName(groupName)) {
        return '';
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(FilePath).getRawString();
    }

    /**
     * 获取与动作对应的声音文件的名称
     * @param groupName 运动组的名称
     * @param index 数组索引值
     * @return 声音文件的名称
     */
    public getMotionSoundFileName(groupName: string, index: number): string {
      if (!this.isExistMotionSoundFile(groupName, index)) {
        return '';
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(SoundPath).getRawString();
    }

    /**
     * 在动作开始时获得淡入处理时间
     * @param groupName 运动组的名称
     * @param index 数组索引值
     * @return 淡入处理时间[秒]
     */
    public getMotionFadeInTimeValue(groupName: string, index: number): number {
      if (!this.isExistMotionFadeIn(groupName, index)) {
        return -1.0;
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(FadeInTime).toFloat();
    }

    /**
     * 在运动结束时获得淡出处理时间
     * @param groupName 运动组的名称
     * @param index 数组索引值
     * @return 淡出处理时间[秒]
     */
    public getMotionFadeOutTimeValue(groupName: string, index: number): number {
      if (!this.isExistMotionFadeOut(groupName, index)) {
        return -1.0;
      }

      return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(FadeOutTime).toFloat();
    }

    /**
     * 获取用户数据文件名
     * @return 用户数据文件名
     */
    public getUserDataFile(): string {
      if (!this.isExistUserDataFile()) {
        return '';
      }

      return this._json.getRoot().getValueByString(FileReferences).getValueByString(UserData).getRawString();
    }

    /**
     * 获取布局信息
     * @param outLayoutMap csmMap类实例
     * @return true 存在布局信息
     * @return false 不存在布局信息
     */
    public getLayoutMap(outLayoutMap: csmMap<string, number>): boolean {
      // 如果访问了不存在的元素，则会发生错误，因此如果Value为null，则赋值为null
      const map: csmMap<string, Value> = this._json.getRoot().getValueByString(Layout).getMap();

      if (map == null) {
        return false;
      }

      let ret: boolean = false;

      for (const ite: iterator<string, Value> = map.begin(); ite.notEqual(map.end()); ite.preIncrement()) {
        outLayoutMap.setValue(ite.ptr().first, ite.ptr().second.toFloat());
        ret = true;
      }

      return ret;
    }

    /**
     * 获取与眼贴相关的参数数量
     * @return 与眼贴相关的参数数量
     */
    public getEyeBlinkParameterCount(): number {
      if (!this.isExistEyeBlinkParameters()) {
        return 0;
      }

      let num: number = 0;
      for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
        const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
        if (refI.isNull() || refI.isError()) {
          continue;
        }

        if (refI.getValueByString(Name).getRawString() == EyeBlink) {
          num = refI.getValueByString(Ids).getVector().getSize();
          break;
        }
      }

      return num;
    }

    /**
     * 获取与眼贴相关的参数的ID
     * @param index 数组索引值
     * @return 参数ID
     */
    public getEyeBlinkParameterId(index: number): CubismIdHandle {
      if (!this.isExistEyeBlinkParameters()) {
        return null as any;
      }

      for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
        const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
        if (refI.isNull() || refI.isError()) {
          continue;
        }

        if (refI.getValueByString(Name).getRawString() == EyeBlink) {
          return CubismFramework.getIdManager().getId(refI.getValueByString(Ids).getValueByIndex(index).getRawString());
        }
      }
      return null as any;
    }

    /**
     * 获取与唇形同步相关的参数数量
     * @return 与唇形同步相关的参数数量
     */
    public getLipSyncParameterCount(): number {
      if (!this.isExistLipSyncParameters()) {
        return 0;
      }

      let num: number = 0;
      for (let i: number = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
        const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
        if (refI.isNull() || refI.isError()) {
          continue;
        }

        if (refI.getValueByString(Name).getRawString() == LipSync) {
          num = refI.getValueByString(Ids).getVector().getSize();
          break;
        }
      }

      return num;
    }

    /**
     * 获取与唇形同步相关的参数ID
     * @param index 数组索引值
     * @return 参数ID
     */
    public getLipSyncParameterId(index: number): CubismIdHandle {
      if (!this.isExistLipSyncParameters()) {
        return null as any;
      }

      for (let i: number = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
        const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
        if (refI.isNull() || refI.isError()) {
          continue;
        }

        if (refI.getValueByString(Name).getRawString() == LipSync) {
          return CubismFramework.getIdManager().getId(refI.getValueByString(Ids).getValueByIndex(index).getRawString());
        }
      }
      return null as any;
    }

    /**
     * 检查模型文件密钥是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistModelFile(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Moc);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查纹理文件密钥是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistTextureFiles(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Textures);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查命中判断键是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistHitAreas(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_HitAreas);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查物理文件密钥是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistPhysicsFile(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Physics);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查暂停设置文件的密钥是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistPoseFile(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Pose);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查面部表情设置文件的键是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistExpressionFile(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Expressions);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查运动组密钥是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistMotionGroups(): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Motions);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查参数中指定的运动组的键是否存在
     * @param groupName  组名
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistMotionGroupName(groupName: string): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查与参数中指定的运动相对应的声音文件密钥是否存在
     * @param groupName  组名
     * @param index 数组索引值
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistMotionSoundFile(groupName: string, index: number): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(SoundPath);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查是否存在与参数中指定的运动相对应的淡入时间键
     * @param groupName  组名
     * @param index 数组索引值
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistMotionFadeIn(groupName: string, index: number): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(FadeInTime);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查是否存在与参数中指定的运动相对应的淡出时间键
     * @param groupName  组名
     * @param index 数组索引值
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistMotionFadeOut(groupName: string, index: number): boolean {
      const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Motions).getValueByString(groupName).getValueByIndex(index).getValueByString(FadeOutTime);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查UserData文件名是否存在
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistUserDataFile(): boolean {
      const node: Value = this._json.getRoot().getValueByString(FileReferences).getValueByString(UserData);
      return !node.isNull() && !node.isError();
    }

    /**
     * 检查是否有与眼贴相关的参数
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistEyeBlinkParameters(): boolean {
      if (this._jsonValue.at(FrequestNode.FrequestNode_Groups).isNull() || this._jsonValue.at(FrequestNode.FrequestNode_Groups).isError()) {
        return false;
      }

      for (let i: number = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); ++i) {
        if (this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i).getValueByString(Name).getRawString() == EyeBlink) {
          return true;
        }
      }

      return false;
    }

    /**
     * 检查是否存在与唇形同步相关的参数
     * @return true 密钥存在
     * @return false 密钥不存在
     */
    private isExistLipSyncParameters(): boolean {
      if (this._jsonValue.at(FrequestNode.FrequestNode_Groups).isNull() || this._jsonValue.at(FrequestNode.FrequestNode_Groups).isError()) {
        return false;
      }
      for (let i: number = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); ++i) {
        if (this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i).getValueByString(Name).getRawString() == LipSync) {
          return true;
        }
      }
      return false;
    }
  }
}
