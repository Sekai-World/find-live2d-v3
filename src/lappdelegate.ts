/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option } from './framework/live2dcubismframework';
import { Live2DCubismFramework as cubismmatrix44 } from './framework/math/cubismmatrix44';
import Csm_CubismMatrix44 = cubismmatrix44.CubismMatrix44;
import Csm_CubismFramework = live2dcubismframework.CubismFramework;
import { LAppView } from './lappview';
import { LAppPal } from './lapppal';
import { LAppTextureManager } from './lapptexturemanager';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppDefine } from './lappdefine';

export let canvas: HTMLCanvasElement = null as any;
export let s_instance: LAppDelegate = null as any;
export let gl: WebGLRenderingContext = null as any;
export let frameBuffer: WebGLFramebuffer = null as any;

/**
 * 应用类。
 * 管理Cubism3。
 */
export class LAppDelegate {
  /**
   * 返回类的实例（单例）。
   * 如果尚未创建实例，则会在内部创建实例。
   *
   * @return 一个类的实例
   */
  public static getInstance(): LAppDelegate {
    if (s_instance == null) {
      s_instance = new LAppDelegate();
    }

    return s_instance;
  }

  /**
   * 释放一个类的实例（单例）。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance.release();
    }

    s_instance = null as any;
  }

  public _cubismOption: Csm_Option;          // Cubism3 Option
  public _view: LAppView;                    // View信息
  public _captured: boolean;                 // 你点击了吗
  public _mouseX: number;                    // 鼠标X坐标
  public _mouseY: number;                    // 鼠标Y坐标
  public _isEnd: boolean;                    // APP终止了吗
  public _textureManager: LAppTextureManager; // 纹理管理
  public _renderThreadId: number;
  public _renderStatus: boolean;

  /**
   * 构造函数
   */
  constructor() {
    this._captured = false;
    this._mouseX = 0.0;
    this._mouseY = 0.0;
    this._isEnd = false;
    this._renderThreadId = 0;
    this._renderStatus = false;

    this._cubismOption = new Csm_Option();
    this._view = new LAppView();
    this._textureManager = new LAppTextureManager();
  }

  /**
   * 初始化您需要的APP。
   */
  public initialize(): boolean {
    const canvasId = 'live2d-core-canvas';
    const width = window.innerWidth;
    const height = window.innerHeight;
    // 创建html元素
    let wrap = document.getElementById('live2d-core-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'live2d-core-wrap';
      wrap.style.position = 'fixed';
      wrap.style.width = '100%';
      wrap.style.height = '100%';
      wrap.style.top = '0px';
      wrap.style.left = '0px';
      wrap.style.zIndex = '100'
      document.body.appendChild(wrap);
    }
    canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      canvas.style.position = 'fixed';
      canvas.style.left = '0px';
      canvas.style.top = '0px';
      canvas.style.zIndex = '100';
      canvas.setAttribute('width', width.toString());
      canvas.setAttribute('height', height.toString());
      (document.getElementById('live2d-core-wrap') as HTMLDivElement).appendChild(canvas);
    }

