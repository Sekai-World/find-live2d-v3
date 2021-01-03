/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export namespace Live2DCubismFramework {
    /**
     * 文字列クラス。
     */
    export class csmString {

        public s: string;

        /**
         * 引数付きコンストラクタ
         */
        public constructor(s: string) {
            this.s = s;
        }
        /**
         * 文字列を後方に追加する
         *
         * @param c 追加する文字列
         * @return 更新された文字列
         */
        public append(c: string, length?: number): csmString {
            this.s += (length !== undefined)
                ? c.substr(0, length)
                : c;

            return this;
        }

        /**
         * 文字サイズを拡張して文字を埋める
         * @param length    拡張する文字数
         * @param v         埋める文字
         * @return 更新された文字列
         */
        public expansion(length: number, v: string): csmString {
            const ret: csmString = this;

            for (let i = 0; i < length; i++) {
                ret.append(v);
            }

            return ret;
        }

        /**
         * 文字列の長さをバイト数で取得する
         */
        public getBytes(): number {
            return encodeURIComponent(this.s) .replace(/%../g, 'x').length;
        }

        /**
         * 文字列の長さを返す
         */
        public getLength(): number {
            return this.s.length;
        }

        /**
         * 文字列比較　<
         * @param s 比較する文字列
         * @return true:    比較する文字列より小さい
         * @return false:   比較する文字列より大きい
         */
        public isLess(s: csmString): boolean {
            return this.s < s.s;
        }

        /**
         * 文字列比較 >
         * @param s 比較する文字列
         * @return true:    比較する文字列より大きい
         * @return false:   比較する文字列より小さい
         */
        public isGreat(s: csmString): boolean {
            return this.s > s.s;
        }

        /**
         * 文字列比較 ==
         * @param s 比較する文字列
         * @return true:    比較する文字列と等しい
         * @return false:   比較する文字列と異なる
         */
        public isEqual(s: string): boolean {
            return this.s == s;
        }

        /**
         * 文字列が空かどうか
         * @return true: 空の文字列
         * @return false: 値が設定されている
         */
        public isEmpty(): boolean {
            return this.s.length == 0;
        }
    }
}
