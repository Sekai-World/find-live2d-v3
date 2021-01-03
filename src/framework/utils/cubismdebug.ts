/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {Live2DCubismFramework as cubismframework, LogLevel} from '../live2dcubismframework';
import {CSM_LOG_LEVEL, CSM_LOG_LEVEL_VERBOSE, CSM_LOG_LEVEL_DEBUG, CSM_LOG_LEVEL_INFO, CSM_LOG_LEVEL_WARNING, CSM_LOG_LEVEL_ERROR} from '../cubismframeworkconfig';


export const CubismLogPrint = (level: LogLevel, fmt: string, args: any[]) => {
    Live2DCubismFramework.CubismDebug.print(level, '[CSM]' + fmt, args);
};

export const CubismLogPrintIn = (level: LogLevel, fmt: string, args: any[]) => {
    CubismLogPrint(level, fmt + '\n', args);
};

export let CSM_ASSERT = (expr: any) => {
    console.assert(expr);
};


export let CubismLogVerbose = (fmt: string, ... args: any[]) => {};
export let CubismLogDebug = (fmt: string, ... args: any[]) => {};
export let CubismLogInfo = (fmt: string, ... args: any[]) => {};
export let CubismLogWarning = (fmt: string, ... args: any[]) => {};
export let CubismLogError = (fmt: string, ... args: any[]) => {};

if (CSM_LOG_LEVEL <= CSM_LOG_LEVEL_VERBOSE) {
    CubismLogVerbose = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Verbose, '[V]' + fmt, args);
    };

    CubismLogDebug = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Debug, '[D]' + fmt, args);
    };

    CubismLogInfo = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Info, '[I]' + fmt, args);
    };

    CubismLogWarning = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };

    CubismLogError = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
} else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_DEBUG) {
    CubismLogDebug = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Debug, '[D]' + fmt, args);
    };

    CubismLogInfo = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Info, '[I]' + fmt, args);
    };

    CubismLogWarning = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };

    CubismLogError = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
} else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_INFO) {
    CubismLogInfo = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Info, '[I]' + fmt, args);
    };

    CubismLogWarning = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };

    CubismLogError = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
} else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_WARNING) {
    CubismLogWarning = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };

    CubismLogError = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
} else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_ERROR) {
    CubismLogError = (fmt: string, ... args: any[]) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
}

// ------------ LIVE2D NAMESPACE ------------
export namespace Live2DCubismFramework {

    /**
     * 用于调试的实用程序类。
     * 日志输出，字节转储等
     */
    export class CubismDebug {
        /**
         * 输出日志。 在第一个参数中设置日志级别。
         * 如果它低于CubismFramework.initialize（）选项中设置的日志输出级别，它将不会输出到日志。
         *
         * @param logLevel 设置日志级别
         * @param format 格式化字符串
         * @param args 可变长度参数
         */
        public static print(logLevel: LogLevel, format: string, args?: any[]): void {
            // 如果选项中设置的日志输出级别低于此值，不会记录
            if (logLevel < cubismframework.CubismFramework.getLoggingLevel()) {
                return;
            }

            const logPrint: Live2DCubismCore.csmLogFunction = cubismframework.CubismFramework.coreLogFunction;

            if (!logPrint) {
                return;
            }

            const buffer: string =
                format.replace(
                    /\{(\d+)\}/g,
                    (m, k) => {
                        return (args as any)[k];
                    },
                );
            logPrint(buffer);
        }

        /**
         * 从数据中转储指定的长度。
         * 如果它低于CubismFramework.initialize（）选项中设置的日志输出级别，它将不会输出到日志。
         *
         * @param logLevel 设置日志级别
         * @param data 要转储的数据
         * @param length 转储的长度
         */
        public static dumpBytes(logLevel: LogLevel, data: Uint8Array, length: number): void {
            for (let i: number = 0; i < length; i++) {
                if (i % 16 == 0 && i > 0) { this.print(logLevel, '\n'); } else if (i % 8 == 0 && i > 0) { this.print(logLevel, '  '); }
                this.print(logLevel, '{0} ', [(data[i] & 0xFF)]);
            }

            this.print(logLevel, '\n');
        }

        /**
         * private 构造函数
         */
        private constructor() {

        }
    }
}

// ------------ LIVE2D NAMESPACE ------------
