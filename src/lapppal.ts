/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

/**
 * 抽象平台依赖功能 Cubism Platform Abstraction Layer.
 *
 * 将与平台相关的功能放在一起，例如文件读取和时间采集。
 */
export class LAppPal {

  public static lastUpdate = Date.now();

  public static s_currentFrame = 0.0;
  public static s_lastFrame = 0.0;
  public static s_deltaTime = 0.0;

  public static fetchFile(path: string, type?: XMLHttpRequestResponseType) {
    return new Promise<Response>((resolve, reject) => {

      const request = new XMLHttpRequest();
      request.open('GET', path, true);
      if (type) {
        request.responseType = type;
      }
      request.onload = () => {
        let options = {
          status: request.status,
          statusText: request.statusText,
        };
        if ((new RegExp('^file:\/\/\\S+')).test(window.location.href) && options.status === 0) {
          options.status = 200;
        }
        let body = 'response' in request ? request.response : (request as XMLHttpRequest).responseText;
        resolve(new Response(body, options));
      };
      request.onerror = () => {
        reject(new TypeError('Local request failed'));
      };

      request.send();
    });
  }

  /**
   * 将文件作为字节数据读取
   *
   * @param filePath 要读取的文件的路径
   * @return
   * {
   *      buffer,   字节数据读取
   *      size        文件大小
   * }
   */
  public static loadFileAsBytes(filePath: string, callback: any): void {
    // filePath;//
    const path: string = filePath;

    let size = 0;
    this.fetchFile(path, 'arraybuffer').then(
      (response) => {
        return response.arrayBuffer();
      },
    ).then(
      (arrayBuffer) => {
        size = arrayBuffer.byteLength;
        callback(arrayBuffer, size);
      },
    );
  }

  /**
   * 释放字节数据
   * @param byteData 要释放的字节数据
   */
  public static releaseBytes(byteData: ArrayBuffer): void {
    byteData = void 0 as any;
  }

  /**
   * 获取增量时间（与前一帧的差异)
   * @return 时间[ms]
   */
  public static getDeltaTime(): number {
    return this.s_deltaTime;
  }

  public static updateTime(): void {
    this.s_currentFrame = Date.now();
    this.s_deltaTime = (this.s_currentFrame - this.s_lastFrame) / 1000;
    this.s_lastFrame = this.s_currentFrame;
  }

  /**
   * 输出日志
   * @param format 格式化字符串
   * @param ... args（可变长度参数）字符串
   */
  public static printLog(format: string, ...args: any[]): void {
    console.log(
      format.replace(
        /\{(\d+)\}/g,
        (m, k) => {
          return args[k];
        },
      ),
    );
  }

  /**
   * 输出消息
   * @param message 字符串
   */
  public static printMessage(message: string): void {
    LAppPal.printLog(message);
  }
}
