/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

import { LogLevel } from './framework/live2dcubismframework';

/**
 * 示例应用程序中使用的常量
 */
export namespace LAppDefine {
  // 画面
  export const ViewMaxScale: number = 2.0;
  export const ViewMinScale: number = 0.8;

  export const ViewLogicalLeft: number = -1.0;
  export const ViewLogicalRight: number = 1.0;

  export const ViewLogicalMaxLeft: number = -2.0;
  export const ViewLogicalMaxRight: number = 2.0;
  export const ViewLogicalMaxBottom: number = -2.0;
  export const ViewLogicalMaxTop: number = 2.0;

  // 相对路径
  export const ResourcesPath: string = '/resource/';

  // 在模型后的背景图象文件
  export const BackImageName: string = 'back_class_normal.png';

  // 齿轮
  export const GearImageName: string = 'icon_gear.png';

  // 退出按钮
  export const PowerImageName: string = 'CloseNormal.png';

  // 模型定义---------------------------------------------
  // 放置模型的目录名称数组
  // 确保目录名称与model3.json的名称匹配
  export const ModelDir: string[] = [
    'Haru',
    'Hiyori',
    'momo',
    'Mark',
    'Natori',
  ];
  export const ModelDirSize: number = ModelDir.length;

  // 与外部定义文件（json）匹配
  export const MotionGroupIdle: string = 'Idle'; // 待机
  export const MotionGroupTapBody: string = 'TapBody'; // 拍打身体时
  export const MotionGroupTapNose: string = 'TapNose'; // 拍打鼻子时
  export const MotionGroupTapGem: string = 'TapGem'; // 拍打宝石时
  export const MotionGroupTapFace: string = 'TapFace'; // 拍打脸时

  // 与外部定义文件（json）匹配
  export const HitAreaNameHead: string = 'Head';
  export const HitAreaNameFace: string = 'Face';
  export const HitAreaNameBody: string = 'Body';
  export const HitAreaNameNose: string = 'Nose';
  export const HitAreaNameGem: string = 'Gem';

  // 运动优先级常数
  export const PriorityNone: number = 0;
  export const PriorityIdle: number = 1;
  export const PriorityNormal: number = 2;
  export const PriorityForce: number = 3;

  // 调试日志显示选项
  export const DebugLogEnable: boolean = true;
  export const DebugTouchLogEnable: boolean = false;
  export let DebugMode: boolean = false;

  // Framework的日志级别设置输出
  export const CubismLoggingLevel: LogLevel = LogLevel.LogLevel_Verbose;
}
