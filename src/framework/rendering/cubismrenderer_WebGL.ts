/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismframework } from '../live2dcubismframework';
import { Live2DCubismFramework as csmrect } from '../type/csmrectf';
import { Live2DCubismFramework as cubismrenderer } from './cubismrenderer';
import { Live2DCubismFramework as cubismmodel } from '../model/cubismmodel';
import { Live2DCubismFramework as cubsimmatrix44 } from '../math/cubismmatrix44';
import { Live2DCubismFramework as csmmap } from '../type/csmmap';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { CubismLogError } from '../utils/cubismdebug';
import Constant = cubismframework.Constant;
import CubismMatrix44 = cubsimmatrix44.CubismMatrix44;
import csmRect = csmrect.csmRect;
import csmMap = csmmap.csmMap;
import csmVector = csmvector.csmVector;
import CubismModel = cubismmodel.CubismModel;
import CubismRenderer = cubismrenderer.CubismRenderer;
import CubismBlendMode = cubismrenderer.CubismBlendMode;
import CubismTextureColor = cubismrenderer.CubismTextureColor;

export namespace Live2DCubismFramework {
  const ColorChannelCount: number = 4;    // 1代表通道1,3代表RGB，4代表alpha

  const shaderCount: number = 7; // 着色器数量=蒙版生成+（正常+加法+乘法）*（不带蒙版的乘法alpha版本+带蒙版的乘法alpha版本）
  let s_instance: CubismShader_WebGL;
  let s_viewport: number[];
  let s_fbo: WebGLFramebuffer;

  /**
   * 执行剪贴蒙版处理的类
   */
  export class CubismClippingManager_WebGL {

    public _maskRenderTexture: WebGLFramebuffer; // 面具渲染纹理地址
    public _colorBuffer: WebGLTexture;       // 掩码颜色缓冲区地址
    public _currentFrameNo: number;    // 给掩码纹理的帧号

    public _channelColors: csmVector<CubismTextureColor>;
    public _maskTexture: CubismRenderTextureResource;           // 面具的纹理资源列表
    public _clippingContextListForMask: csmVector<CubismClippingContext>;   // 面具的剪辑上下文列表
    public _clippingContextListForDraw: csmVector<CubismClippingContext>;   // 绘图的剪辑上下文列表
    public _clippingMaskBufferSize: number;    // 剪切掩码缓冲区大小（初始值：256）

    public gl: WebGLRenderingContext = null as any;  // WebGL渲染上下文

    private _tmpMatrix: CubismMatrix44;         // 用于掩模计算的矩阵
    private _tmpMatrixForMask: CubismMatrix44;  // 用于掩模计算的矩阵
    private _tmpMatrixForDraw: CubismMatrix44;  // 用于掩模计算的矩阵
    private _tmpBoundsOnModel: csmRect;         // 用于计算蒙版位置的矩形

    /**
     * 构造函数
     */
    public constructor() {
      this._maskRenderTexture = null as any;
      this._colorBuffer = null as any;
      this._currentFrameNo = 0;
      this._clippingMaskBufferSize = 256;
      this._clippingContextListForMask = new csmVector<CubismClippingContext>();
      this._clippingContextListForDraw = new csmVector<CubismClippingContext>();
      this._channelColors = new csmVector<CubismTextureColor>();
      this._tmpBoundsOnModel = new csmRect();
      this._tmpMatrix = new CubismMatrix44();
      this._tmpMatrixForMask = new CubismMatrix44();
      this._tmpMatrixForDraw = new CubismMatrix44();
      this._maskTexture = null as any;

      let tmp: CubismTextureColor = new CubismTextureColor();
      tmp.R = 1.0;
      tmp.G = 0.0;
      tmp.B = 0.0;
      tmp.A = 0.0;
      this._channelColors.pushBack(tmp);

      tmp = new CubismTextureColor();
      tmp.R = 0.0;
      tmp.G = 1.0;
      tmp.B = 0.0;
      tmp.A = 0.0;
      this._channelColors.pushBack(tmp);

      tmp = new CubismTextureColor();
      tmp.R = 0.0;
      tmp.G = 0.0;
      tmp.B = 1.0;
      tmp.A = 0.0;
      this._channelColors.pushBack(tmp);

      tmp = new CubismTextureColor();
      tmp.R = 0.0;
      tmp.G = 0.0;
      tmp.B = 0.0;
      tmp.A = 1.0;
      this._channelColors.pushBack(tmp);
    }
    /**
     * 获取颜色通道（RGBA）标志
     * @param channelNo 颜色通道（RGBA）编号（0：R，1：G，2：B，3：Alpha)
     */
    public getChannelFlagAsColor(channelNo: number): CubismTextureColor {
      return this._channelColors.at(channelNo);
    }

    /**
     * 获取临时渲染纹理的地址
     * 如果FrameBufferObject不存在，请创建一个新的
     *
     * @return 渲染纹理地址
     */
    public getMaskRenderTexture(): WebGLFramebuffer {
      let ret: WebGLFramebuffer = 0;

      // 获取临时RenderTexture
      if (this._maskTexture && this._maskTexture.texture != 0) {
        this._maskTexture.frameNo = this._currentFrameNo;
        ret = this._maskTexture.texture;
      }

      if (ret == 0) {
        // 如果FrameBufferObject不存在，请创建一个新的

        // 获取剪辑缓冲区大小
        const size: number = this._clippingMaskBufferSize;

        this._colorBuffer = this.gl.createTexture() as any;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._colorBuffer);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        ret = this.gl.createFramebuffer() as any;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, ret);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._colorBuffer, 0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, s_fbo);

