/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as csmvector } from './framework/type/csmvector';
import Csm_csmVector = csmvector.csmVector;
import csmVector_iterator = csmvector.iterator;
import { gl } from './lappdelegate';

/**
 * 纹理管理类
 * 读取和管理图像的类。
 */
export class LAppTextureManager {

  public _textures: Csm_csmVector<TextureInfo>;
  /**
   * 构造函数
   */
  constructor() {
    this._textures = new Csm_csmVector<TextureInfo>();
  }

  /**
   * 释放
   */
  public release(): void {
    for (const ite: csmVector_iterator<TextureInfo> = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement()) {
      gl.deleteTexture(ite.ptr().id);
    }
    this._textures = null as any;
  }

  /**
   * 加载图片
   *
   * @param fileName 要加载的映像文件路径名
   * @param usePremultiply 是否启用Premult处理
   * @return 图像信息，读取失败时返回null
   */
  public createTextureFromPngFile(fileName: string, usePremultiply: boolean, callback: any): void {
    // 搜索已经加载的纹理
    for (const ite: csmVector_iterator<TextureInfo> = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement()) {
      if (ite.ptr().fileName == fileName && ite.ptr().usePremultply == usePremultiply) {
        // 从第二次开始，使用缓存（无等待时间）
        ite.ptr().img.onload = () => {
          callback(ite.ptr());
        };
        ite.ptr().img.src = fileName;
        return;
      }
    }

    // 触发数据onload
    const img = new Image();
    img.onload = () => {
      // 创建纹理对象
      const tex: WebGLTexture = gl.createTexture() as any;

      // 选择纹理
      gl.bindTexture(gl.TEXTURE_2D, tex);

      // 将像素写入纹理
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // 执行Premult处理
      if (usePremultiply) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      }

      // 将像素写入纹理
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      // 生成mipmap
      gl.generateMipmap(gl.TEXTURE_2D);

      // 绑定纹理
      gl.bindTexture(gl.TEXTURE_2D, null);

      const textureInfo: TextureInfo = new TextureInfo();
      if (textureInfo != null) {
        textureInfo.fileName = fileName;
        textureInfo.width = img.width;
        textureInfo.height = img.height;
        textureInfo.id = tex;
        textureInfo.img = img;
        textureInfo.usePremultply = usePremultiply;
        this._textures.pushBack(textureInfo);
      }

      callback(textureInfo);
    };
    img.src = fileName;
  }

  /**
   * 图像释放
   *
   * 释放阵列中的所有图像。
   */
  public releaseTextures(): void {
    for (let i: number = 0; i < this._textures.getSize(); i++) {
      this._textures.set(i, null as any);
    }

    this._textures.clear();
  }

  /**
   * 图像释放
   *
   * 释放指定的纹理图像
   * @param texture 要释放的纹理
   */
  public releaseTextureByTexture(texture: WebGLTexture) {
    for (let i: number = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).id != texture) {
        continue;
      }

      this._textures.set(i, null as any);
      this._textures.remove(i);
      break;
    }
  }

  /**
   * 图像释放
   *
   * 释放具有指定名称的图像。
   * @param fileName 要释放的映像文件路径名
   */
  public releaseTextureByFilePath(fileName: string): void {
    for (let i: number = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).fileName == fileName) {
        this._textures.set(i, null as any);
        this._textures.remove(i);
        break;
      }
    }
  }
}

/**
 * 图像信息结构
 */
export class TextureInfo {
  public img: HTMLImageElement = null as any;      // 图片
  public id: WebGLTexture = null as any;    // 纹理
  public width: number = 0;          // 宽度
  public height: number = 0;         // 高度
  public usePremultply: boolean = false;     // 是否启用Premult处理
  public fileName: string = '';           // 文件名
}
