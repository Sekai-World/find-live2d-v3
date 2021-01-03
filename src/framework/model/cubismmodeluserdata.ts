/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

import { Live2DCubismFramework as cubismmodeluserdatajson } from './cubismmodeluserdatajson';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import CubismFramework = cubismframework.CubismFramework;
import csmVector = csmvector.csmVector;
import csmString = csmstring.csmString;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismModelUserDataJson = cubismmodeluserdatajson.CubismModelUserDataJson;

export namespace Live2DCubismFramework {
  const ArtMesh: string = 'ArtMesh';

  /**
   * 用户数据界面
   *
   * 记录从Json读取的用户数据的结构
   */
  export class CubismModelUserDataNode {
    public targetType: CubismIdHandle = undefined as any;   // 用户数据目标类型
    public targetId: CubismIdHandle = undefined as any;   // 用户数据目标ID
    public value: csmString = undefined as any;  // 用户数据
  }

  /**
   * 用户数据管理类
   *
   * 加载，管理，搜索界面和发布用户数据
   */
  export class CubismModelUserData {
    /**
     * 创建实例
     *
     * @param buffer    加载userdata3.json的缓冲区
     * @param size      缓冲区大小
     * @return 创建实例
     */
    public static create(buffer: ArrayBuffer, size: number): CubismModelUserData {
      const ret: CubismModelUserData = new CubismModelUserData();

      ret.parseUserData(buffer, size);

      return ret;
    }

    /**
     * 销毁实例
     *
     * @param modelUserData 毁灭的实例
     */
    public static delete(modelUserData: CubismModelUserData): void {
      if (modelUserData != null) {
        modelUserData.release();
        modelUserData = null as any;
      }
    }

    private _userDataNodes: csmVector<CubismModelUserDataNode>;          // 用户数据结构数组
    private _artMeshUserDataNode: csmVector<CubismModelUserDataNode>;    // 继续阅读清单

    /**
     * 构造函数
     */
    public constructor() {
      this._userDataNodes = new csmVector<CubismModelUserDataNode>();
      this._artMeshUserDataNode = new csmVector<CubismModelUserDataNode>();
    }

    /**
     * 获取ArtMesh用户数据列表
     *
     * @return 用户数据列表
     */
    public getArtMeshUserDatas(): csmVector<CubismModelUserDataNode> {
      return this._artMeshUserDataNode;
    }

    /**
     * userdata3.json解析
     *
     * @param buffer    读取userdata3.json的缓冲区
     * @param size      缓冲区大小
     */
    public parseUserData(buffer: ArrayBuffer, size: number): void {
      let json: CubismModelUserDataJson = new CubismModelUserDataJson(buffer, size);

      const typeOfArtMesh = CubismFramework.getIdManager().getId(ArtMesh);
      const nodeCount: number = json.getUserDataCount();

      for (let i: number = 0; i < nodeCount; i++) {
        const addNode: CubismModelUserDataNode = new CubismModelUserDataNode();

        addNode.targetId = json.getUserDataId(i);
        addNode.targetType = CubismFramework.getIdManager().getId(json.getUserDataTargetType(i));
        addNode.value = new csmString(json.getUserDataValue(i));
        this._userDataNodes.pushBack(addNode);

        if (addNode.targetType == typeOfArtMesh) {
          this._artMeshUserDataNode.pushBack(addNode);
        }
      }

      json.release();
      json = void 0 as any;
    }

    /**
     * 析构函数等效处理
     *
     * 释放用户数据数组
     */
    public release(): void {
      for (let i: number = 0; i < this._userDataNodes.getSize(); ++i) {
        this._userDataNodes.set(i, null as any);
      }

      this._userDataNodes = null as any;
    }
  }
}