        this._maskTexture = new CubismRenderTextureResource(this._currentFrameNo, ret);
      }

      return ret;
    }

    /**
     * 设置WebGL渲染上下文
     * @param gl WebGL渲染上下文
     */
    public setGL(gl: WebGLRenderingContext): void {
      this.gl = gl;
    }

    /**
     * 计算围绕要屏蔽的整个图形对象组的矩形（模型坐标系）
     * @param model 模型实例
     * @param clippingContext 剪切蒙版上下文
     */
    public calcClippedDrawTotalBounds(model: CubismModel, clippingContext: CubismClippingContext): void {
      // 要剪裁的蒙版的整个矩形（蒙版绘图对象）
      let clippedDrawTotalMinX: number = Number.MAX_VALUE;
      let clippedDrawTotalMinY: number = Number.MAX_VALUE;
      let clippedDrawTotalMaxX: number = Number.MIN_VALUE;
      let clippedDrawTotalMaxY: number = Number.MIN_VALUE;

      // 确定是否确实需要此掩码
      // 如果甚至可以使用一个使用此剪辑的“绘图对象”，则必须生成掩码
      const clippedDrawCount: number = clippingContext._clippedDrawableIndexList.length;

      for (let clippedDrawableIndex: number = 0; clippedDrawableIndex < clippedDrawCount; clippedDrawableIndex++) {
        // 找到要为使用蒙版的绘图对象绘制的矩形
        const drawableIndex: number = clippingContext._clippedDrawableIndexList[clippedDrawableIndex];

        const drawableVertexCount: number = model.getDrawableVertexCount(drawableIndex);
        const drawableVertexes: Float32Array = model.getDrawableVertices(drawableIndex);

        let minX: number = Number.MAX_VALUE;
        let minY: number = Number.MAX_VALUE;
        let maxX: number = Number.MIN_VALUE;
        let maxY: number = Number.MIN_VALUE;

        const loop: number = drawableVertexCount * Constant.vertexStep;
        for (let pi: number = Constant.vertexOffset; pi < loop; pi += Constant.vertexStep) {
          const x: number = drawableVertexes[pi];
          const y: number = drawableVertexes[pi + 1];

          if (x < minX) {
            minX = x;
          }
          if (x > maxX) {
            maxX = x;
          }
          if (y < minY) {
            minY = y;
          }
          if (y > maxY) {
            maxY = y;
          }
        }

        // 跳过因为没有获得有效积分
        if (minX == Number.MAX_VALUE) {
          continue;
        }

        // 　反映整个矩形
        if (minX < clippedDrawTotalMinX) {
          clippedDrawTotalMinX = minX;
        }
        if (minY < clippedDrawTotalMinY) {
          clippedDrawTotalMinY = minY;
        }
        if (maxX > clippedDrawTotalMaxX) {
          clippedDrawTotalMaxX = maxX;
        }
        if (maxY > clippedDrawTotalMaxY) {
          clippedDrawTotalMaxY = maxY;
        }

        if (clippedDrawTotalMinX == Number.MAX_VALUE) {
          clippingContext._allClippedDrawRect.x = 0.0;
          clippingContext._allClippedDrawRect.y = 0.0;
          clippingContext._allClippedDrawRect.width = 0.0;
          clippingContext._allClippedDrawRect.height = 0.0;
          clippingContext._isUsing = false;
        } else {
          clippingContext._isUsing = true;
          const w: number = clippedDrawTotalMaxX - clippedDrawTotalMinX;
          const h: number = clippedDrawTotalMaxY - clippedDrawTotalMinY;
          clippingContext._allClippedDrawRect.x = clippedDrawTotalMinX;
          clippingContext._allClippedDrawRect.y = clippedDrawTotalMinY;
          clippingContext._allClippedDrawRect.width = w;
          clippingContext._allClippedDrawRect.height = h;
        }

      }
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      for (let i: number = 0; i < this._clippingContextListForMask.getSize(); i++) {
        if (this._clippingContextListForMask.at(i)) {
          this._clippingContextListForMask.at(i).release();
          this._clippingContextListForMask.set(i, void 0 as any);
        }
        this._clippingContextListForMask.set(i, null as any);
      }
      this._clippingContextListForMask = null as any;

      // _clippingContextListForDraw指向_clippingContextListForMask中的实例。 通过上述处理不需要对每个元素进行DELETE。
      for (let i: number = 0; i < this._clippingContextListForDraw.getSize(); i++) {
        this._clippingContextListForDraw.set(i, null as any);
      }
      this._clippingContextListForDraw = null as any;

      if (this._maskTexture) {
        this.gl.deleteFramebuffer(this._maskTexture.texture);
        this._maskTexture = null as any;
      }

      for (let i: number = 0; i < this._channelColors.getSize(); i++) {
        this._channelColors.set(i, null as any);
      }

      this._channelColors = null as any;

      // 纹理释放
      this.gl.deleteTexture(this._colorBuffer);
      this._colorBuffer = null as any;
    }

    /**
     * Manager初始化过程
     * 注册使用剪贴蒙版的绘图对象
     * @param model 模型实例
     * @param drawableCount 绘图对象的数量
     * @param drawableMasks 屏蔽绘图对象的绘图对象索引列表
     * @param drawableCounts 屏蔽绘图对象的绘图对象数
     */
    public initialize(model: CubismModel, drawableCount: number, drawableMasks: Int32Array[], drawableMaskCounts: Int32Array): void {
      // 注册所有使用剪贴蒙版的绘图对象
      // 剪切蒙版通常仅限于少数。
      for (let i: number = 0; i < drawableCount; i++) {
        if (drawableMaskCounts[i] <= 0) {
          // 没有剪裁蒙版的艺术网（在很多情况下不使用）
          this._clippingContextListForDraw.pushBack(null as any);
          continue;
        }

        // 检查它是否与现有的ClipContext相同
        let clippingContext: CubismClippingContext = this.findSameClip(drawableMasks[i], drawableMaskCounts[i]);
        if (clippingContext == null) {
          // 如果不存在相同的掩码，则生成
          clippingContext = new CubismClippingContext(this, drawableMasks[i], drawableMaskCounts[i]);
          this._clippingContextListForMask.pushBack(clippingContext);
        }

        clippingContext.addClippedDrawable(i);

        this._clippingContextListForDraw.pushBack(clippingContext);
      }
    }

    /**
     * 创建剪辑上下文。 绘制模型时执行。
     * @param model 模型实例
     * @param renderer 渲染器实例
     */
    public setupClippingContext(model: CubismModel, renderer: CubismRenderer_WebGL): void {
      this._currentFrameNo++;

      // 准备所有剪报
      // 使用相同的剪辑时（如果是多个剪辑，请设置一个剪辑）
      let usingClipCount: number = 0;
      for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.getSize(); clipIndex++) {
        // 关于一个剪贴蒙版
        const cc: CubismClippingContext = this._clippingContextListForMask.at(clipIndex);

        // 计算包含使用此剪辑的整个图形对象组的矩形
        this.calcClippedDrawTotalBounds(model, cc);

        if (cc._isUsing) {
          usingClipCount++; // 算在使用中
        }
      }

      // 面具创建过程
      if (usingClipCount > 0) {
        // 将视口设置为与生成的FrameBuffer大小相同
        this.gl.viewport(0, 0, this._clippingMaskBufferSize, this._clippingMaskBufferSize);

        // 使面具活跃
        this._maskRenderTexture = this.getMaskRenderTexture();

        // 绘制模型时，转换传递给DrawMeshNow（模型到世界坐标转换）
        const modelToWorldF: CubismMatrix44 = renderer.getMvpMatrix();

        renderer.preDraw(); // 清除缓冲区

        // 确定每个蒙版的布局
        this.setupLayoutBounds(usingClipCount);

        // ---------- 面具绘图过程 ----------
        // 将Mask的RenderTexture设置为活动状态
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._maskRenderTexture);

        // 清除面具
        // （临时规范）1是无效（未绘制）区域，0是有效（绘制）区域。 （着色器Cd * Cs用于创建值接近0的掩码。当应用1时，没有任何反应。）
        this.gl.clearColor(1.0, 1.0, 1.0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // 实际上生成一个面具
        // 决定如何布局和绘制所有蒙版并将它们存储在ClipContext和ClippedDrawContext中
        for (let clipIndex: number = 0; clipIndex < this._clippingContextListForMask.getSize(); clipIndex++) {
          // --- 实际上画了一个面具 ---
          const clipContext: CubismClippingContext = this._clippingContextListForMask.at(clipIndex);
          const allClipedDrawRect: csmRect = clipContext._allClippedDrawRect;   // 使用此蒙版的所有绘图对象的逻辑坐标上的边界矩形
          const layoutBoundsOnTex01: csmRect = clipContext._layoutBounds; // 把面具放在这里

          // 在模型坐标上使用具有适当边距的矩形
          const MARGIN: number = 0.05;
          this._tmpBoundsOnModel.setRect(allClipedDrawRect);
          this._tmpBoundsOnModel.expand(allClipedDrawRect.width * MARGIN, allClipedDrawRect.height * MARGIN);
          // ########## 最初的最小尺寸是好的，而不使用整个分配区域

          // 找到着色器的公式。 如果不考虑轮换：
          // movePeriod' = movePeriod * scaleX + offX		  [[ movePeriod' = (movePeriod - tmpBoundsOnModel.movePeriod)*scale + layoutBoundsOnTex01.movePeriod ]]
          const scaleX: number = layoutBoundsOnTex01.width / this._tmpBoundsOnModel.width;
          const scaleY: number = layoutBoundsOnTex01.height / this._tmpBoundsOnModel.height;

          // 查找生成掩码时要使用的矩阵
          {
            // 找到要传递到着色器的矩阵 <<<<<<<<<<<<<<<<<<<<<<<< 需要优化（可以通过反向计算简化
            this._tmpMatrix.loadIdentity();
            {
              // 将layout0..1转换为-1..1
              this._tmpMatrix.translateRelative(-1.0, -1.0);
              this._tmpMatrix.scaleRelative(2.0, 2.0);
            }
            {
              // view to layout0..1
              this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
              this._tmpMatrix.scaleRelative(scaleX, scaleY);  // new = [translate][scale]
              this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
              // new = [translate][scale][translate]
            }
            // tmpMatrixForMaskが計算結果
            this._tmpMatrixForMask.setMatrix(this._tmpMatrix.getArray());
          }

          // --------- 绘制时计算蒙版参考矩阵
          {
            // 找到要传递到着色器的矩阵 <<<<<<<<<<<<<<<<<<<<<<<< 需要优化（可以通过反向计算简化
            this._tmpMatrix.loadIdentity();
            {
              this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
              this._tmpMatrix.scaleRelative(scaleX, scaleY);  // new = [translate][scale]
              this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
              // new = [translate][scale][translate]
            }
            this._tmpMatrixForDraw.setMatrix(this._tmpMatrix.getArray());
          }
          clipContext._matrixForMask.setMatrix(this._tmpMatrixForMask.getArray());
          clipContext._matrixForDraw.setMatrix(this._tmpMatrixForDraw.getArray());

          const clipDrawCount: number = clipContext._clippingIdCount;
          for (let i: number = 0; i < clipDrawCount; i++) {
            const clipDrawIndex: number = clipContext._clippingIdList[i];

            // 如果顶点信息尚未更新且不可靠，则传递绘图。
            if (!model.getDrawableDynamicFlagVertexPositionsDidChange(clipDrawIndex)) {
              continue;
            }

            renderer.setIsCulling(model.getDrawableCulling(clipDrawIndex) != false);

            // 应用此特殊转换并绘制
            // 频道也需要切换（A，R，G，B）
            renderer.setClippingContextBufferForMask(clipContext);
            renderer.drawMesh(
              model.getDrawableTextureIndices(clipDrawIndex),
              model.getDrawableVertexIndexCount(clipDrawIndex),
              model.getDrawableVertexCount(clipDrawIndex),
              model.getDrawableVertexIndices(clipDrawIndex),
              model.getDrawableVertices(clipDrawIndex),
              model.getDrawableVertexUvs(clipDrawIndex),
              model.getDrawableOpacity(clipDrawIndex),
              CubismBlendMode.CubismBlendMode_Normal,   // 剪切力正常拉伸
            );
          }
        }

        // --- 后处理---
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, s_fbo);   // 返回绘图目标
        renderer.setClippingContextBufferForMask(null as any);

        this.gl.viewport(s_viewport[0], s_viewport[1], s_viewport[2], s_viewport[3]);
      }
    }

    /**
     * 检查你是否已经制作了面具
     * 如果是，则返回相应的剪贴蒙版实例
     * 如果未创建，则返回NULL
     * @param drawableMasks 屏蔽绘图对象的绘图对象列表
     * @param drawableMaskCounts 屏蔽绘图对象的绘图对象数
     * @return 如果存在相应的剪贴蒙版，则返回实例，否则返回NULL
     */
    public findSameClip(drawableMasks: Int32Array, drawableMaskCounts: number): CubismClippingContext {
      // 检查它是否与创建的ClippingContext匹配
      for (let i: number = 0; i < this._clippingContextListForMask.getSize(); i++) {
        const clippingContext: CubismClippingContext = this._clippingContextListForMask.at(i);
        const count: number = clippingContext._clippingIdCount;

        // 如果数量不同则不同
        if (count != drawableMaskCounts) {
          continue;
        }

        let sameCount = 0;

        // 检查它们是否具有相同的ID。 由于数组的数量是相同的，如果匹配的数量相同，它将具有相同的东西
        for (let j: number = 0; j < count; j++) {
          const clipId: number = clippingContext._clippingIdList[j];

          for (let k: number = 0; k < count; k++) {
            if (drawableMasks[k] == clipId) {
              sameCount++;
              break;
            }
          }
        }

        if (sameCount == count) {
          return clippingContext;
        }
      }

      return null as any; // 找不到
    }

    /**
     * 用于放置剪切上下文的布局
     * 使用尽可能多的渲染纹理布置蒙版
     * 如果掩模组的数量是4或更少，则为RGBA的每个通道布置一个掩模，如果它是5或更大且6或更小，则RGBA被布置为2,2,1,1。
     *
     * @param usingClipCount 要放置的剪辑上下文的数量
     */
    public setupLayoutBounds(usingClipCount: number): void {
      // 使用尽可能多的RenderTexture布置遮罩
      // 如果掩模组的数量是4或更少，则为RGBA的每个通道布置一个掩模，并且如果它是5或更大且6或更小，则RGBA布置为2,2,1,1。

      // 按顺序使用RGBA
      let div: number = usingClipCount / ColorChannelCount; // 　基本掩模放在一个通道上
      let mod: number = usingClipCount % ColorChannelCount; // 逐个分配到此号码的频道

      // 向下舍入小数点
      div = ~~div;
      mod = ~~mod;

      // 准备每个RGBA通道（0：R，1：G，2：B，3：A）
      let curClipIndex: number = 0; // 按顺序排列

      for (let channelNo: number = 0; channelNo < ColorChannelCount; channelNo++) {
        // 在此频道上布置的号码
        const layoutCount: number = div + (channelNo < mod ? 1 : 0);

        // 决定如何分裂
        if (layoutCount == 0) {
          // 什么都不做
        } else if (layoutCount == 1) {
          // 按原样使用一切
          const clipContext: CubismClippingContext = this._clippingContextListForMask.at(curClipIndex++);
          clipContext._layoutChannelNo = channelNo;
          clipContext._layoutBounds.x = 0.0;
          clipContext._layoutBounds.y = 0.0;
          clipContext._layoutBounds.width = 1.0;
          clipContext._layoutBounds.height = 1.0;
        } else if (layoutCount == 2) {
          for (let i: number = 0; i < layoutCount; i++) {
            let xpos: number = i % 2;

            // 向下舍入小数点
            xpos = ~~xpos;

            const cc: CubismClippingContext = this._clippingContextListForMask.at(curClipIndex++);
            cc._layoutChannelNo = channelNo;

            cc._layoutBounds.x = xpos * 0.5;
            cc._layoutBounds.y = 0.0;
            cc._layoutBounds.width = 0.5;
            cc._layoutBounds.height = 1.0;
            // 分解并使用两种UV
          }
        } else if (layoutCount <= 4) {
          // 分为4部分
          for (let i: number = 0; i < layoutCount; i++) {
            let xpos: number = i % 2;
            let ypos: number = i / 2;

            // 向下舍入小数点
            xpos = ~~xpos;
            ypos = ~~ypos;

            const cc = this._clippingContextListForMask.at(curClipIndex++);
            cc._layoutChannelNo = channelNo;

            cc._layoutBounds.x = xpos * 0.5;
            cc._layoutBounds.y = ypos * 0.5;
            cc._layoutBounds.width = 0.5;
            cc._layoutBounds.height = 0.5;
          }
        } else if (layoutCount <= 9) {
          // 分为9个部分
          for (let i: number = 0; i < layoutCount; i++) {
            let xpos = i % 3;
            let ypos = i / 3;

            // 向下舍入小数点
            xpos = ~~xpos;
            ypos = ~~ypos;

            const cc: CubismClippingContext = this._clippingContextListForMask.at(curClipIndex++);
            cc._layoutChannelNo = channelNo;

            cc._layoutBounds.x = xpos / 3.0;
            cc._layoutBounds.y = ypos / 3.0;
            cc._layoutBounds.width = 1.0 / 3.0;
            cc._layoutBounds.height = 1.0 / 3.0;
          }
        } else {
          CubismLogError('not supported mask count : {0}', layoutCount);
        }
      }

    }

    /**
     * 获取颜色缓冲
     * @return 颜色缓冲
     */
    public getColorBuffer(): WebGLTexture {
      return this._colorBuffer;
    }

    /**
     * 获取用于屏幕绘制的剪贴蒙版列表
     * @return 用于屏幕绘制的剪贴蒙版列表
     */
    public getClippingContextListForDraw(): csmVector<CubismClippingContext> {
      return this._clippingContextListForDraw;
    }

    /**
     * 设置剪切蒙版缓冲区的大小
     * @param size 剪切掩码缓冲区大小
     */
    public setClippingMaskBufferSize(size: number): void {
      this._clippingMaskBufferSize = size;
    }

    /**
     * 获取剪切蒙版缓冲区的大小
     * @return 剪切掩码缓冲区大小
     */
    public getClippingMaskBufferSize(): number {
      return this._clippingMaskBufferSize;
    }
  }

  /**
   * 定义渲染纹理资源的结构
   * 与剪贴蒙版一起使用
   */
  export class CubismRenderTextureResource {

    public frameNo: number;    // 渲染器帧号
    public texture: WebGLFramebuffer;    // 纹理地址
    /**
     * 带参数的构造函数
     * @param frameNo 渲染器帧号
     * @param texture 纹理地址
     */
    public constructor(frameNo: number, texture: WebGLFramebuffer) {
      this.frameNo = frameNo;
      this.texture = texture;
    }
  }

  /**
   * 剪切蒙版上下文
   */
  export class CubismClippingContext {

    public _isUsing: boolean = undefined as any;  // 如果当前绘图状态需要蒙版准备，则为真
    public readonly _clippingIdList: Int32Array;    // 剪贴蒙版ID列表
    public _clippingIdCount: number;   // 剪切蒙版的数量
    public _layoutChannelNo: number = undefined as any;  // RGBA的哪个通道放置此剪辑（0：R，1：G，2：B，3：A）
    public _layoutBounds: csmRect; // 掩模通道的哪个区域插入了掩模（视图坐标为-1到1，UV变为0到1）
    public _allClippedDrawRect: csmRect;   // 使用此剪切，剪切所有绘图对象的边界矩形（每次更新）
    public _matrixForMask: CubismMatrix44; // 矩阵保持掩码位置计算结果
    public _matrixForDraw: CubismMatrix44; // 保存绘图对象的位置计算结果的矩阵
    public _clippedDrawableIndexList: number[]; // 剪裁到此蒙版的绘图对象列表

    private _owner: CubismClippingManager_WebGL;    // 管理此掩码的管理器实例
    /**
     * 带参数的构造函数
     */
    public constructor(manager: CubismClippingManager_WebGL, clippingDrawableIndices: Int32Array, clipCount: number) {
      this._owner = manager;

      // 剪切的可绘制索引列表（=用于屏蔽）
      this._clippingIdList = clippingDrawableIndices;

      // 面具数量
      this._clippingIdCount = clipCount;

      this._allClippedDrawRect = new csmRect();
      this._layoutBounds = new csmRect();

      this._clippedDrawableIndexList = new Array();

      this._matrixForMask = new CubismMatrix44();
      this._matrixForDraw = new CubismMatrix44();
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      if (this._layoutBounds != null) {
        this._layoutBounds = null as any;
      }

      if (this._allClippedDrawRect != null) {
        this._allClippedDrawRect = null as any;
      }

      if (this._clippedDrawableIndexList != null) {
        this._clippedDrawableIndexList = null as any;
      }
    }

    /**
     * 添加剪裁到此蒙版的绘图对象
     *
     * @param drawableIndex 要添加到剪切目标的绘图对象的索引
     */
    public addClippedDrawable(drawableIndex: number) {
      this._clippedDrawableIndexList.push(drawableIndex);
    }

    /**
     * 获取管理此掩码的管理器实例
     * @return 剪辑管理器的一个实例
     */
    public getClippingManager(): CubismClippingManager_WebGL {
      return this._owner;
    }

    public setGl(gl: WebGLRenderingContext): void {
      this._owner.setGL(gl);
    }
  }

  /**
   * 用于生成/销毁WebGL着色器程序的类
   * 它是一个单例类，可以从CubismShader_WebGL.getInstance访问
   */
  export class CubismShader_WebGL {
    /**
     * 获取实例（单例）
     * @return 实例
     */
    public static getInstance(): CubismShader_WebGL {
      if (s_instance == null) {
        s_instance = new CubismShader_WebGL();

        return s_instance;
      }
      return s_instance;
    }

    /**
     * 发布实例（单例）
     */
    public static deleteInstance(): void {
      if (s_instance) {
        s_instance.release();
        s_instance = null as any;
      }
    }

    public _shaderSets: csmVector<CubismShaderSet>; // 保存已加载着色器程序的变量
    public gl: WebGLRenderingContext = undefined as any;  // webgl上下文

    /**
     * 私有构造函数
     */
    private constructor() {
      this._shaderSets = new csmVector<CubismShaderSet>();
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      this.releaseShaderProgram();
    }

    /**
     * 运行一系列着色器程序设置
     * @param renderer 渲染器实例
     * @param textureId GPU纹理ID
     * @param vertexCount 多边形网格的顶点数
     * @param vertexArray 多边形网格的顶点数组
     * @param indexArray　索引缓冲区的顶点数组
     * @param uvArray uv阵列
     * @param opacity 不透明度
     * @param colorBlendMode 颜色混合类型
     * @param baseColor 基色
     * @param isPremultipliedAlpha 是否乘以alpha
     * @param matrix4x4 Model-View-Projection矩阵
     */
    public setupShaderProgram(renderer: CubismRenderer_WebGL,
                              textureId: WebGLTexture,
                              vertexCount: number,
                              vertexArray: Float32Array,
                              indexArray: Uint16Array,
                              uvArray: Float32Array,
                              bufferData: {
        vertex: WebGLBuffer,
        uv: WebGLBuffer,
        index: WebGLBuffer,
      },
                              opacity: number,
                              colorBlendMode: CubismBlendMode,
                              baseColor: CubismTextureColor,
                              isPremultipliedAlpha: boolean,
                              matrix4x4: CubismMatrix44): void {
      if (!isPremultipliedAlpha) {
        CubismLogError('NoPremultipliedAlpha is not allowed');
      }

      if (this._shaderSets.getSize() == 0) {
        this.generateShaders();
      }

      // Blending
      let SRC_COLOR: number;
      let DST_COLOR: number;
      let SRC_ALPHA: number;
      let DST_ALPHA: number;

      if (renderer.getClippingContextBufferForMask() != null) {
        const shaderSet: CubismShaderSet = this._shaderSets.at(ShaderNames.ShaderNames_SetupMask);
        this.gl.useProgram(shaderSet.shaderProgram);

        // 纹理设置
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textureId);
        this.gl.uniform1i(shaderSet.samplerTexture0Location, 0);

        // 顶点阵列设置（VBO）
        if (bufferData.vertex == null) {
          bufferData.vertex = this.gl.createBuffer() as any;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributePositionLocation);
        this.gl.vertexAttribPointer(shaderSet.attributePositionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // 纹理顶点设置
        if (bufferData.uv == null) {
          bufferData.uv = this.gl.createBuffer() as any;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.uv);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributeTexCoordLocation);
        this.gl.vertexAttribPointer(shaderSet.attributeTexCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // 渠道
        const channelNo: number = renderer.getClippingContextBufferForMask()._layoutChannelNo;
        const colorChannel: CubismTextureColor = renderer.getClippingContextBufferForMask().getClippingManager().getChannelFlagAsColor(channelNo);
        this.gl.uniform4f(shaderSet.uniformChannelFlagLocation, colorChannel.R, colorChannel.G, colorChannel.B, colorChannel.A);

        this.gl.uniformMatrix4fv(shaderSet.uniformClipMatrixLocation, false, renderer.getClippingContextBufferForMask()._matrixForMask.getArray());

        const rect: csmRect = renderer.getClippingContextBufferForMask()._layoutBounds;

        this.gl.uniform4f(
          shaderSet.uniformBaseColorLocation,
          rect.x * 2.0 - 1.0,
          rect.y * 2.0 - 1.0,
          rect.getRight() * 2.0 - 1.0,
          rect.getBottom() * 2.0 - 1.0,
        );

        SRC_COLOR = this.gl.ZERO;
        DST_COLOR = this.gl.ONE_MINUS_SRC_COLOR;
        SRC_ALPHA = this.gl.ZERO;
        DST_ALPHA = this.gl.ONE_MINUS_SRC_ALPHA;
      } else {
        const masked: boolean = renderer.getClippingContextBufferForDraw() != null; // この描画オブジェクトはマスク対象か
        const offset: number = (masked ? 1 : 0);

        let shaderSet: CubismShaderSet = new CubismShaderSet();

        switch (colorBlendMode) {
          case CubismBlendMode.CubismBlendMode_Normal:
          default:
            shaderSet = this._shaderSets.at(ShaderNames.ShaderNames_NormalPremultipliedAlpha + offset);
            SRC_COLOR = this.gl.ONE;
            DST_COLOR = this.gl.ONE_MINUS_SRC_ALPHA;
            SRC_ALPHA = this.gl.ONE;
            DST_ALPHA = this.gl.ONE_MINUS_SRC_ALPHA;
            break;

          case CubismBlendMode.CubismBlendMode_Additive:
            shaderSet = this._shaderSets.at(ShaderNames.ShaderNames_AddPremultipliedAlpha + offset);
            SRC_COLOR = this.gl.ONE;
            DST_COLOR = this.gl.ONE;
            SRC_ALPHA = this.gl.ZERO;
            DST_ALPHA = this.gl.ONE;
            break;

          case CubismBlendMode.CubismBlendMode_Multiplicative:
            shaderSet = this._shaderSets.at(ShaderNames.ShaderNames_MultPremultipliedAlpha + offset);
            SRC_COLOR = this.gl.DST_COLOR;
            DST_COLOR = this.gl.ONE_MINUS_SRC_ALPHA;
            SRC_ALPHA = this.gl.ZERO;
            DST_ALPHA = this.gl.ONE;
            break;
        }

        this.gl.useProgram(shaderSet.shaderProgram);

        // 顶点数组设置
        if (bufferData.vertex == null) {
          bufferData.vertex = this.gl.createBuffer() as any;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributePositionLocation);
        this.gl.vertexAttribPointer(shaderSet.attributePositionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // 纹理顶点设置
        if (bufferData.uv == null) {
          bufferData.uv = this.gl.createBuffer() as any;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.uv);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributeTexCoordLocation);
        this.gl.vertexAttribPointer(shaderSet.attributeTexCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        if (masked) {
          this.gl.activeTexture(this.gl.TEXTURE1);
          const tex: WebGLTexture = renderer.getClippingContextBufferForDraw().getClippingManager().getColorBuffer();
          this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
          this.gl.uniform1i(shaderSet.samplerTexture1Location, 1);

          // 设置矩阵以将视图坐标转换为ClippingContext坐标
          this.gl.uniformMatrix4fv(shaderSet.uniformClipMatrixLocation, false, renderer.getClippingContextBufferForDraw()._matrixForDraw.getArray());

          // 设置要使用的颜色通道
          const channelNo: number = renderer.getClippingContextBufferForDraw()._layoutChannelNo;
          const colorChannel: CubismTextureColor = renderer.getClippingContextBufferForDraw().getClippingManager().getChannelFlagAsColor(channelNo);
          this.gl.uniform4f(shaderSet.uniformChannelFlagLocation, colorChannel.R, colorChannel.G, colorChannel.B, colorChannel.A);
        }

        // 纹理设置
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textureId);
        this.gl.uniform1i(shaderSet.samplerTexture0Location, 0);

        // 协调转型
        this.gl.uniformMatrix4fv(shaderSet.uniformMatrixLocation, false, matrix4x4.getArray());

        this.gl.uniform4f(shaderSet.uniformBaseColorLocation, baseColor.R, baseColor.G, baseColor.B, baseColor.A);
      }

      // 创建IBO并传输数据
      if (bufferData.index == null) {
        bufferData.index = this.gl.createBuffer() as any;
      }
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferData.index);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indexArray, this.gl.DYNAMIC_DRAW);
      this.gl.blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA, DST_ALPHA);
    }

    /**
     * 释放着色器程序
     */
    public releaseShaderProgram(): void {
      for (let i: number = 0; i < this._shaderSets.getSize(); i++) {
        this.gl.deleteProgram(this._shaderSets.at(i).shaderProgram);
        this._shaderSets.at(i).shaderProgram = 0;
        this._shaderSets.set(i, void 0 as any);
        this._shaderSets.set(i, null as any);
      }
    }

    /**
     * 初始化着色器程序
     * @param vertShaderSrc 顶点着色器源
     * @param fragShaderSrc 片段着色器源
     */
    public generateShaders(): void {
      for (let i: number = 0; i < shaderCount; i++) {
        this._shaderSets.pushBack(new CubismShaderSet());
      }

      this._shaderSets.at(0).shaderProgram = this.loadShaderProgram(vertexShaderSrcSetupMask, fragmentShaderSrcsetupMask);

      this._shaderSets.at(1).shaderProgram = this.loadShaderProgram(vertexShaderSrc, fragmentShaderSrcPremultipliedAlpha);
      this._shaderSets.at(2).shaderProgram = this.loadShaderProgram(vertexShaderSrcMasked, fragmentShaderSrcMaskPremultipliedAlpha);

      // 使用相同的着色器进行添加
      this._shaderSets.at(3).shaderProgram = this._shaderSets.at(1).shaderProgram;
      this._shaderSets.at(4).shaderProgram = this._shaderSets.at(2).shaderProgram;

      // 乘法也像往常一样使用相同的着色器
      this._shaderSets.at(5).shaderProgram = this._shaderSets.at(1).shaderProgram;
      this._shaderSets.at(6).shaderProgram = this._shaderSets.at(2).shaderProgram;

      // SetupMask
      this._shaderSets.at(0).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(0).shaderProgram, 'a_position');
      this._shaderSets.at(0).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(0).shaderProgram, 'a_texCoord');
      this._shaderSets.at(0).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(0).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(0).uniformClipMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(0).shaderProgram, 'u_clipMatrix') as any;
      this._shaderSets.at(0).uniformChannelFlagLocation = this.gl.getUniformLocation(this._shaderSets.at(0).shaderProgram, 'u_channelFlag') as any;
      this._shaderSets.at(0).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(0).shaderProgram, 'u_baseColor') as any;

      // 正常（PremultipliedAlpha）
      this._shaderSets.at(1).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(1).shaderProgram, 'a_position');
      this._shaderSets.at(1).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(1).shaderProgram, 'a_texCoord');
      this._shaderSets.at(1).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(1).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(1).uniformMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(1).shaderProgram, 'u_matrix') as any;
      this._shaderSets.at(1).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(1).shaderProgram, 'u_baseColor') as any;

      // 正常（剪切，预乘Alpha）
      this._shaderSets.at(2).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(2).shaderProgram, 'a_position');
      this._shaderSets.at(2).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(2).shaderProgram, 'a_texCoord');
      this._shaderSets.at(2).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(2).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(2).samplerTexture1Location = this.gl.getUniformLocation(this._shaderSets.at(2).shaderProgram, 's_texture1') as any;
      this._shaderSets.at(2).uniformMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(2).shaderProgram, 'u_matrix') as any;
      this._shaderSets.at(2).uniformClipMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(2).shaderProgram, 'u_clipMatrix') as any;
      this._shaderSets.at(2).uniformChannelFlagLocation = this.gl.getUniformLocation(this._shaderSets.at(2).shaderProgram, 'u_channelFlag') as any;
      this._shaderSets.at(2).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(2).shaderProgram, 'u_baseColor') as any;

      // 加法（PremultipliedAlpha）
      this._shaderSets.at(3).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(3).shaderProgram, 'a_position');
      this._shaderSets.at(3).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(3).shaderProgram, 'a_texCoord');
      this._shaderSets.at(3).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(3).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(3).uniformMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(3).shaderProgram, 'u_matrix') as any;
      this._shaderSets.at(3).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(3).shaderProgram, 'u_baseColor') as any;

      // 加法（clip，PremultipliedAlpha）
      this._shaderSets.at(4).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(4).shaderProgram, 'a_position');
      this._shaderSets.at(4).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(4).shaderProgram, 'a_texCoord');
      this._shaderSets.at(4).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(4).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(4).samplerTexture1Location = this.gl.getUniformLocation(this._shaderSets.at(4).shaderProgram, 's_texture1') as any;
      this._shaderSets.at(4).uniformMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(4).shaderProgram, 'u_matrix') as any;
      this._shaderSets.at(4).uniformClipMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(4).shaderProgram, 'u_clipMatrix') as any;
      this._shaderSets.at(4).uniformChannelFlagLocation = this.gl.getUniformLocation(this._shaderSets.at(4).shaderProgram, 'u_channelFlag') as any;
      this._shaderSets.at(4).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(4).shaderProgram, 'u_baseColor') as any;

      // 乘法（PremultipliedAlpha）
      this._shaderSets.at(5).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(5).shaderProgram, 'a_position');
      this._shaderSets.at(5).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(5).shaderProgram, 'a_texCoord');
      this._shaderSets.at(5).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(5).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(5).uniformMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(5).shaderProgram, 'u_matrix') as any;
      this._shaderSets.at(5).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(5).shaderProgram, 'u_baseColor') as any;

      // 乘法（clip，PremultipliedAlpha）
      this._shaderSets.at(6).attributePositionLocation = this.gl.getAttribLocation(this._shaderSets.at(6).shaderProgram, 'a_position');
      this._shaderSets.at(6).attributeTexCoordLocation = this.gl.getAttribLocation(this._shaderSets.at(6).shaderProgram, 'a_texCoord');
      this._shaderSets.at(6).samplerTexture0Location = this.gl.getUniformLocation(this._shaderSets.at(6).shaderProgram, 's_texture0') as any;
      this._shaderSets.at(6).samplerTexture1Location = this.gl.getUniformLocation(this._shaderSets.at(6).shaderProgram, 's_texture1') as any;
      this._shaderSets.at(6).uniformMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(6).shaderProgram, 'u_matrix') as any;
      this._shaderSets.at(6).uniformClipMatrixLocation = this.gl.getUniformLocation(this._shaderSets.at(6).shaderProgram, 'u_clipMatrix') as any;
      this._shaderSets.at(6).uniformChannelFlagLocation = this.gl.getUniformLocation(this._shaderSets.at(6).shaderProgram, 'u_channelFlag') as any;
      this._shaderSets.at(6).uniformBaseColorLocation = this.gl.getUniformLocation(this._shaderSets.at(6).shaderProgram, 'u_baseColor') as any;
    }

    /**
     * 加载着色器程序和返回地址
     * @param vertexShaderSource    顶点着色器源
     * @param fragmentShaderSource  片段着色器源
     * @return 着色器程序地址
     */
    public loadShaderProgram(vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
      // Create Shader Program
      let shaderProgram: WebGLProgram = this.gl.createProgram() as any;

      let vertShader = this.compileShaderSource(this.gl.VERTEX_SHADER, vertexShaderSource);

      if (!vertShader) {
        CubismLogError('Vertex shader compile error!');
        return 0;
      }

      let fragShader = this.compileShaderSource(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
      if (!fragShader) {
        CubismLogError('Vertex shader compile error!');
        return 0;
      }

      // Attach vertex shader to program
      this.gl.attachShader(shaderProgram, vertShader);

      // Attach fragment shader to program
      this.gl.attachShader(shaderProgram, fragShader);

      // link program
      this.gl.linkProgram(shaderProgram);
      const linkStatus = this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS);

      // 如果链接失败，请删除着色器
      if (!linkStatus) {
        CubismLogError('Failed to link program: {0}', shaderProgram);

        this.gl.deleteShader(vertShader);
        vertShader = 0;

        this.gl.deleteShader(fragShader);
        fragShader = 0;

        if (shaderProgram) {
          this.gl.deleteProgram(shaderProgram);
          shaderProgram = 0;
        }

        return 0;
      }

      // Release vertex and fragment shaders.
      this.gl.deleteShader(vertShader);
      this.gl.deleteShader(fragShader);

      return shaderProgram;
    }

    /**
     * 编译着色器程序
     * @param shaderType 着色器类型（顶点/片段）
     * @param shaderSource 着色器源代码
     *
     * @return 编译着色器程序
     */
    public compileShaderSource(shaderType: GLenum, shaderSource: string): WebGLProgram {
      const source: string = shaderSource;

      const shader: WebGLProgram = this.gl.createShader(shaderType) as any;
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);

      if (!shader) {
        const log: string = this.gl.getShaderInfoLog(shader) as any;
        CubismLogError('Shader compile log: {0} ', log);
      }

      const status: any = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
      if (!status) {
        this.gl.deleteShader(shader);
        return null as any;
      }

      return shader;
    }

    public setGl(gl: WebGLRenderingContext): void {
      this.gl = gl;
    }
  }

  /**
   * CubismShader_WebGL的内部类
   */
  export class CubismShaderSet {
    public shaderProgram: WebGLProgram = undefined as any;                         // 着色器程序地址
    public attributePositionLocation: GLuint = undefined as any;                  // 要传递给着色器程序的变量的地址（Position）
    public attributeTexCoordLocation: GLuint = undefined as any;                  // 要传递给着色器程序的变量的地址（TexCoord）
    public uniformMatrixLocation: WebGLUniformLocation = undefined as any;        // 要传递给着色器程序的变量的地址（Matrix）
    public uniformClipMatrixLocation: WebGLUniformLocation = undefined as any;    // 要传递给着色器程序的变量的地址（ClipMatrix）
    public samplerTexture0Location: WebGLUniformLocation = undefined as any;      // 要传递给着色器程序的变量的地址（Texture0）
    public samplerTexture1Location: WebGLUniformLocation = undefined as any;      // 要传递给着色器程序的变量的地址（Texture1）
    public uniformBaseColorLocation: WebGLUniformLocation = undefined as any;     // 要传递给着色器程序的变量的地址（BaseColor）
    public uniformChannelFlagLocation: WebGLUniformLocation = undefined as any;   // 要传递给着色器程序的变量的地址（ChannelFlag）
  }

  export enum ShaderNames {
    // SetupMask
    ShaderNames_SetupMask,

    // Normal
    ShaderNames_NormalPremultipliedAlpha,
    ShaderNames_NormalMaskedPremultipliedAlpha,

    // Add
    ShaderNames_AddPremultipliedAlpha,
    ShaderNames_AddMaskedPremultipledAlpha,

    // Mult
    ShaderNames_MultPremultipliedAlpha,
    ShaderNames_MultMaskedPremultipliedAlpha,
  }

  export const vertexShaderSrcSetupMask =
    'attribute vec4     a_position;' +
    'attribute vec2     a_texCoord;' +
    'varying vec2       v_texCoord;' +
    'varying vec4       v_myPos;' +
    'uniform mat4       u_clipMatrix;' +
    'void main()' +
    '{' +
    '   gl_Position = u_clipMatrix * a_position;' +
    '   v_myPos = u_clipMatrix * a_position;' +
    '   v_texCoord = a_texCoord;' +
    '   v_texCoord.y = 1.0 - v_texCoord.y;' +
    '}';
  export const fragmentShaderSrcsetupMask =
    'precision mediump float;' +
    'varying vec2       v_texCoord;' +
    'varying vec4       v_myPos;' +
    'uniform vec4       u_baseColor;' +
    'uniform vec4       u_channelFlag;' +
    'uniform sampler2D  s_texture0;' +
    'void main()' +
    '{' +
    '   float isInside = ' +
    '       step(u_baseColor.x, v_myPos.x/v_myPos.w)' +
    '       * step(u_baseColor.y, v_myPos.y/v_myPos.w)' +
    '       * step(v_myPos.x/v_myPos.w, u_baseColor.z)' +
    '       * step(v_myPos.y/v_myPos.w, u_baseColor.w);' +
    '   gl_FragColor = u_channelFlag * texture2D(s_texture0, v_texCoord).a * isInside;' +
    '}';

  // ----- 顶点着色器程序 -----
  // Normal & Add & Mult 共通
  export const vertexShaderSrc =
    'attribute vec4     a_position;' + // v.vertex
    'attribute vec2     a_texCoord;' + // v.texcoord
    'varying vec2       v_texCoord;' + // v2f.texcoord
    'uniform mat4       u_matrix;' +
    'void main()' +
    '{' +
    '   gl_Position = u_matrix * a_position;' +
    '   v_texCoord = a_texCoord;' +
    '   v_texCoord.y = 1.0 - v_texCoord.y;' +
    '}';

  // Normal & Add & Mult 共通（用于绘制剪切的对象）
  export const vertexShaderSrcMasked =
    'attribute vec4     a_position;' +
    'attribute vec2     a_texCoord;' +
    'varying vec2       v_texCoord;' +
    'varying vec4       v_clipPos;' +
    'uniform mat4       u_matrix;' +
    'uniform mat4       u_clipMatrix;' +
    'void main()' +
    '{' +
    '   gl_Position = u_matrix * a_position;' +
    '   v_clipPos = u_clipMatrix * a_position;' +
    '   v_texCoord = a_texCoord;' +
    '   v_texCoord.y = 1.0 - v_texCoord.y;' +
    '}';

  // ----- 片段着色器程序 -----
  // Normal & Add & Mult 共通 （PremultipliedAlpha）
  export const fragmentShaderSrcPremultipliedAlpha =
    'precision mediump float;' +
    'varying vec2       v_texCoord;' + // v2f.texcoord
    'uniform vec4       u_baseColor;' +
    'uniform sampler2D  s_texture0;' + // _MainTex
    'void main()' +
    '{' +
    '   gl_FragColor = texture2D(s_texture0 , v_texCoord) * u_baseColor;' +
    '}';

  // Normal （用于绘制剪切对象，也用作PremultipliedAlpha）
  export const fragmentShaderSrcMaskPremultipliedAlpha =
    'precision mediump float;' +
    'varying vec2       v_texCoord;' +
    'varying vec4       v_clipPos;' +
    'uniform vec4       u_baseColor;' +
    'uniform vec4       u_channelFlag;' +
    'uniform sampler2D  s_texture0;' +
    'uniform sampler2D  s_texture1;' +
    'void main()' +
    '{' +
    '   vec4 col_formask = texture2D(s_texture0 , v_texCoord) * u_baseColor;' +
    '   vec4 clipMask = (1.0 - texture2D(s_texture1, v_clipPos.xy / v_clipPos.w)) * u_channelFlag;' +
    '   float maskVal = clipMask.r + clipMask.g + clipMask.b + clipMask.a;' +
    '   col_formask = col_formask * maskVal;' +
    '   gl_FragColor = col_formask;' +
    '}';

  /**
   * 实现WebGL绘图指令的类
   */
  export class CubismRenderer_WebGL extends CubismRenderer {

    /**
     * 释放渲染器保留的静态资源
     * 免费的WebGL静态着色器程序
     */
    public static doStaticRelease(): void {
      CubismShader_WebGL.deleteInstance();
    }

    public _textures: csmMap<number, WebGLTexture>;                      // 模型引用的纹理和渲染器绑定的纹理之间的映射
    public _sortedDrawableIndexList: csmVector<number>;             // 按绘制顺序排列的绘图对象索引列表
    public _clippingManager: CubismClippingManager_WebGL;          // 剪切蒙版管理对象
    public _clippingContextBufferForMask: CubismClippingContext;   // 用于在蒙版纹理上绘制的剪切上下文
    public _clippingContextBufferForDraw: CubismClippingContext;   // 剪切在屏幕上绘制的上下文
    public firstDraw: boolean;
    public _bufferData: {
      vertex: WebGLBuffer,
      uv: WebGLBuffer,
      index: WebGLBuffer,
    }; // 顶点缓冲区数据
    public gl: WebGLRenderingContext = undefined as any;  // webgl上下文

    /**
     * 构造函数
     */
    public constructor() {
      super();
      this._clippingContextBufferForMask = null as any;
      this._clippingContextBufferForDraw = null as any;
      this._clippingManager = new CubismClippingManager_WebGL();
      this.firstDraw = true;
      this._textures = new csmMap<number, number>();
      this._sortedDrawableIndexList = new csmVector<number>();
      this._bufferData = {
        vertex: WebGLBuffer = null as any,
        uv: WebGLBuffer = null as any,
        index: WebGLBuffer = null as any,
      };

      // 保留纹理贴图的容量
      this._textures.prepareCapacity(32, true);
    }
    /**
     * 执行渲染器初始化过程
     * 可以从传递给参数的模型中提取渲染器初始化处理所需的信息
     *
     * @param model 模型实例
     */
    public initialize(model: CubismModel): void {
      if (model.isUsingMasking()) {
        this._clippingManager = new CubismClippingManager_WebGL(); // 初始化剪切掩码缓冲区预处理方法
        this._clippingManager.initialize(
          model,
          model.getDrawableCount(),
          model.getDrawableMasks(),
          model.getDrawableMaskCounts(),
        );
      }

      this._sortedDrawableIndexList.resize(model.getDrawableCount(), 0);

      super.initialize(model); // 调用父类处理
    }

    /**
     * WebGL纹理绑定处理
     * 在CubismRenderer中设置纹理，并返回一个Index值，以便在CubismRenderer中引用图像
     * @param modelTextureNo 要设置的模型纹理编号
     * @param glTextureNo WebGL纹理编号
     */
    public bindTexture(modelTextureNo: number, glTexture: WebGLTexture): void {
      this._textures.setValue(modelTextureNo, glTexture);
    }

    /**
     * 获取绑定到WebGL的纹理列表
     * @return 纹理列表
     */
    public getBindedTextures(): csmMap<number, WebGLTexture> {
      return this._textures;
    }

    /**
     * 设置剪切蒙版缓冲区的大小
     * 处理成本很高，因为掩码的FrameBuffer被丢弃并重新创建。
     * @param size クリッピングマスクバッファのサイズ
     */
    public setClippingMaskBufferSize(size: number) {
      // 销毁并重新创建实例以更改FrameBuffer大小
      this._clippingManager.release();
      this._clippingManager = void 0 as any;
      this._clippingManager = null as any;

      this._clippingManager = new CubismClippingManager_WebGL();

      this._clippingManager.setClippingMaskBufferSize(size);

      this._clippingManager.initialize(
        this.getModel(),
        this.getModel().getDrawableCount(),
        this.getModel().getDrawableMasks(),
        this.getModel().getDrawableMaskCounts(),
      );
    }

    /**
     * 获取剪切蒙版缓冲区的大小
     * @return 剪切掩码缓冲区大小
     */
    public getClippingMaskBufferSize(): number {
      return this._clippingManager.getClippingMaskBufferSize();
    }

    /**
     * 析构函数等效处理
     */
    public release(): void {
      this._clippingManager.release();
      this._clippingManager = void 0 as any;
      this._clippingManager = null as any;

      this.gl.deleteBuffer(this._bufferData.vertex);
      this._bufferData.vertex = null as any;
      this.gl.deleteBuffer(this._bufferData.uv);
      this._bufferData.uv = null as any;
      this.gl.deleteBuffer(this._bufferData.index);
      this._bufferData.index = null as any;
      this._bufferData = null as any;

      this._textures = null as any;
    }

    /**
     * 绘制模型的实际过程
     */
    public doDrawModel(): void {
      // ------------ 剪切掩模/缓冲预处理方法 ------------
      if (this._clippingManager != null) {
        this.preDraw();
        this._clippingManager.setupClippingContext(this.getModel(), this);
      }

      // 请注意，即使在上述剪切过程中也会调用PreDraw一次！
      this.preDraw();

      const drawableCount: number = this.getModel().getDrawableCount();
      const renderOrder: Int32Array = this.getModel().getDrawableRenderOrders();

      // 按绘制顺序对索引排序
      for (let i: number = 0; i < drawableCount; ++i) {
        const order: number = renderOrder[i];
        this._sortedDrawableIndexList.set(order, i);
      }

      // 制图
      for (let i: number = 0; i < drawableCount; ++i) {
        const drawableIndex: number = this._sortedDrawableIndexList.at(i);

        // 如果未显示Drawable，请传递该过程
        if (!this.getModel().getDrawableDynamicFlagIsVisible(drawableIndex)) {
          continue;
        }

        // 设置剪贴蒙版
        this.setClippingContextBufferForDraw(
          (this._clippingManager != null)
            ? (this._clippingManager.getClippingContextListForDraw()).at(drawableIndex)
            : null as any,
        );

        this.setIsCulling(this.getModel().getDrawableCulling(drawableIndex));

        this.drawMesh(
          this.getModel().getDrawableTextureIndices(drawableIndex),
          this.getModel().getDrawableVertexIndexCount(drawableIndex),
          this.getModel().getDrawableVertexCount(drawableIndex),
          this.getModel().getDrawableVertexIndices(drawableIndex),
          this.getModel().getDrawableVertices(drawableIndex),
          this.getModel().getDrawableVertexUvs(drawableIndex),
          this.getModel().getDrawableOpacity(drawableIndex),
          this.getModel().getDrawableBlendMode(drawableIndex),
        );
      }
    }

    /**
     * [オーバーライド]
     * 绘制绘图对象（艺术网格）
     * 将多边形网格和纹理编号作为一组传递。
     * @param textureNo 要绘制的纹理编号
     * @param indexCount 绘图对象的索引值
     * @param vertexCount 多边形网格的顶点数
     * @param indexArray 多边形网格索引数组
     * @param vertexArray 多边形网格的顶点数组
     * @param uvArray uv阵列
     * @param opacity 不透明度
     * @param colorBlendMode 颜色组成类型
     */
    public drawMesh(textureNo: number, indexCount: number, vertexCount: number,
                    indexArray: Uint16Array, vertexArray: Float32Array, uvArray: Float32Array,
                    opacity: number, colorBlendMode: CubismBlendMode): void {
      // 启用/禁用背面绘图
      if (this.isCulling()) {
        this.gl.enable(this.gl.CULL_FACE);
      } else {
        this.gl.disable(this.gl.CULL_FACE);
      }

      this.gl.frontFace(this.gl.CCW);    // Cubism3 OpenGL具有用于蒙版和艺术网格的CCW表面

      const modelColorRGBA: CubismTextureColor = this.getModelColor();

      if (this.getClippingContextBufferForMask() == null) {
        modelColorRGBA.A *= opacity;
        if (this.isPremultipliedAlpha()) {
          modelColorRGBA.R *= modelColorRGBA.A;
          modelColorRGBA.G *= modelColorRGBA.A;
          modelColorRGBA.B *= modelColorRGBA.A;
        }
      }

      let drawtexture: WebGLTexture;  // 纹理传递到着色器

      // 从纹理贴图中获取绑定的纹理ID
      // 如果未绑定，请设置虚拟纹理ID
      if (this._textures.getValue(textureNo) != null) {
        drawtexture = this._textures.getValue(textureNo);
      } else {
        drawtexture = null as any;
      }

      CubismShader_WebGL.getInstance().setupShaderProgram(
        this, drawtexture, vertexCount, vertexArray, indexArray, uvArray,
        this._bufferData,
        opacity, colorBlendMode, modelColorRGBA, this.isPremultipliedAlpha(),
        this.getMvpMatrix(),
      );

      // 绘制多边形网格
      this.gl.drawElements(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_SHORT, 0);

      // 后处理
      this.gl.useProgram(null);
      this.setClippingContextBufferForDraw(null as any);
      this.setClippingContextBufferForMask(null as any);
    }

    /**
     * 设置渲染状态
     * @param fbo 应用程序端指定的帧缓冲区
     * @param viewport 视口
     */
    public setRenderState(fbo: WebGLFramebuffer, viewport: number[]): void {
      s_fbo = fbo;
      s_viewport = viewport;
    }

    /**
     * 绘图开始时的附加处理
     * 在绘制模型之前实现剪切蒙版所需的处理
     */
    public preDraw(): void {
      if (this.firstDraw) {
        this.firstDraw = false;

        // 启用扩展
        this._anisortopy = this.gl.getExtension('EXT_texture_filter_anisotropic') ||
          this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
          this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
      }

      this.gl.disable(this.gl.SCISSOR_TEST);
      this.gl.disable(this.gl.STENCIL_TEST);
      this.gl.disable(this.gl.DEPTH_TEST);

      // 剔除（1.0beta3）
      this.gl.frontFace(this.gl.CW);

      this.gl.enable(this.gl.BLEND);
      this.gl.colorMask(true, true, true, true);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);  // 如果缓冲区先前已绑定，则必须销
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * 设置要在蒙版纹理上绘制的剪切上下文
     */
    public setClippingContextBufferForMask(clip: CubismClippingContext) {
      this._clippingContextBufferForMask = clip;
    }

    /**
     * 获取剪贴上下文以在蒙版纹理上绘制
     * @return 剪切上下文以在蒙版纹理上绘制
     */
    public getClippingContextBufferForMask(): CubismClippingContext {
      return this._clippingContextBufferForMask;
    }

    /**
     * 设置要在屏幕上绘制的剪辑上下文
     */
    public setClippingContextBufferForDraw(clip: CubismClippingContext): void {
      this._clippingContextBufferForDraw = clip;
    }

    /**
     * 获取剪辑上下文以在屏幕上绘制
     * @return 要在屏幕上绘制的剪辑上下文
     */
    public getClippingContextBufferForDraw(): CubismClippingContext {
      return this._clippingContextBufferForDraw;
    }

    /**
     * gl设置
     */
    public startUp(gl: WebGLRenderingContext): void {
      this.gl = gl;
      this._clippingManager.setGL(gl);
      CubismShader_WebGL.getInstance().setGl(gl);
    }
  }

  /**
   * 释放渲染器保留的静态资源
   */
  CubismRenderer.staticRelease = (): void => {
    CubismRenderer_WebGL.doStaticRelease();
  };
}
