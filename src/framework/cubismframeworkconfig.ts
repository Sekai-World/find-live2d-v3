/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

// ========================================================
//  设置日志输出功能
// ========================================================

// ---------- 日志输出级别选择项目定义 ----------
/// 详细的日志输出设置
export const CSM_LOG_LEVEL_VERBOSE: number = 0;
/// 调试日志输出设置
export const CSM_LOG_LEVEL_DEBUG: number = 1;
/// 信息日志输出设置
export const CSM_LOG_LEVEL_INFO: number = 2;
/// 警告日志输出设置
export const CSM_LOG_LEVEL_WARNING: number = 3;
/// 错误日志输出设置
export const CSM_LOG_LEVEL_ERROR: number = 4;
/// 记录输出关闭设置
export const CSM_LOG_LEVEL_OFF: number = 5;

/**
* 日志输出级别设置。
*
* 强制更改日志输出级别时启用定义。
* 要选择 CSM_LOG_LEVEL_VERBOSE ～ CSM_LOG_LEVEL_OFF。
*/
export const CSM_LOG_LEVEL: number = CSM_LOG_LEVEL_VERBOSE;
