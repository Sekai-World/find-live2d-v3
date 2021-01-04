export namespace Live2DCubismFramework {
  export interface CubismMotionParam {
    groupName: string;
    no: number;
    priority: number;
    fadeInTime?: number;
    fadeOutTime?: number;
    autoIdle?: boolean;
    autoAppear?: boolean;
    callback?: () => void;
  }

  export interface CubismMotionUrlParam {
    motionName: string;
    motionUrl: string;
    priority: number;
    fadeInTime?: number;
    fadeOutTime?: number;
    autoIdle?: boolean;
    autoAppear?: boolean;
    callback?: () => void;
  }
}
