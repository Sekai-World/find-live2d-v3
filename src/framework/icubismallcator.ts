/*
* Copyright(c) Live2D Inc. All rights reserved.
*
* Use of this source code is governed by the Live2D Open Software license
* that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
*/

export namespace Live2DCubismFramework {
    /**
     * 一个抽象内存分配的类
     *
     * 在平台端实现内存分配/释放处理
     * 从框架调用的接口
     */
    export abstract class ICubismAllocator {
        /**
         * 保留没有对齐约束的堆内存
         * @param size 要保留的字节数
         * @return 成功分配内存的地址。 否则返回'0'
         */
        public abstract allocate(size: number): any;

        /**
         * 没有对齐约束的空闲堆内存
         * @param memory 要释放的内存地址
         */
        public abstract deallocate(memory: any): void;

        /**
         * 使用对齐约束保留堆内存。
         * @param size 要保留的字节数
         * @param alignment 内存块的对齐宽度
         * @return 成功分配内存的地址。 否则返回'0'
         */
        public abstract  allocateAligned(size: number, alignment: number): any;

        /**
         * 具有对齐约束的空闲堆内存
         * @param alignedMemory 要释放的内存地址
         */
        public abstract deallocateAligned(alignedMemory: any): void;
    }
}
