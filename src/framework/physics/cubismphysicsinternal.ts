/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {Live2DCubismFramework as cubismvector2} from '../math/cubismvector2';
import {Live2DCubismFramework as cubismid} from '../id/cubismid';
import {Live2DCubismFramework as csmvector} from '../type/csmvector';
import csmVector = csmvector.csmVector;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismVector2 = cubismvector2.CubismVector2;

export namespace Live2DCubismFramework {
    /**
     * 物理演算の適用先の種類
     */
    export enum CubismPhysicsTargetType {
        CubismPhysicsTargetType_Parameter,  // パラメータに対して適用
    }

    /**
     * 物理演算の入力の種類
     */
    export enum CubismPhysicsSource {
        CubismPhysicsSource_X,          // X軸の位置から
        CubismPhysicsSource_Y,          // Y軸の位置から
        CubismPhysicsSource_Angle,      // 角度から
    }

    /**
     * @brief 物理演算で使用する外部の力
     *
     * 物理演算で使用する外部の力。
     */
    export class PhysicsJsonEffectiveForces {
        public gravity: CubismVector2;          /// < 重力
        public wind: CubismVector2;          /// < 風
        constructor() {
            this.gravity = new CubismVector2(0, 0);
            this.wind = new CubismVector2(0, 0);
        }
    }

    /**
     * 物理演算のパラメータ情報
     */
    export class CubismPhysicsParameter {
        public id: CubismIdHandle = undefined as any;   // パラメータ
      public targetType: CubismPhysicsTargetType = undefined as any;    // 適用先の種類
    }

    /**
     * 物理演算の正規化情報
     */
    export class CubismPhysicsNormalization {
      public minimum: number = undefined as any;    // 最大値
      public maximum: number = undefined as any;    // 最小値
      public defalut: number = undefined as any;    // デフォルト値
    }

    /**
     * 物理演算の演算委使用する物理点の情報
     */
    export class CubismPhysicsParticle {

        public initialPosition: CubismVector2; // 初期位置
      public mobility: number = undefined as any;               // 動きやすさ
      public delay: number = undefined as any;                  // 遅れ
      public acceleration: number = undefined as any;           // 加速度
      public radius: number = undefined as any;                 // 距離
        public position: CubismVector2;        // 現在の位置
        public lastPosition: CubismVector2;    // 最後の位置
        public lastGravity: CubismVector2;     // 最後の重力
        public force: CubismVector2;           // 現在かかっている力
        public velocity: CubismVector2;        // 現在の速度
        constructor() {
            this.initialPosition = new CubismVector2(0, 0);
            this.position = new CubismVector2(0, 0);
            this.lastPosition = new CubismVector2(0, 0);
            this.lastGravity = new CubismVector2(0, 0);
            this.force = new CubismVector2(0, 0);
            this.velocity = new CubismVector2(0, 0);
        }
    }

    /**
     * 物理演算の物理点の管理
     */
    export class CubismPhysicsSubRig {
      public inputCount: number = undefined as any;                                 // 入力の個数
      public outputCount: number = undefined as any;                                // 出力の個数
      public particleCount: number = undefined as any;                              // 物理点の個数
      public baseInputIndex: number = undefined as any;                             // 入力の最初のインデックス
      public baseOutputIndex: number = undefined as any;                            // 出力の最初のインデックス
      public baseParticleIndex: number = undefined as any;                          // 物理点の最初のインデックス
        public normalizationPosition: CubismPhysicsNormalization;  // 正規化された位置
        public normalizationAngle: CubismPhysicsNormalization;     // 正規化された角度
        constructor() {
            this.normalizationPosition = new CubismPhysicsNormalization();
            this.normalizationAngle = new CubismPhysicsNormalization();
        }
    }

    /**
     * 正規化されたパラメータの取得関数の宣言
     * @param targetTranslation     // 演算結果の移動値
     * @param targetAngle           // 演算結果の角度
     * @param value                 // パラメータの値
     * @param parameterMinimunValue // パラメータの最小値
     * @param parameterMaximumValue // パラメータの最大値
     * @param parameterDefaultValue // パラメータのデフォルト値
     * @param normalizationPosition // 正規化された位置
     * @param normalizationAngle    // 正規化された角度
     * @param isInverted            // 値が反転されているか？
     * @param weight                // 重み
     */
    export type normalizedPhysicsParameterValueGetter = (
            targetTranslation: CubismVector2,
            targetAngle: {angle: number},
            value: number,
            parameterMinimunValue: number,
            parameterMaximumValue: number,
            parameterDefaultValue: number,
            normalizationPosition: CubismPhysicsNormalization,
            normalizationAngle: CubismPhysicsNormalization,
            isInverted: boolean,
            weight: number,
        ) => void;

