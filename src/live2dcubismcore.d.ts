declare namespace Live2DCubismCore {
    /** Cubism version identifier. */
    type csmVersion = number;
    /** Log handler.
     *
     * @param message Null-terminated string message to log.
     */
    type csmLogFunction = (message: string) => void;
    /** Cubism version. */
    class Version {
        /**
         * Queries Core version.
         *
         * @return Core version.
         */
        public static csmGetVersion(): csmVersion;
        private constructor();
    }
    /** Cubism logging. */
    class Logging {
        /**
         * Sets log handler.
         *
         * @param handler  Handler to use.
         */
        public static csmSetLogFunction(handler: csmLogFunction): void;
        /**
         * Queries log handler.
         *
         * @return Log handler.
         */
        public static csmGetLogFunction(): csmLogFunction;
        private static logFunction;
        /**
         * Wrap log function.
         *
         * @param messagePtr number
         *
         * @return string
         */
        private static wrapLogFunction;
        private constructor();
    }
    /** Cubism moc. */
    class Moc {
        /** Creates [[Moc]] from [[ArrayBuffer]].
         *
         * @param buffer Array buffer
         *
         * @return [[Moc]] on success; [[null]] otherwise.
         */
        public static fromArrayBuffer(buffer: ArrayBuffer): Moc;
        /** Native moc. */
        public _ptr: number;
        /**
         * Initializes instance.
         *
         * @param mocBytes Moc bytes.
         */
        private constructor();
        /** Releases instance. */
        public _release(): void;
    }
    /** Cubism model. */
    class Model {
        /**
         * Creates [[Model]] from [[Moc]].
         *
         * @param moc Moc
         *
         * @return [[Model]] on success; [[null]] otherwise.
         */
        public static fromMoc(moc: Moc): Model;
        /** Parameters. */
        public parameters: Parameters;
        /** Parts. */
        public parts: Parts;
        /** Drawables. */
        public drawables: Drawables;
        /** Canvas information. */
        public canvasinfo: CanvasInfo;
        /** Native model. */
        public _ptr: number;
        /**
         * Initializes instance.
         *
         * @param moc Moc
         */
        private constructor();
        /** Updates instance. */
        public update(): void;
        /** Releases instance. */
        public release(): void;
    }
    /** Canvas information interface. */
    class CanvasInfo {
        /** Width of native model canvas. */
        public CanvasWidth: number;
        /** Height of native model canvas. */
        public CanvasHeight: number;
        /** Coordinate origin of X axis. */
        public CanvasOriginX: number;
        /** Coordinate origin of Y axis. */
        public CanvasOriginY: number;
        /** Pixels per unit of native model. */
        public PixelsPerUnit: number;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model pointer.
         */
        constructor(modelPtr: number);
    }
    /** Cubism model parameters */
    class Parameters {
        /** Parameter count. */
        public count: number;
        /** Parameter IDs. */
        public ids: string[];
        /** Minimum parameter values. */
        public minimumValues: Float32Array;
        /** Maximum parameter values. */
        public maximumValues: Float32Array;
        /** Default parameter values. */
        public defaultValues: Float32Array;
        /** Parameter values. */
        public values: Float32Array;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model.
         */
        constructor(modelPtr: number);
    }
    /** Cubism model parts */
    class Parts {
        /** Part count. */
        public count: number;
        /** Part IDs. */
        public ids: string[];
        /** Opacity values. */
        public opacities: Float32Array;
        /** Part's parent part indices. */
        public parentIndices: Int32Array;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model.
         */
        constructor(modelPtr: number);
    }
    /** Cubism model drawables */
    class Drawables {
        /** Drawable count. */
        public count: number;
        /** Drawable IDs. */
        public ids: string[];
        /** Constant drawable flags. */
        public constantFlags: Uint8Array;
        /** Dynamic drawable flags. */
        public dynamicFlags: Uint8Array;
        /** Drawable texture indices. */
        public textureIndices: Int32Array;
        /** Drawable draw orders. */
        public drawOrders: Int32Array;
        /** Drawable render orders. */
        public renderOrders: Int32Array;
        /** Drawable opacities. */
        public opacities: Float32Array;
        /** Mask count for each drawable. */
        public maskCounts: Int32Array;
        /** Masks for each drawable. */
        public masks: Int32Array[];
        /** Number of vertices of each drawable. */
        public vertexCounts: Int32Array;
        /** 2D vertex position data of each drawable. */
        public vertexPositions: Float32Array[];
        /** 2D texture coordinate data of each drawables. */
        public vertexUvs: Float32Array[];
        /** Number of triangle indices for each drawable. */
        public indexCounts: Int32Array;
        /** Triangle index data for each drawable. */
        public indices: Uint16Array[];
        /** Native model. */
        private _modelPtr;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model.
         */
        constructor(modelPtr: number);
        /** Resets all dynamic drawable flags.. */
        public resetDynamicFlags(): void;
    }
    /** Utility functions. */
    class Utils {
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasBlendAdditiveBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasBlendMultiplicativeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasIsDoubleSidedBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasIsVisibleBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasVisibilityDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasOpacityDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasDrawOrderDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasRenderOrderDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        public static hasVertexPositionsDidChangeBit(bitfield: number): boolean;
    }
}
