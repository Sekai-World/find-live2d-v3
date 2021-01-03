/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismjson } from '../utils/cubismjson';
import { Live2DCubismFramework as cubismid } from '../id/cubismid';
import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import CubismFramework = cubismframework.CubismFramework;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismJson = cubismjson.CubismJson;


export namespace Live2DCubismFramework {
  const Meta: string = 'Meta';
  const UserDataCount: string = 'UserDataCount';
  const TotalUserDataSize: string = 'TotalUserDataSize';
  const UserData: string = 'UserData';
  const Target: string = 'Target';
  const Id: string = 'Id';
  const Value: string = 'Value';

  export class CubismModelUserDataJson {

    private _json: CubismJson;
    /**
     * 构造函数
     * @param buffer    读取userdata3.json的缓冲区
     * @param size      缓冲区大小
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
     * 获取用户数据
     * @return 用户数据的数量
     */
    public getUserDataCount(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(UserDataCount).toInt();
    }

    /**
     * 获取用户数据字符串的总数
     *
     * @return 用户数据字符串的总数
     */
    public getTotalUserDataSize(): number {
      return this._json.getRoot().getValueByString(Meta).getValueByString(TotalUserDataSize).toInt();
    }

    /**
     * 获取用户数据类型
     *
     * @return 用户数据类型
     */
    public getUserDataTargetType(i: number): string {
      return this._json.getRoot().getValueByString(UserData).getValueByIndex(i).getValueByString(Target).getRawString();
    }

    /**
     * 获取用户数据目标ID
     *
     * @param i 索引
     * @return 用户数据目标ID
     */
    public getUserDataId(i: number): CubismIdHandle {
      return CubismFramework.getIdManager().getId(this._json.getRoot().getValueByString(UserData).getValueByIndex(i).getValueByString(Id).getRawString());
    }

    /**
     * 获取用户数据字符串
     *
     * @param i 索引
     * @return 用户数据
     */
    public getUserDataValue(i: number): string {
      return this._json.getRoot().getValueByString(UserData).getValueByIndex(i).getValueByString(Value).getRawString();
    }
  }
}