    /**
     * 物理演算の値の取得関数の宣言
     * @param translation 移動値
     * @param particles 物理点のリスト
     * @param isInverted 値が反映されているか
     * @param parentGravity 重力
     * @return 値
     */
    export type physicsValueGetter = (
            translation: CubismVector2,
            particles: CubismPhysicsParticle[],
            particleIndex: number,
            isInverted: boolean,
            parentGravity: CubismVector2,
        ) => number;

    /**
     * 物理演算のスケールの取得関数の宣言
     * @param translationScale 移動値のスケール
     * @param angleScale    角度のスケール
     * @return スケール値
     */
    export type physicsScaleGetter = (
            translationScale: CubismVector2,
            angleScale: number,
        ) => number;

    /**
     * 物理演算の入力情報
     */
    export class CubismPhysicsInput {
        public source: CubismPhysicsParameter;     // 入力元のパラメータ
      public sourceParameterIndex: number = undefined as any;       // 入力元のパラメータのインデックス
      public weight: number = undefined as any;                     // 重み
      public type: number = undefined as any;                       // 入力の種類
      public reflect: boolean = undefined as any;                   // 値が反転されているかどうか
      public getNormalizedParameterValue: normalizedPhysicsParameterValueGetter = undefined as any;   // 正規化されたパラメータ値の取得関数
        constructor() {
            this.source = new CubismPhysicsParameter();
        }
    }

    /**
     * @brief 物理演算の出力情報
     *
     * 物理演算の出力情報。
     */
    export class CubismPhysicsOutput {

        public destination: CubismPhysicsParameter;        /// < 出力先のパラメータ
      public destinationParameterIndex: number = undefined as any;          /// < 出力先のパラメータのインデックス
      public vertexIndex: number = undefined as any;                        /// < 振り子のインデックス
        public translationScale: CubismVector2;            /// < 移動値のスケール
      public angleScale: number = undefined as any;                         /// < 角度のスケール
      public weight: number = undefined as any;                             /// 重み
      public type: CubismPhysicsSource = undefined as any;                  /// < 出力の種類
      public reflect: boolean = undefined as any;                           /// < 値が反転されているかどうか
      public valueBelowMinimum: number = undefined as any;                  /// < 最小値を下回った時の値
      public valueExceededMaximum: number = undefined as any;               /// < 最大値をこえた時の値
      public getValue: physicsValueGetter = undefined as any;             /// < 物理演算の値の取得関数
      public getScale: physicsScaleGetter = undefined as any;             /// < 物理演算のスケール値の取得関数
        constructor() {
            this.destination = new CubismPhysicsParameter();
            this.translationScale = new CubismVector2(0, 0);
        }
    }

    /**
     * @brief 物理演算のデータ
     *
     * 物理演算のデータ。
     */
    export class CubismPhysicsRig {

      public subRigCount: number = undefined as any;                    /// < 物理演算の物理点の個数
        public settings: csmVector<CubismPhysicsSubRig>;        /// < 物理演算の物理点の管理のリスト
        public inputs: csmVector<CubismPhysicsInput>;           /// < 物理演算の入力のリスト
        public outputs: csmVector<CubismPhysicsOutput>;         /// < 物理演算の出力のリスト
        public particles: csmVector<CubismPhysicsParticle>;     /// < 物理演算の物理点のリスト
        public gravity: CubismVector2;                 /// < 重力
        public wind: CubismVector2;                    /// < 風
        constructor() {
            this.settings = new csmVector<CubismPhysicsSubRig>();
            this.inputs = new csmVector<CubismPhysicsInput>();
            this.outputs = new csmVector<CubismPhysicsOutput>();
            this.particles = new csmVector<CubismPhysicsParticle>();
            this.gravity = new CubismVector2(0, 0);
            this.wind = new CubismVector2(0, 0);
        }
    }
}
