/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export namespace Live2DCubismFramework {
  /**
   * 矢量类型（变量序列类型）
   */
  export class csmVector<T> {

    public static readonly s_defaultSize = 10; // 容器初始化的默认大小

    public _ptr: T[];    // 容器起始地址
    public _size: number; // 容器中的元素数量
    public _capacity: number; // 集装箱容量
    /**
     * 带参数的构造函数
     * @param iniitalCapacity 初始化后的容量。 数据大小为_capacity * sizeof（T）
     * @param zeroClear 如果为true，则填充初始化时保留的区域为0
     */
    constructor(initialCapacity: number = 0) {
      if (initialCapacity < 1) {
        this._ptr = new Array();
        this._capacity = 0;
        this._size = 0;
      } else {
        this._ptr = new Array(initialCapacity);
        this._capacity = initialCapacity;
        this._size = 0;
      }
    }

    /**
     * 返回索引指定的元素
     */
    public at(index: number): T {
      return this._ptr[index];
    }

    /**
     * 要素をセット
     * @param index 将元素设置为的索引
     * @param value 要设置的元素
     */
    public set(index: number, value: T): void {
      this._ptr[index] = value;
    }

    /**
     * 拿一个容器
     */
    public get(offset: number = 0): T[] {
      const ret: T[] = new Array<T>();
      for (let i = offset; i < this._size; i++) {
        ret.push(this._ptr[i]);
      }
      return ret;
    }

    /**
     * pushBack处理，向容器添加新元素
     * @param value PushBack流程要添加的值
     */
    public pushBack(value: T): void {
      if (this._size >= this._capacity) {
        this.prepareCapacity(this._capacity == 0 ? csmVector.s_defaultSize : this._capacity * 2);
      }

      this._ptr[this._size++] = value;
    }

    /**
     * 释放容器的所有元素
     */
    public clear(): void {
      this._ptr.length = 0;
      this._size = 0;
    }

    /**
     * 返回容器中的元素数
     * @return 容器中的元素数
     */
    public getSize(): number {
      return this._size;
    }

    /**
     * 对容器的所有元素执行替换处理
     * @param newSize 分配过程后的大小
     * @param value 要分配给元素的值
     */
    public assign(newSize: number, value: T): void {
      const curSize = this._size;

      if (curSize < newSize) {
        this.prepareCapacity(newSize);  // capacity更新
      }

      for (let i: number = 0; i < newSize; i++) {
        this._ptr[i] = value;
      }

      this._size = newSize;
    }

    /**
     * 更改大小
     */
    public resize(newSize: number, value: T): void {
      this.updateSize(newSize, value, true);
    }

    /**
     * 更改大小
     */
    public updateSize(newSize: number, value: any = null, callPlacementNew: boolean = true): void {
      const curSize: number = this._size;

      if (curSize < newSize) {
        this.prepareCapacity(newSize);  // capacity更新

        if (callPlacementNew) {
          for (let i: number = this._size; i < newSize; i++) {
            if (typeof value == 'function') {
              this._ptr[i] = JSON.parse(JSON.stringify(new value()));
            } else {
              this._ptr[i] = value;
            }
          }
        } else {
          for (let i: number = this._size; i < newSize; i++) {
            this._ptr[i] = value;
          }
        }
      } else {
        // newSize <= this._size
        // ---
        const sub = this._size - newSize;
        this._ptr.splice(this._size - sub, sub);    // 丢弃因为没有必要
      }
      this._size = newSize;
    }

    /**
     * 将容器元素插入容器中
     * @param position 插入位置
     * @param begin　容器的起始位置要插入
     * @param end 要插入的容器的最终位置
     */
    public insert(position: iterator<T>, begin: iterator<T>, end: iterator<T>): void {
      let dstSi: number = position._index;
      const srcSi: number = begin._index;
      const srcEi: number = end._index;

      const addCount: number = srcEi - srcSi;

      this.prepareCapacity(this._size + addCount);

      // 通过转移现有数据来插入来创建差距
      const addSize = this._size - dstSi;
      if (addSize > 0) {
        for (let i: number = 0; i < addSize; i++) {
          this._ptr.splice(dstSi + i, 0, null as any);
        }
      }

      for (let i: number = srcSi; i < srcEi; i++ , dstSi++) {
        this._ptr[dstSi] = begin._vector._ptr[i];
      }

      this._size = this._size + addCount;
    }

    /**
     * 从容器中删除索引指定的元素
     * @param index 指数值
     * @return true 执行删除
     * @return false 超出范围
     */
    public remove(index: number): boolean {
      if (index < 0 || this._size <= index) {
        return false;   // 超出范围
      }

      this._ptr.splice(index, 1);
      --this._size;

      return true;
    }

    /**
     * 从容器中删除元素并移动其他元素
     * @param ite 要删除的元素
     */
    public erase(ite: iterator<T>): iterator<T> {
      const index: number = ite._index;
      if (index < 0 || this._size <= index) {
        return ite; // 超出范围
      }

      // 删除
      this._ptr.splice(index, 1);
      --this._size;

      const ite2: iterator<T> = new iterator<T>(this, index);   // 结束
      return ite2;
    }

    /**
     * 确保集装箱容量
     * @param newSize 新产能。 如果参数值小于当前大小，则不执行任何操作。
     */
    public prepareCapacity(newSize: number): void {
      if (newSize > this._capacity) {
        if (this._capacity == 0) {
          this._ptr = new Array(newSize);
          this._capacity = newSize;
        } else {
          this._ptr.length = newSize;
          this._capacity = newSize;
        }
      }
    }

    /**
     * 返回容器的第一个元素
     */
    public begin(): iterator<T> {
      const ite: iterator<T> = (this._size == 0)
        ? this.end()
        : new iterator<T>(this, 0);
      return ite;
    }

    /**
     * 返回容器的终端元素
     */
    public end(): iterator<T> {
      const ite: iterator<T> = new iterator<T>(this, this._size);
      return ite;
    }

    public getOffset(offset: number): csmVector<T> {
      const newVector = new csmVector<T>();
      newVector._ptr = this.get(offset);
      newVector._size = this.get(offset).length;
      newVector._capacity = this.get(offset).length;

      return newVector;
    }
  }

  export class iterator<T> {

    public _index: number; // 集装箱指数值
    public _vector: csmVector<T>;  // 容器
    /**
     * 构造函数
     */
    public constructor(v?: csmVector<T>, index?: number) {
      this._vector = (v != undefined) ? v : null as any;
      this._index = (index != undefined) ? index : 0;
    }

    /**
     * 换人
     */
    public set(ite: iterator<T>): iterator<T> {
      this._index = ite._index;
      this._vector = ite._vector;
      return this;
    }

    /**
     * 前缀++操作
     */
    public preIncrement(): iterator<T> {
      ++this._index;
      return this;
    }

    /**
     * 前言 -- 操作
     */
    public preDecrement(): iterator<T> {
      --this._index;
      return this;
    }

    /**
     * Postfix ++运算符
     */
    public increment(): iterator<T> {
      const iteold = new iterator<T>(this._vector, this._index++);
      this._vector = iteold._vector;
      this._index = iteold._index;
      return this;
    }

    /**
     * 後置き--演算子
     */
    public decrement(): iterator<T> {
      const iteold = new iterator<T>(this._vector, this._index--);  // 古い値を保存
      this._vector = iteold._vector;
      this._index = iteold._index;
      return this;
    }

    /**
     * ptr
     */
    public ptr(): T {
      return this._vector._ptr[this._index];
    }

    /**
     * =运算符重载
     */
    public substitution(ite: iterator<T>): iterator<T> {
      this._index = ite._index;
      this._vector = ite._vector;
      return this;
    }

    /**
     * ！=运算符重载
     */
    public notEqual(ite: iterator<T>): boolean {
      return (this._index != ite._index) || (this._vector != ite._vector);
    }
  }
}
