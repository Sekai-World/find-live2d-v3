# 基于live2d 3.3.1
## 安装
``` bash
$ yarn add find-live2d3
or
$ npm install find-live2d3
```
## 初始化
``` typescript
import live2d from 'find-live2d3'
/** 初始化live2d
 * @param renderConfig?: { efficient: boolean, // 是否使用全效能模式
 *  fps?: number // 不使用全效模式事, 手动设置帧率. 默认60
 * }
 */
let live2dInstance = new live2D()
const live2dmanager = live2dInstance.initialize(renderConfig?: { efficient: boolean, fps?: number})
```

``` typescript
/** 添加模型
 * @param object: { path: string, // 模型资源路径, 
 *                  fileName: string    // 模型文件名称(.model3.json之前)
 *                  modelName: string,  // 模型名称,
 *                  modelSize: number, // 模型大小
 *                  textures?: string[] // 纹理名称数组(为空则加载全部纹理)
 *                }
 * @param batchLoad: boolean // 是否启用按需加载模型动画资源. (动画较多时建议启用. 初始化只加载前5个动画资源. 后续动画在使用时加载)
 * @return Promise<Model>
 */
public Promise live2dmanager.addModel({path: '/resource/momo/', fileName:'momo', modelName: 'momo', modelSize?: 1000}, batchLoad)
```

``` javascript
/** 释放指定模型
 * @param modelName: string
 * @return Promise<string>
 */
 public Promise live2dmanager.releaseModel(modelName: string)
```

``` javascript
/** 释放全部模型
 * @return Promise<void>
 */
 public Promise live2dmanager.releaseAllModel()
```

## model对象方法
``` javascript
/**
 * 显示当前模型
 * @param object: {
 *                  pointX: 出现的x坐标. 默认0
 *                  pointY: 出现的Y坐标. 默认0
 *                  zIndex: canvas画布层级. 默认100
 *                }
 */
public void appear(param: { pointX: number, pointY: number, zIndex: number})
```

``` javascript
/**
 * 隐藏当前模型
 */
public void disappear()
```

``` javascript
/** 执行一个指定的动画
 * @param object: { groupName: 动作组名称
 *                  no: 动作索引. 当前动作组内如果有多个动画, 执行索引指定的那个. 默认为0
 *                  priority: 动画权重(默认2).
 *                  autoIdle: 动作执行完成后是否自动执行idle. 默认true
 *                  autoAppear: 在模型隐藏的前提下执行动画, 是否将模型显示出来并执行动画. 默认true
 *                  fadeInTime: 淡入时间, 默认读model3.json配置表
 *                  fadeOutTime: 淡出时间, 默认读model3.json配置表
 *                  callback: 当前动作执行完毕后触发
 *                }
 * @return Promise<Model>
 */
public Promise startMotion({groupName: string, no?: number, priority?: number, autoIdle?: boolean, autoAppear?: boolean, fadeInTime?: number, fadeOutTime?: number, callback?: () => void})
```

``` javascript
/** 在指定的动画组内随机选择一个动画执行
 * @param groupName: 动画组名称
 * @param priority: 动画权重(默认2)
 * @return Promise<Model>
 */
public Promise startRandomMotion(groupName: string, priority?: number)
```

``` javascript
/** 执行一个动画队列
 * @param objectArray: 同startMotion()参数, 是一个数组
 * @param clear: 为true则清除当前已存在的队列. 否则进行队列追加.  默认false. 
 * @return Promise<Model>
 */
public Promise startMotionQueue([{groupName: string, no?: number, priority?: number, autoIdle?: boolean, callback?: () => void}], clear?: boolean)
```
  
``` javascript
/** 停止全部动作
 * @param object {
 *   clear: 停止动作后是否清除画板. (默认false)
 *   autoIdle: 停止动作后是否执行idle动画 不执行会停留在当前动画最后一帧. 默认true
 * }
 * @return Promise<void>
 */
public Promise stopAllMotions({clear?: boolean, autoIdle?: boolean})
```

``` javascript
/** 用指定的动画组替换默认发呆的动画组. 该动画自动循环
 * @param groupName: 动画组名称
 * @param execImmediately: 是否立即执行该动画 default: true
 */
public void replaceIdleMotion(groupName: string, execImmediately: boolean)
```

``` javascript
/** 设置表情
 * @param expressionId: 表情id(model3.json Expressions字段配置 例: f01)
 */
public void setExpression(expressionId: string)
```

``` javascript
/** 
 * 随机使用一个表情
 */
public void setRandomExpression()
```

``` javascript
/** 
 *  清除画布 并终止默认的绘画动作
 */
public void clear()
```

``` javascript
/** 张嘴
 * @param speed: 嘴巴动态速度. 1为最快. 默认为3
 */
public void mouthOpen(speed: number)
```

``` javascript
/** 
 *  闭嘴
 */
public void mouthClose()
```

``` javascript
/** 使模型的眼睛注视某个坐标点
 *  @param pointX x坐标
 *  @param pointY y坐标
 *  注: 坐标是以模型原点为(0,0)点, 进行象限分布
 *  取值范围±1 例: lootAt(-0.02, 0.1)
 */
public void lookAt(pointX: number, pointY: number)
```

``` javascript
/** 
 *  获取模型可见状态
 *  @return true / false
 */
public boolean getVisible()
```

``` javascript
/** 
 *  获取模型当前状态
 *  @return {visible: boolean, autoIdle: boolean, mouthOpen: boolean, idleMotion: string}
 */
public object getProperty()
```
  
## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
