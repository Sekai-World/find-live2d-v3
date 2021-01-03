/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export namespace Live2DCubismFramework {
    export class CubismString {
        /**
         * 获取应用了标准输出格式的字符串。
         * @param format    标准输出格式字符串
         * @param ...args   要传递给格式字符串的字符串
         * @return 应用格式的字符串
         */
        public static getFormatedString(format: string, ... args: any[]): string {
            const ret: string = format;
            return ret.replace(
                /\{(\d+)\}/g,
                (m, k) => {
                    return args[k];
                },
            );
        }

        /**
         * 返回文本是否以startWord开头
         * @param test 要检查的字符串
         * @param startWord 要比较的字符串
         * @return true text以startWord开头
         * @return false text不以startWord开头
         */
        public static isStartWith(text: string, startWord: string): boolean {
            let textIndex = 0;
            let startWordIndex = 0;
            while (startWord[startWordIndex] != '\0') {
                if (text[textIndex] == '\0' || text[textIndex++] != startWord[startWordIndex++]) {
                    return false;
                }
            }
            return false;
        }

        /**
         * position位置の文字から数字を解析する。
         *
         * @param string 字符串
         * @param length 字符串长度
         * @param position 要分析的文字的位置
         * @param outEndPos 如果未读取任何字符，则输入错误值（-1）。
         * @return 解析結果の数値
         */
        public static stringToFloat(string: string, length: number, position: number, outEndPos: number[]): number {
            let i: number = position;
            let minus: boolean = false; // マイナスフラグ
            let period: boolean = false;
            let v1: number = 0;

            // 負号の確認
            let c: number = parseInt(string[i]);
            if (c < 0) {
                minus = true;
                i++;
            }

            // 整数部の確認
            for (; i < length; i++) {
                const c = string[i];
                if (0 <= parseInt(c) && parseInt(c) <= 9) {
                    v1 = v1 * 10 + (parseInt(c) - 0);
                } else if (c == '.') {
                    period = true;
                    i++;
                    break;
                } else {
                    break;
                }
            }

            // 小数部の確認
            if (period) {
                let mul: number = 0.1;
                for (; i < length; i++) {
                    c = parseFloat(string[i]) & 0xFF;
                    if (0 <= c && c <= 9) {
                        v1 += mul * (c - 0);
                    } else {
                        break;
                    }
                    mul *= 0.1; // 一桁下げる
                    if (!c) { break; }
                }
            }

            if (i == position) {
                // 一文字も読み込まなかった場合
                outEndPos[0] = -1; // エラー値が入るので呼び出し元で適切な処理を行う
                return 0;
            }

            if (minus) { v1 = -v1; }

            outEndPos[0] = i;
            return v1;
        }

        /**
         * 创建无法调用构造函数的静态类
         */
        private constructor() {

        }
    }
}
