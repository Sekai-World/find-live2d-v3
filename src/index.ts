import './core/live2dcubismcore.js';
import { LAppDelegate } from './lappdelegate';
import { LAppLive2DManager } from './lapplive2dmanager';

class live2d {
  private live2dmanager: LAppLive2DManager | null = null;
  public initialize(renderConfig?: { efficient: boolean, fps?: number}): LAppLive2DManager | null {
    this.live2dmanager = LAppLive2DManager.getInstance();
    if (this.live2dmanager.initDelegate(renderConfig)) {
      return this.live2dmanager;
    }
    throw new Error('live2d core 初始化失败');
  }

  public release() {
    if (this.live2dmanager) {
      this.live2dmanager.releaseAllModel();
    }
    LAppDelegate.releaseInstance();
  }
}

export default live2d;
