/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {Live2DCubismFramework as csmstring} from '../type/csmstring';
import csmString = csmstring.csmString;

export namespace Live2DCubismFramework {
    /**
     * パラメータ名・パーツ名・Drawable名を保持
     *
     * パラメータ名・パーツ名・Drawable名を保持するクラス。
     */
    export class CubismId {

        private _id: csmString; // ID名

        /**
         * コンストラクタ
         */
        public constructor(id: string | csmString) {
            if (typeof(id) === 'string') {
                this._id = new csmString(id);
                return;
            }

            this._id = id;
        }
        /**
         * ID名を取得する
         */
        public getString(): csmString {
            return this._id;
        }

        /**
         * idを比較
         * @param c 比較するid
         * @return 同じならばtrue,異なっていればfalseを返す
         */
        public isEqual(c: string | csmString | CubismId): boolean {
            if (typeof(c) === 'string') {
                return this._id.isEqual(c);
            } else if (c instanceof csmString) {
                return this._id.isEqual(c.s);
            } else if (c instanceof CubismId) {
                return this._id.isEqual(c._id.s);
            }
            return false;
        }

        /**
         * idを比較
         * @param c 比較するid
         * @return 同じならばtrue,異なっていればfalseを返す
         */
        public isNotEqual(c: string | csmString | CubismId): boolean {
            if (typeof(c) == 'string') {
                return !this._id.isEqual(c);
            } else if (c instanceof csmString) {
                return !this._id.isEqual(c.s);
            } else if (c instanceof CubismId) {
                return !this._id.isEqual(c._id.s);
            }
            return false;
        }
    }

    export declare type CubismIdHandle = CubismId;
}