    // 初始化gl上下文
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) || canvas.getContext('experimental-webgl') as any;

    if (!gl) {
      alert('WebGL无法初始化。 浏览器似乎不支持');
      gl = null as any;

      // gl初始化失敗
      return false;
    }

    if (!frameBuffer) {
      frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // 透明度设置
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const supportTouch: boolean = 'ontouchend' in canvas;

    if (supportTouch) {
      // 与触摸相关的回调函数注册
      /**
      * 触摸时调用。
      */
      canvas.addEventListener('touchstart', (e: TouchEvent) => {
        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }

        this._captured = true;

        const posX = e.changedTouches[0].pageX;
        const posY = e.changedTouches[0].pageY;
        if (LAppDefine.DebugMode) {
          LAppPal.printLog('[APP]canvas touchStart {0}, {1}', posX, posY);
        }
        this._view.onTouchesBegan(posX, posY);
      });
      /*
      * 触摸移动时调用。
      */
      canvas.addEventListener('touchmove', (e: TouchEvent) => {
        if (!this._captured) {
          return;
        }

        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }

        const rect = (e.target as Element).getBoundingClientRect();

        const posX = e.changedTouches[0].clientX - rect.left;
        const posY = e.changedTouches[0].clientY - rect.top;

        this._view.onTouchesMoved(posX, posY);
      });
    /*
    * 触摸完成时调用。
    */
      canvas.addEventListener('touchend', (e: TouchEvent) => {
        this._captured = false;

        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }

        const rect = (e.target as Element).getBoundingClientRect();

        const posX = e.changedTouches[0].clientX - rect.left;
        const posY = e.changedTouches[0].clientY - rect.top;

        this._view.onTouchesEnded(posX, posY);
      });
    /*
    * 取消触摸。
    */
      canvas.addEventListener('touchcancel', (e: TouchEvent) => {
        this._captured = false;

        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }

        const rect = (e.target as Element).getBoundingClientRect();

        const posX = e.changedTouches[0].clientX - rect.left;
        const posY = e.changedTouches[0].clientY - rect.top;

        this._view.onTouchesEnded(posX, posY);
      });
    } else {
      // 注册鼠标相关的回调函数
      canvas.addEventListener('mousedown', (e: MouseEvent) => {
        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }
        this._captured = true;

        const posX: number = e.pageX;
        const posY: number = e.pageY;
        if (LAppDefine.DebugMode) {
          LAppPal.printLog('[APP]canvas mousedown {0}, {1}', posX, posY);
        }
        this._view.onTouchesBegan(posX, posY);
      });
      canvas.addEventListener('mousemove', (e: MouseEvent) => {
        if (!this._captured) {
          return;
        }

        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }

        const rect = (e.target as Element).getBoundingClientRect();
        const posX: number = e.clientX - rect.left;
        const posY: number = e.clientY - rect.top;
        this._view.onTouchesMoved(posX, posY);
      });
      canvas.addEventListener('mouseup', (e: MouseEvent) => {
        this._captured = false;
        if (!this._view) {
          LAppPal.printLog('view notfound');
          return;
        }


        const rect = (e.target as Element).getBoundingClientRect();
        const posX: number = e.clientX - rect.left;
        const posY: number = e.clientY - rect.top;

        this._view.onTouchesEnded(posX, posY);
      });
    }

    // AppView初始化
    this._view.initialize();

    // Cubism3初始化
    this.initializeCubism();
    return true;
  }

  /**
   * 释放。
   */
  public release(): void {
    this._textureManager.release();
    this._textureManager = null as any;

    this._view.release();
    this._view = null as any;

    // 释放资源
    LAppLive2DManager.releaseInstance();

    // Cubism3释放
    Csm_CubismFramework.dispose();
  }

  /**
   * 执行过程。
   */
  public startRender(param?: { efficient: boolean, fps?: number}): void {
    if (this._renderStatus) {
      return;
    }
    // 主循环
    const loop = () => {
      this._renderStatus = true;
      // 检查实例
      if (s_instance == null) {
        return;
      }

      // 时间更新
      LAppPal.updateTime();

      // 屏幕初始化
      gl.clearColor(0, 0, 0, 0);

      // 启用深度测试
      gl.enable(gl.DEPTH_TEST);

      // 附近的物体遮挡了远处的物体
      gl.depthFunc(gl.LEQUAL);

      // 清除颜色缓冲区和深度缓冲区
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.clearDepth(1.0);

      // 透明度设置
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 绘图更新
      this._view.render();

      // 递归调用循环
      if (Object.prototype.toString.call(param) === '[object Object]' && param) {
        if (param.efficient) {
          this._renderThreadId = requestAnimationFrame(loop);
        } else {
          const fps = param.fps ? param.fps : 60;
          this._renderThreadId = window.setTimeout(() => {
            loop();
          }, 1000 / fps);
        }
      } else {
        this._renderThreadId = requestAnimationFrame(loop);
      }
    };
    loop();
  }

  public stopRender(): void {
    if (!this._renderStatus) {
      return;
    }
    window.cancelAnimationFrame(this._renderThreadId);
    this._renderStatus = false;
  }

  /**
   * 注册着色器。
   */
  public createShader(): WebGLProgram {
    // 顶点着色器编译
    const vertexShaderId = gl.createShader(gl.VERTEX_SHADER);

    if (vertexShaderId == null) {
      LAppPal.printLog('failed to create vertexShader');
      return null as any;
    }

    const vertexShader: string =
      'precision mediump float;' +
      'attribute vec3 position;' +
      'attribute vec2 uv;' +
      'varying vec2 vuv;' +
      'void main(void)' +
      '{' +
      '   gl_Position = vec4(position, 1.0);' +
      '   vuv = uv;' +
      '}';

    gl.shaderSource(vertexShaderId, vertexShader);
    gl.compileShader(vertexShaderId);

    // 片段着色器编译
    const fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    if (fragmentShaderId == null) {
      LAppPal.printLog('failed to create fragmentShader');
      return null as any;
    }

    const fragmentShader: string =
      'precision mediump float;' +
      'varying vec2 vuv;' +
      'uniform sampler2D texture;' +
      'void main(void)' +
      '{' +
      '   gl_FragColor = texture2D(texture, vuv);' +
      '}';

    gl.shaderSource(fragmentShaderId, fragmentShader);
    gl.compileShader(fragmentShaderId);

    // 创建程序对象
    const programId = gl.createProgram();
    gl.attachShader(programId as any, vertexShaderId);
    gl.attachShader(programId as any, fragmentShaderId);

    gl.deleteShader(vertexShaderId);
    gl.deleteShader(fragmentShaderId);

    // 链接
    gl.linkProgram(programId as any);

    gl.useProgram(programId);

    return programId as any;
  }

  /**
   * 获取查看信息。
   */
  public getView(): LAppView {
    return this._view;
  }

  public getTextureManager(): LAppTextureManager {
    return this._textureManager;
  }

  /**
   * Cubism3初始化
   */
  public initializeCubism(): void {
    // setup cubism
    this._cubismOption.logFunction = LAppPal.printMessage;
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
    Csm_CubismFramework.startUp(this._cubismOption);

    // initialize cubism
    Csm_CubismFramework.initialize();

    // default proj
    const projection: Csm_CubismMatrix44 = new Csm_CubismMatrix44();

    LAppPal.updateTime();

    this._view.initializeSprite();
  }
}
